import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Button } from '../../../shared/components/widgets/button/button';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';

@Component({
  selector: 'app-order-tracking',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Breadcrumb, Button],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss',
})
export class OrderTracking {
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  public form: FormGroup;

  public breadcrumb: IBreadcrumb = {
    title: 'Order Tracking',
    items: [{ label: 'Order Tracking', active: true }],
  };

  constructor() {
    this.form = this.formBuilder.group({
      order_number: new FormControl('', [Validators.required]),
      email_or_phone: new FormControl('', [Validators.required]),
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      void this.router.navigate(['order/details'], { queryParams: this.form.value });
    }
  }
}
