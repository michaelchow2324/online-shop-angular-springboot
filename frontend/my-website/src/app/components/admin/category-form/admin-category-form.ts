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
import { AdminCategory } from "../../../shared/interface/admin-category.interface";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";
import { AdminCategoryService } from "../../../shared/services/admin-category.service";
import { AuthService } from "../../../shared/services/auth.service";
import { GetCategoriesAction } from "../../../shared/store/action/category.action";
import { httpErrorMessage } from "../../../shared/utils/http-error-message";

@Component({
  selector: "app-admin-category-form",
  imports: [RouterModule, Breadcrumb, ReactiveFormsModule, AdminNav],
  templateUrl: "./admin-category-form.html",
  styleUrl: "./admin-category-form.scss",
})
export class AdminCategoryForm implements OnDestroy {
  private adminCategoryService = inject(AdminCategoryService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  public categoryId: number | null = null;
  public saving = false;
  public uploading = false;
  public error: string | null = null;
  public imageUrl: string | null = null;
  public pendingFile: File | null = null;
  public pendingPreviewUrl: string | null = null;

  public form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    slug: [""],
    description: [""],
    sortOrder: [100, [Validators.required, Validators.min(0)]],
    active: [true],
  });

  public get breadcrumb(): IBreadcrumb {
    return {
      title: this.categoryId ? "Edit category" : "Add category",
      items: [
        { label: "Admin", active: false, url: "/admin/orders" },
        { label: "Categories", active: false, url: "/admin/categories" },
        {
          label: this.categoryId ? "Edit" : "Add",
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
      const idParam = this.route.snapshot.paramMap.get("id");
      if (idParam) {
        const id = Number(idParam);
        if (!Number.isFinite(id) || id <= 0) {
          this.error = "Invalid category id.";
          return;
        }
        this.categoryId = id;
        this.loadCategory(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearPending();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = "";
    if (!file) {
      return;
    }
    if (this.categoryId) {
      void this.uploadExisting(file);
      return;
    }
    this.clearPending();
    this.pendingFile = file;
    this.pendingPreviewUrl = URL.createObjectURL(file);
  }

  removePending(): void {
    this.clearPending();
  }

  deleteImage(): void {
    if (!this.categoryId || !this.imageUrl) {
      return;
    }
    this.uploading = true;
    this.error = null;
    this.adminCategoryService
      .deleteImage(this.categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (category) => {
          this.uploading = false;
          this.applyCategory(category);
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
      description: string;
      sortOrder: number;
      active: boolean;
    };
    const body = {
      name: raw.name.trim(),
      slug: raw.slug.trim() || undefined,
      description: raw.description.trim() || null,
      sortOrder: Number(raw.sortOrder),
      active: !!raw.active,
    };

    try {
      const wasCreate = !this.categoryId;
      if (this.categoryId) {
        const updated = await firstValueFrom(
          this.adminCategoryService.update(this.categoryId, body),
        );
        this.applyCategory(updated);
      } else {
        const created = await firstValueFrom(
          this.adminCategoryService.create(body),
        );
        this.applyCategory(created);
      }

      if (this.pendingFile && this.categoryId) {
        const withImage = await firstValueFrom(
          this.adminCategoryService.uploadImage(this.categoryId, this.pendingFile),
        );
        this.applyCategory(withImage);
        this.clearPending();
      }

      this.saving = false;
      this.store.dispatch(new GetCategoriesAction());
      if (wasCreate && this.categoryId) {
        void this.router.navigateByUrl(`/admin/categories/${this.categoryId}`, {
          replaceUrl: true,
        });
      }
    } catch (err) {
      this.saving = false;
      this.error = this.readApiMessage(err as HttpErrorResponse);
    }
  }

  private loadCategory(id: number): void {
    this.adminCategoryService
      .get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (category) => this.applyCategory(category),
        error: (err: HttpErrorResponse) => {
          this.error = this.readApiMessage(err);
        },
      });
  }

  private applyCategory(category: AdminCategory): void {
    this.categoryId = category.id;
    this.imageUrl = category.category_image?.original_url || null;
    this.form.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      sortOrder: category.sortOrder ?? 100,
      active: category.status,
    });
  }

  private async uploadExisting(file: File): Promise<void> {
    if (!this.categoryId) {
      return;
    }
    this.uploading = true;
    this.error = null;
    try {
      const updated = await firstValueFrom(
        this.adminCategoryService.uploadImage(this.categoryId, file),
      );
      this.applyCategory(updated);
    } catch (err) {
      this.error = this.readApiMessage(err as HttpErrorResponse);
    } finally {
      this.uploading = false;
    }
  }

  private clearPending(): void {
    if (this.pendingPreviewUrl) {
      URL.revokeObjectURL(this.pendingPreviewUrl);
    }
    this.pendingFile = null;
    this.pendingPreviewUrl = null;
  }

  private readApiMessage(err: unknown): string {
    return httpErrorMessage(err, {
      unauthorized: "Admin access required. Log in as an ADMIN user.",
    });
  }
}
