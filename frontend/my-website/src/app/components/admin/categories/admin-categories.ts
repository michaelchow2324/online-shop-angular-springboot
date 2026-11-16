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
import { AdminCategory } from "../../../shared/interface/admin-category.interface";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";
import { AdminCategoryService } from "../../../shared/services/admin-category.service";
import { AuthService } from "../../../shared/services/auth.service";
import { GetCategoriesAction } from "../../../shared/store/action/category.action";
import { httpErrorMessage } from "../../../shared/utils/http-error-message";

@Component({
  selector: "app-admin-categories",
  imports: [RouterModule, Breadcrumb, NoData, FormsModule, AdminNav],
  templateUrl: "./admin-categories.html",
  styleUrl: "./admin-categories.scss",
})
export class AdminCategories {
  private adminCategoryService = inject(AdminCategoryService);
  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private router = inject(Router);
  private authService = inject(AuthService);

  public breadcrumb: IBreadcrumb = {
    title: "Admin categories",
    items: [
      { label: "Admin", active: false, url: "/admin/orders" },
      { label: "Categories", active: true },
    ],
  };

  public categories: AdminCategory[] = [];
  public loading = true;
  public error: string | null = null;
  public statusFilter: "all" | "active" | "disabled" = "all";
  public search = "";
  public page = 0;
  public totalPages = 0;
  public totalElements = 0;
  public togglingId: number | null = null;

  constructor() {
    afterNextRender(() => {
      if (!hasAdminSession(this.store)) {
        this.authService.redirectUrl = "/admin/categories";
        this.authService.isLogin = true;
        void this.router.navigateByUrl("/");
        return;
      }
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    const active =
      this.statusFilter === "active"
        ? true
        : this.statusFilter === "disabled"
          ? false
          : null;
    this.adminCategoryService
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
          this.categories = result.content || [];
          this.totalPages = result.totalPages || 0;
          this.totalElements = result.totalElements || 0;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.categories = [];
          this.error = this.readApiMessage(err);
        },
      });
  }

  setStatus(filter: "all" | "active" | "disabled"): void {
    this.statusFilter = filter;
    this.page = 0;
    this.loadCategories();
  }

  submitSearch(): void {
    this.page = 0;
    this.loadCategories();
  }

  nextPage(): void {
    if (this.page + 1 >= this.totalPages) {
      return;
    }
    this.page += 1;
    this.loadCategories();
  }

  prevPage(): void {
    if (this.page === 0) {
      return;
    }
    this.page -= 1;
    this.loadCategories();
  }

  toggleActive(category: AdminCategory): void {
    this.togglingId = category.id;
    this.adminCategoryService
      .setActive(category.id, !category.status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.togglingId = null;
          this.categories = this.categories.map((row) =>
            row.id === updated.id ? { ...row, ...updated } : row,
          );
          this.store.dispatch(new GetCategoriesAction());
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
