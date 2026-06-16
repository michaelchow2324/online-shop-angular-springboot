import { isPlatformBrowser } from '@angular/common';
import { Component, inject, input, Input, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { DeliveryReturnModal } from '../../../../../../shared/components/widgets/modal/delivery-return-modal/delivery-return-modal';
import { QuestionModal } from '../../../../../../shared/components/widgets/modal/question-modal/question-modal';
import { SizeChartModal } from '../../../../../../shared/components/widgets/modal/size-chart-modal/size-chart-modal';
import { IAttachment } from '../../../../../../shared/interface/attachment.interface';
import { IProduct, IVariation } from '../../../../../../shared/interface/product.interface';
import { IOption } from '../../../../../../shared/interface/theme-option.interface';
import { CurrencySymbolPipe } from '../../../../../../shared/pipe/currency.pipe';
import { ThemeOptionState } from '../../../../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-product-details',
  imports: [NgbModule, CurrencySymbolPipe, RouterModule, TranslateModule],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.scss'],
})
export class ProductDetails {
  private platformId = inject<Object>(PLATFORM_ID);
  private modal = inject(NgbModal);

  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  @Input() product: IProduct;
  @Input() selectedVariation: IVariation | null | IProduct;

  readonly option = input<IOption | null>();

  public viewsCount: number = 30;
  public ordersCount: number = 10;
  public policy: string;
  private countsInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.themeOptions$.subscribe(option => {
      this.policy = option?.product?.shipping_and_return;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && changes['product'].currentValue) {
      this.selectedVariation = null;
      this.product = changes['product'].currentValue;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.setupIntervals();
    }
  }

  ngOnDestroy() {
    if (this.countsInterval) {
      clearInterval(this.countsInterval);
    }
  }

  setupIntervals() {
    // Example intervals for demonstration, adjust as needed
    this.countsInterval = setInterval(() => {
      let encourage_max_view_count = this.option()?.product?.encourage_max_view_count ?? 100;
      this.viewsCount = Math.floor(Math.random() * encourage_max_view_count) + 1;
    }, 50000);

    this.countsInterval = setInterval(() => {
      let encourage_max_order_count = this.option()?.product?.encourage_max_order_count ?? 100;
      this.ordersCount = Math.floor(Math.random() * encourage_max_order_count) + 1;
    }, 60000);
  }

  openModal(type: string, value: IAttachment | string | IProduct) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (type == 'sizeChart') {
      const sizeChart = this.modal.open(SizeChartModal, {
        size: 'lg',
        centered: true,
        windowClass: 'theme-modal-2',
      });
      sizeChart.componentInstance.image = value;
    } else if (type == 'delivery') {
      const deliveryModal = this.modal.open(DeliveryReturnModal, {
        size: 'lg',
        centered: true,
        windowClass: 'theme-modal-2',
      });
      deliveryModal.componentInstance.policy = value;
    } else if (type == 'question') {
      const questionModal = this.modal.open(QuestionModal, {
        centered: true,
        windowClass: 'theme-modal-2',
      });
      questionModal.componentInstance.product = value;
    }
  }
}
