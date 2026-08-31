import { Routes } from '@angular/router';

export const admin: Routes = [
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders/admin-orders').then(m => m.AdminOrders),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./product-form/admin-product-form').then(m => m.AdminProductForm),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./product-form/admin-product-form').then(m => m.AdminProductForm),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/admin-products').then(m => m.AdminProducts),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'orders',
  },
];
