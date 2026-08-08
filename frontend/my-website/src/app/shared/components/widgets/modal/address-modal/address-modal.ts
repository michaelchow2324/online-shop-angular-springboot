import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { CA_POSTAL_PATTERN, CANADIAN_PROVINCES } from '../../../../data/canadian-provinces';
import {
  CustomerAddress,
  UpsertAddressRequest,
} from '../../../../interface/customer-address.interface';
import { CreateAddressAction, UpdateAddressAction } from '../../../../store/action/account.action';
import { Button } from '../../button/button';

@Component({
  selector: 'app-address-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Button],
  templateUrl: './address-modal.html',
  styleUrl: './address-modal.scss',
})
export class AddressModal implements OnInit {
  public modal = inject(NgbActiveModal);
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  @Input() userAddress: CustomerAddress | null = null;

  public form: FormGroup;
  public provinces = CANADIAN_PROVINCES;
  public address: CustomerAddress | null = null;

  constructor() {
    this.form = this.formBuilder.group({
      label: new FormControl('Home', [Validators.required, Validators.maxLength(64)]),
      recipientName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
      phone: new FormControl('', [Validators.maxLength(64)]),
      line1: new FormControl('', [Validators.required, Validators.maxLength(255)]),
      line2: new FormControl('', [Validators.maxLength(255)]),
      city: new FormControl('', [Validators.required, Validators.maxLength(128)]),
      province: new FormControl('', [Validators.required]),
      postal: new FormControl('', [Validators.required, Validators.pattern(CA_POSTAL_PATTERN)]),
      isDefault: new FormControl(false),
    });
  }

  ngOnInit() {
    if (this.userAddress) {
      this.patchForm(this.userAddress);
    }
  }

  patchForm(value: CustomerAddress) {
    this.address = value;
    this.form.patchValue({
      label: value.label,
      recipientName: value.recipientName,
      phone: value.phone ?? '',
      line1: value.line1,
      line2: value.line2 ?? '',
      city: value.city,
      province: value.province,
      postal: value.postal,
      isDefault: value.isDefault,
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: UpsertAddressRequest = {
      label: String(raw.label).trim(),
      recipientName: String(raw.recipientName).trim(),
      phone: String(raw.phone || '').trim() || null,
      line1: String(raw.line1).trim(),
      line2: String(raw.line2 || '').trim() || null,
      city: String(raw.city).trim(),
      province: String(raw.province).trim().toUpperCase(),
      postal: this.normalizePostal(String(raw.postal)),
      country: 'CA',
      isDefault: !!raw.isDefault,
    };

    const action = this.address
      ? new UpdateAddressAction(payload, this.address.id)
      : new CreateAddressAction(payload);

    this.store.dispatch(action).subscribe({
      complete: () => {
        this.modal.close('saved');
      },
    });
  }

  private normalizePostal(postal: string): string {
    const compact = postal.replace(/\s+/g, '').toUpperCase();
    if (compact.length === 6) {
      return `${compact.slice(0, 3)} ${compact.slice(3)}`;
    }
    return postal.trim().toUpperCase();
  }
}
