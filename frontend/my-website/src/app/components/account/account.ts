import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Sidebar } from './sidebar/sidebar';
import { Breadcrumb } from '../../shared/components/widgets/breadcrumb/breadcrumb';
import { Loader } from '../../shared/components/widgets/loader/loader';
import { IBreadcrumb } from '../../shared/interface/breadcrumb.interface';
import { AccountService } from '../../shared/services/account.service';
import { GetNotificationAction } from '../../shared/store/action/notification.action';
import { LoaderState } from '../../shared/store/state/loader.state';

@Component({
  selector: 'app-account',
  imports: [RouterModule, TranslateModule, Breadcrumb, Sidebar, Loader, AsyncPipe],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  private store = inject(Store);
  private router = inject(Router);
  private accountService = inject(AccountService);

  public breadcrumb: IBreadcrumb = {
    title: 'Dashboard',
    items: [{ label: 'Dashboard', active: false }],
  };

  loadingStatus$: Observable<boolean> = inject(Store).select(
    LoaderState.status,
  ) as Observable<boolean>;

  constructor() {
    this.store.dispatch(new GetNotificationAction());
    this.router.events.subscribe(() => {
      this.breadcrumb.title = this.router?.url?.split('?')[0]?.split('/')?.pop()!;
      if (this.router?.url.includes('order/details')) {
        this.breadcrumb.title = 'Order';
      }
      this.breadcrumb.items = [];
      this.breadcrumb.items.push({ label: this.breadcrumb.title, active: false });
    });
  }

  openMenu() {
    this.accountService.isOpenMenu = true;
  }
}
