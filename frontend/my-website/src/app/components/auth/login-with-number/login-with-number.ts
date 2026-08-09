import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { Alert } from '../../../shared/components/widgets/alert/alert';
import { Button } from '../../../shared/components/widgets/button/button';
import { CANADA_DIAL_DIGITS, CANADA_DIAL_DISPLAY } from '../../../shared/data/country-code';
import { LoginWithNumberAction } from '../../../shared/store/action/auth.action';

@Component({
  selector: 'app-login-with-number',
  imports: [TranslateModule, Button, Alert, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-with-number.html',
  styleUrl: './login-with-number.scss',
})
export class LoginWithNumber {
  private formBuilder = inject(FormBuilder);
  private store = inject(Store);

  public form: FormGroup;
  public canadaDial = CANADA_DIAL_DISPLAY;

  readonly activeForm = output<string>();

  constructor() {
    this.form = this.formBuilder.group({
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
    });
  }

  sendOtp() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      this.store
        .dispatch(
          new LoginWithNumberAction({
            ...raw,
            country_code: CANADA_DIAL_DIGITS,
          }),
        )
        .subscribe({
          complete: () => {
            this.activeForm.emit('numberOtp');
          },
        });
    }
  }

  backForm() {
    this.activeForm.emit('login');
  }
}
