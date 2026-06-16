import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { IProduct, IProductModel } from '../../../interface/product.interface';
import { ProductState } from '../../../store/state/product.state';

@Component({
  selector: 'app-recent-purchase-popup',
  imports: [TranslateModule, RouterModule],
  templateUrl: './recent-purchase-popup.html',
  styleUrls: ['./recent-purchase-popup.scss'],
})
export class RecentPurchasePopup implements OnInit, OnDestroy {
  private platformId = inject<Object>(PLATFORM_ID);

  relatesProduct$: Observable<IProduct[]> = inject(Store).select(ProductState.relatedProducts);
  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);

  public product: IProduct | null = null;
  public show: boolean = false;
  public min: number = 10;
  public popup_enable: boolean = true;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private subscription: Subscription = new Subscription();
  private isInitialized: boolean = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.isInitialized) {
      this.isInitialized = true;
      if (this.popup_enable && window.innerWidth > 768) {
        this.intervalId = setInterval(() => {
          this.show = true;
          this.min = Math.floor(Math.random() * 60) + 1;
          this.randomlySelectProduct();
          setTimeout(() => {
            this.show = false;
          }, 5000);
        }, 20000);
      }
    }
  }

  randomlySelectProduct() {
    this.subscription.add(
      this.product$.subscribe(product => {
        if (!product.data.length) {
          this.relatesProducts();
        } else {
          const randomIndex = Math.floor(Math.random() * product.data.length);
          this.product = product.data[randomIndex];
        }
      }),
    );
  }

  relatesProducts() {
    this.subscription.add(
      this.relatesProduct$.subscribe(products => {
        const randomIndex = Math.floor(Math.random() * products.length);
        this.product = products[randomIndex];
      }),
    );
  }

  closePopup() {
    this.popup_enable = false;
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.subscription.unsubscribe();
  }
}
