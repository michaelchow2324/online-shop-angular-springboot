import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Select2Data, Select2Module } from 'ng-select2-component';

import { IProduct } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { SendRefundRequestAction } from '../../../../store/action/refund.action';
import { Button } from '../../button/button';

@Component({
  selector: 'app-refund-modal',
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    Select2Module,
    CurrencySymbolPipe,
    Button,
  ],
  templateUrl: './refund-modal.html',
  styleUrl: './refund-modal.scss',
})
export class RefundModal {
  modalService = inject(NgbActiveModal);
  private store = inject(Store);

  readonly productDetails = input<IProduct>();
  readonly orderId = input<number>();

  public product: IProduct;
  public form: FormGroup;

  public option: Select2Data = [
    {
      label: 'Wallet',
      value: 'wallet',
    },
    {
      label: 'Paypal',
      value: 'paypal',
    },
    {
      label: 'Bank',
      value: 'bank',
    },
  ];

  constructor() {
    this.form = new FormGroup({
      order_id: new FormControl('', [Validators.required]),
      reason: new FormControl('', [Validators.required]),
      payment_type: new FormControl('', [Validators.required]),
      product_id: new FormControl(),
    });
  }

  ngOnInit() {
    if (this.form) {
      this.form.controls['order_id'].setValue(this.orderId());
      this.form.get('product_id')?.patchValue(this.productDetails()?.id);
    }
  }

  sendRequest() {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.store.dispatch(new SendRefundRequestAction(this.form.value)).subscribe({
        complete: () => {
          this.form.reset();
          this.modalService.close();
        },
      });
    }
  }
}
