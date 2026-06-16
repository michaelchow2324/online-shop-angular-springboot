import { Routes } from '@angular/router';

export const account: Routes = [
  {
    path: '',
    loadComponent: () => import('./account').then(m => m.Account),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notification/notification').then(m => m.Notification),
      },
      {
        path: 'bank-details',
        loadComponent: () => import('./bank-details/bank-details').then(m => m.BankDetails),
      },
      {
        path: 'wallet',
        loadComponent: () => import('./wallet/wallet').then(m => m.Wallet),
      },
      {
        path: 'point',
        loadComponent: () => import('./point/point').then(m => m.Point),
      },
      {
        path: 'order',
        loadComponent: () => import('./orders/orders').then(m => m.Orders),
      },
      {
        path: 'order/details/:id',
        loadComponent: () => import('./orders/details/details').then(m => m.Details),
      },
      {
        path: 'downloads',
        loadComponent: () => import('./downloads/downloads').then(m => m.Downloads),
      },
      {
        path: 'refund',
        loadComponent: () => import('./refund/refund').then(m => m.Refund),
      },
      {
        path: 'addresses',
        loadComponent: () => import('./addresses/addresses').then(m => m.Addresses),
      },
    ],
  },
];
