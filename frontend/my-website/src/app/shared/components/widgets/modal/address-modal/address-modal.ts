import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
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
import { Select2Data, Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { map, Observable } from 'rxjs';

import { countryCodes } from '../../../../data/country-code';
import { IUserAddress } from '../../../../interface/user.interface';
import { CreateAddressAction, UpdateAddressAction } from '../../../../store/action/account.action';
import { CountryState } from '../../../../store/state/country.state';
import { StateState } from '../../../../store/state/state.state';
import { Button } from '../../button/button';

@Component({
  selector: 'app-address-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Select2Module, Button, AsyncPipe],
  templateUrl: './address-modal.html',
  styleUrl: './address-modal.scss',
})
export class AddressModal {
  public modal = inject(NgbActiveModal);
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  countries$: Observable<Select2Data> = inject(Store).select(CountryState.countries);

  @Input() userAddress: IUserAddress;

  public form: FormGroup;
  public states$: Observable<Select2Data>;
  public address: IUserAddress | null;
  public codes = countryCodes;

  constructor() {
    this.form = this.formBuilder.group({
      title: new FormControl('', [Validators.required]),
      street: new FormControl('', [Validators.required]),
      state_id: new FormControl('', [Validators.required]),
      country_id: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [Validators.required]),
      country_code: new FormControl('91', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
    });
  }

  ngOnInit() {
    const userAddress = this.userAddress;
    if (userAddress) {
      this.patchForm(userAddress);
    }
  }
  countryChange(data: Select2UpdateEvent) {
    if (data && data?.value) {
      this.states$ = this.store
        .select(StateState.states)
        .pipe(map(filterFn => filterFn(+data?.value)));
      if (!this.address) this.form.controls['state_id'].setValue('');
    } else {
      this.form.controls['state_id'].setValue('');
    }
  }

  patchForm(value?: IUserAddress) {
    if (value) {
      this.address = value;
      this.form.patchValue({
        user_id: value?.user_id,
        title: value?.title,
        street: value?.street,
        country_id: value?.country_id,
        state_id: value?.state_id,
        city: value?.city,
        pincode: value?.pincode,
        country_code: value?.country_code,
        phone: value?.phone,
      });
    } else {
      this.address = null;
      this.form.reset();
      this.form?.controls?.['country_code'].setValue('91');
    }
  }

  submit() {
    this.form.markAllAsTouched();

    let action = new CreateAddressAction(this.form.value);

    if (this.address) {
      action = new UpdateAddressAction(this.form.value, this.address.id);
    }

    if (this.form.valid) {
      this.store.dispatch(action).subscribe({
        complete: () => {
          this.form.reset();
          if (!this.address) {
            this.form?.controls?.['country_code'].setValue('91');
          }
        },
      });
    }
  }
}
