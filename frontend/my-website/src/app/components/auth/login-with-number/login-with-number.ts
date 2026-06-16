import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Select2Module } from 'ng-select2-component';

import { Alert } from '../../../shared/components/widgets/alert/alert';
import { Button } from '../../../shared/components/widgets/button/button';
import { countryCodes } from '../../../shared/data/country-code';
import { LoginWithNumberAction } from '../../../shared/store/action/auth.action';

@Component({
  selector: 'app-login-with-number',
  imports: [Select2Module, TranslateModule, Button, Alert, RouterModule, FormsModule],
  templateUrl: './login-with-number.html',
  styleUrl: './login-with-number.scss',
})
export class LoginWithNumber {
  private formBuilder = inject(FormBuilder);
  private store = inject(Store);

  public form: FormGroup;
  public codes = countryCodes;

  readonly activeForm = output<string>();

  constructor() {
    this.form = this.formBuilder.group({
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
      country_code: new FormControl('91', [Validators.required]),
    });
  }

  sendOtp() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.store.dispatch(new LoginWithNumberAction(this.form.value)).subscribe({
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
