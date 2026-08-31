import { CurrencyPipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { afterNextRender, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

import { Store } from "@ngxs/store";

import { hasAdminSession } from "../../../core/guard/admin.guard";
import { AdminNav } from "../admin-nav/admin-nav";
import { Breadcrumb } from "../../../shared/components/widgets/breadcrumb/breadcrumb";
import { NoData } from "../../../shared/components/widgets/no-data/no-data";
import { AdminProduct } from "../../../shared/interface/admin-product.interface";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";
import { AdminProductService } from "../../../shared/services/admin-product.service";
import { AuthService } from "../../../shared/services/auth.service";
import { httpErrorMessage } from "../../../shared/utils/http-error-message";

@Component({
  selector: "app-admin-products",
  imports: [
    RouterModule,
    Breadcrumb,
    NoData,
    CurrencyPipe,
    FormsModule,
    AdminNav,
  ],
  templateUrl: "./admin-products.html",
  styleUrl: "./admin-products.scss",
})
export class AdminProducts {
  private adminProductService = inject(AdminProductService);
  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private router = inject(Router);
  private authService = inject(AuthService);

  public breadcrumb: IBreadcrumb = {
    title: "Admin products",
    items: [
      { label: "Admin", active: false, url: "/admin/orders" },
      { label: "Products", active: true },
    ],
  };

  public products: AdminProduct[] = [];
  public loading = true;
  public error: string | null = null;
  public statusFilter: "all" | "active" | "disabled" = "all";
  public search = "";
  public page = 0;
  public totalPages = 0;
  public totalElements = 0;
  public togglingId: number | null = null;
  public exporting = false;
  public importing = false;
  public csvFile: File | null = null;
  public imageFiles: File[] = [];
  public notice: string | null = null;
  public importErrors: string[] = [];

  constructor() {
    afterNextRender(() => {
      if (!hasAdminSession(this.store)) {
        this.authService.redirectUrl = "/admin/products";
        this.authService.isLogin = true;
        void this.router.navigateByUrl("/");
        return;
      }
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    const active =
      this.statusFilter === "active"
        ? true
        : this.statusFilter === "disabled"
          ? false
          : null;
    this.adminProductService
      .list({
        page: this.page,
        size: 20,
        q: this.search,
        active,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading = false;
          this.products = result.content || [];
          this.totalPages = result.totalPages || 0;
          this.totalElements = result.totalElements || 0;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.products = [];
          this.error = this.readApiMessage(err);
        },
      });
  }

  setStatus(filter: "all" | "active" | "disabled"): void {
    this.statusFilter = filter;
    this.page = 0;
    this.loadProducts();
  }

  submitSearch(): void {
    this.page = 0;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.page + 1 >= this.totalPages) {
      return;
    }
    this.page += 1;
    this.loadProducts();
  }

  prevPage(): void {
    if (this.page === 0) {
      return;
    }
    this.page -= 1;
    this.loadProducts();
  }

  categoryNames(product: AdminProduct): string {
    return (product.categories || []).map((c) => c.name).join(", ") || "—";
  }

  exportCatalog(): void {
    this.exporting = true;
    this.notice = null;
    this.adminProductService
      .exportCatalog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.exporting = false;
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `catalog-export-${new Date().toISOString().slice(0, 10)}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        },
        error: (err: HttpErrorResponse) => {
          this.exporting = false;
          this.notice = this.readApiMessage(err);
        },
      });
  }

  importHint(): string {
    const csvName = this.csvFile?.name || "no CSV";
    const imageCount = this.imageFiles.length;
    return `${csvName} · ${imageCount} image${imageCount === 1 ? "" : "s"}`;
  }

  onCsvPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.csvFile = input.files?.[0] ?? null;
  }

  onImagesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFiles = input.files ? Array.from(input.files) : [];
  }

  importCatalog(): void {
    if (!this.csvFile || this.importing) {
      return;
    }
    this.importing = true;
    this.notice = null;
    this.importErrors = [];
    this.adminProductService
      .importCatalog(this.csvFile, this.imageFiles)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.importing = false;
          this.notice =
            `Imported ${result.created} new, ${result.updated} updated, ` +
            `${result.imagesUploaded} images uploaded.`;
          this.importErrors = result.errors || [];
          this.loadProducts();
        },
        error: (err: HttpErrorResponse) => {
          this.importing = false;
          this.notice = this.readApiMessage(err);
        },
      });
  }

  toggleActive(product: AdminProduct): void {
    this.togglingId = product.id;
    this.adminProductService
      .setActive(product.id, !product.status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.togglingId = null;
          this.products = this.products.map((row) =>
            row.id === updated.id ? { ...row, ...updated } : row,
          );
        },
        error: (err: HttpErrorResponse) => {
          this.togglingId = null;
          this.error = this.readApiMessage(err);
        },
      });
  }

  private readApiMessage(err: unknown): string {
    return httpErrorMessage(err, {
      unauthorized: "Admin access required. Log in as an ADMIN user.",
    });
  }
}
