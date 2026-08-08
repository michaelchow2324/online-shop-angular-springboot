import { Routes } from '@angular/router';

export const admin: Routes = [
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders/admin-orders').then(m => m.AdminOrders),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'orders',
  },
];
