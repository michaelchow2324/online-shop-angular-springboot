import { HttpErrorResponse } from "@angular/common/http";
import { afterNextRender, Component, DestroyRef, inject, OnDestroy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { Store } from "@ngxs/store";

import { hasAdminSession } from "../../../core/guard/admin.guard";
import { AdminNav } from "../admin-nav/admin-nav";
import { Breadcrumb } from "../../../shared/components/widgets/breadcrumb/breadcrumb";
import {
  AdminProduct,
  AdminProductImage,
} from "../../../shared/interface/admin-product.interface";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";
import { ICategory } from "../../../shared/interface/category.interface";
import { AdminProductService } from "../../../shared/services/admin-product.service";
import { AuthService } from "../../../shared/services/auth.service";
import { CategoryService } from "../../../shared/services/category.service";
import { httpErrorMessage } from "../../../shared/utils/http-error-message";

interface PendingImage {
  file: File;
  previewUrl: string;
  primary: boolean;
}

@Component({
  selector: "app-admin-product-form",
  imports: [RouterModule, Breadcrumb, ReactiveFormsModule, AdminNav],
  templateUrl: "./admin-product-form.html",
  styleUrl: "./admin-product-form.scss",
})
export class AdminProductForm implements OnDestroy {
  private adminProductService = inject(AdminProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  public productId: number | null = null;
  public saving = false;
  public uploading = false;
  public error: string | null = null;
  public categories: ICategory[] = [];
  public selectedCategoryIds = new Set<number>();
  public images: AdminProductImage[] = [];
  public pendingImages: PendingImage[] = [];
  public form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    slug: [""],
    sku: [""],
    price: [null, [Validators.required, Validators.min(0)]],
    description: [""],
    nameZh: [""],
    descriptionZh: [""],
    active: [true],
  });

  public get breadcrumb(): IBreadcrumb {
    return {
      title: this.productId ? "Edit product" : "Add product",
      items: [
        { label: "Admin", active: false, url: "/admin/orders" },
        { label: "Products", active: false, url: "/admin/products" },
        {
          label: this.productId ? "Edit" : "Add",
          active: true,
        },
      ],
    };
  }

  constructor() {
    afterNextRender(() => {
      if (!hasAdminSession(this.store)) {
        this.authService.redirectUrl = this.router.url;
        this.authService.isLogin = true;
        void this.router.navigateByUrl("/");
        return;
      }
      this.loadCategories();
      const idParam = this.route.snapshot.paramMap.get("id");
      if (idParam) {
        const id = Number(idParam);
        if (!Number.isFinite(id) || id <= 0) {
          this.error = "Invalid product id.";
          return;
        }
        this.productId = id;
        this.loadProduct(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearPending();
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCategoryIds.has(id);
  }

  toggleCategory(id: number, checked: boolean): void {
    if (checked) {
      this.selectedCategoryIds.add(id);
    } else {
      this.selectedCategoryIds.delete(id);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    input.value = "";
    if (!files.length) {
      return;
    }
    if (this.productId) {
      void this.uploadExisting(files);
      return;
    }
    for (const file of files) {
      this.pendingImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
        primary: this.pendingImages.length === 0,
      });
    }
  }

  setPendingPrimary(index: number): void {
    this.pendingImages = this.pendingImages.map((item, i) => ({
      ...item,
      primary: i === index,
    }));
  }

  removePending(index: number): void {
    const [removed] = this.pendingImages.splice(index, 1);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    if (removed?.primary && this.pendingImages.length) {
      this.pendingImages[0].primary = true;
    }
  }

  setPrimary(image: AdminProductImage): void {
    if (!this.productId || image.primary) {
      return;
    }
    this.uploading = true;
    this.error = null;
    this.adminProductService
      .setPrimaryImage(this.productId, image.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.uploading = false;
          this.applyProduct(product);
        },
        error: (err: HttpErrorResponse) => {
          this.uploading = false;
          this.error = this.readApiMessage(err);
        },
      });
  }

  deleteImage(image: AdminProductImage): void {
    if (!this.productId) {
      return;
    }
    this.uploading = true;
    this.error = null;
    this.adminProductService
      .deleteImage(this.productId, image.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.uploading = false;
          this.applyProduct(product);
        },
        error: (err: HttpErrorResponse) => {
          this.uploading = false;
          this.error = this.readApiMessage(err);
        },
      });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = null;
    const raw = this.form.getRawValue() as {
      name: string;
      slug: string;
      sku: string;
      price: number;
      description: string;
      nameZh: string;
      descriptionZh: string;
      active: boolean;
    };
    const body = {
      name: raw.name.trim(),
      slug: raw.slug.trim() || undefined,
      sku: raw.sku.trim() || null,
      description: raw.description.trim() || null,
      nameZh: raw.nameZh.trim() || null,
      descriptionZh: raw.descriptionZh.trim() || null,
      price: Number(raw.price),
      active: !!raw.active,
      categoryIds: [...this.selectedCategoryIds],
    };

    try {
      const wasCreate = !this.productId;
      if (this.productId) {
        const updated = await firstValueFrom(
          this.adminProductService.update(this.productId, body),
        );
        this.applyProduct(updated);
      } else {
        const created = await firstValueFrom(this.adminProductService.create(body));
        this.applyProduct(created);
      }

      if (this.pendingImages.length && this.productId) {
        const uploads = [...this.pendingImages].sort(
          (a, b) => Number(b.primary) - Number(a.primary),
        );
        for (const pending of uploads) {
          const latest = await firstValueFrom(
            this.adminProductService.uploadImage(this.productId, pending.file),
          );
          this.applyProduct(latest);
        }
        this.clearPending();
      }

      this.saving = false;
      if (wasCreate && this.productId) {
        void this.router.navigateByUrl(`/admin/products/${this.productId}`, {
          replaceUrl: true,
        });
      }
    } catch (err) {
      this.saving = false;
      this.error = this.readApiMessage(err as HttpErrorResponse);
    }
  }

  private loadCategories(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.categories = result.data || [];
        },
        error: (err: HttpErrorResponse) => {
          this.error = this.readApiMessage(err);
        },
      });
  }

  private loadProduct(id: number): void {
    this.adminProductService
      .get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => this.applyProduct(product),
        error: (err: HttpErrorResponse) => {
          this.error = this.readApiMessage(err);
        },
      });
  }

  private applyProduct(product: AdminProduct): void {
    this.productId = product.id;
    this.images = product.images || [];
    this.selectedCategoryIds = new Set(
      (product.categories || []).map((c) => c.id),
    );
    this.form.patchValue({
      name: product.name,
      slug: product.slug,
      sku: product.sku || "",
      price: product.price,
      description: product.description || "",
      nameZh: product.nameZh || "",
      descriptionZh: product.descriptionZh || "",
      active: product.status,
    });
  }

  private async uploadExisting(files: File[]): Promise<void> {
    if (!this.productId) {
      return;
    }
    this.uploading = true;
    this.error = null;
    try {
      let latest: AdminProduct | null = null;
      for (const file of files) {
        latest = await firstValueFrom(
          this.adminProductService.uploadImage(this.productId, file),
        );
      }
      if (latest) {
        this.applyProduct(latest);
      }
    } catch (err) {
      this.error = this.readApiMessage(err as HttpErrorResponse);
    } finally {
      this.uploading = false;
    }
  }

  private clearPending(): void {
    for (const pending of this.pendingImages) {
      URL.revokeObjectURL(pending.previewUrl);
    }
    this.pendingImages = [];
  }

  private readApiMessage(err: unknown): string {
    return httpErrorMessage(err, {
      unauthorized: "Admin access required. Log in as an ADMIN user.",
    });
  }
}
