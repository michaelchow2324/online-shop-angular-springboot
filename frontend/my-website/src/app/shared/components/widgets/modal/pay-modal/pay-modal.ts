import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IOrder } from '../../../../interface/order.interface';
import { IValues } from '../../../../interface/setting.interface';
import { RePaymentAction } from '../../../../store/action/order.action';
import { SettingState } from '../../../../store/state/setting.state';
import { Button } from '../../button/button';

@Component({
  selector: 'app-pay-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Button, AsyncPipe, UpperCasePipe],
  templateUrl: './pay-modal.html',
  styleUrl: './pay-modal.scss',
})
export class PayModal {
  modalService = inject(NgbActiveModal);
  private store = inject(Store);

  readonly orderDetails = input<IOrder>();

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;

  public order: IOrder;
  public paymentType = new FormControl('', [Validators.required]);

  submit() {
    this.paymentType.markAllAsTouched();
    if (this.paymentType.valid) {
      const data = {
        order_number: this.order.order_number,
        payment_method: this.paymentType.value!,
      };
      this.store.dispatch(new RePaymentAction(data)).subscribe({
        complete: () => {
          this.modalService.close();
        },
      });
    }
  }
}
