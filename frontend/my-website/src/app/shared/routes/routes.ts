import { Routes } from "@angular/router";

import { AuthGuard } from "../../core/guard/auth.guard";
import { adminGuard } from "../../core/guard/admin.guard";

export const content: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("../../components/home/home.routes").then((m) => m.home),
  },
  {
    path: "account",
    loadChildren: () =>
      import("../../components/account/account.routes").then((m) => m.account),
    canActivate: [AuthGuard],
  },
  // Flat route avoids loadChildren + parent canActivate quirks (guide 07)
  {
    path: "admin/orders",
    canActivate: [adminGuard],
    loadComponent: () =>
      import("../../components/admin/orders/admin-orders").then(
        (m) => m.AdminOrders,
      ),
  },
  {
    path: "admin",
    pathMatch: "full",
    redirectTo: "admin/orders",
  },
  {
    path: "",
    loadChildren: () =>
      import("../../components/blog/blog.routes").then((m) => m.blog),
  },
  {
    path: "",
    loadChildren: () =>
      import("../../components/shop/shop.routes").then((m) => m.shop),
  },
  {
    path: "",
    loadChildren: () =>
      import("../../components/page/page.routes").then((m) => m.page),
  },
  {
    path: "**",
    pathMatch: "full",
    loadComponent: () =>
      import("../../components/page/error404/error404").then((m) => m.Error404),
  },
];
