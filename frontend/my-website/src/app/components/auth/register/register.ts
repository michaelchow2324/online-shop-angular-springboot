import { Component, inject, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Alert } from '../../../shared/components/widgets/alert/alert';
import { Button } from '../../../shared/components/widgets/button/button';
import { CANADA_DIAL_DIGITS, CANADA_DIAL_DISPLAY } from '../../../shared/data/country-code';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IValues } from '../../../shared/interface/setting.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import { RegisterAction } from '../../../shared/store/action/auth.action';
import { SettingState } from '../../../shared/store/state/setting.state';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';
import { CustomValidators } from '../../../shared/validator/password-match';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, Button, Alert],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  readonly activeForm = output<string>();

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public form: FormGroup;
  public canadaDial = CANADA_DIAL_DISPLAY;
  public tnc = new FormControl(false, [Validators.requiredTrue]);
  public breadcrumb: IBreadcrumb = {
    title: 'create account',
    items: [
      {
        label: 'create account',
        active: true,
      },
    ],
  };

  constructor() {
    this.form = this.formBuilder.group(
      {
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        password_confirmation: new FormControl('', [Validators.required, Validators.minLength(8)]),
      },
      { validator: CustomValidators.MatchValidator('password', 'password_confirmation') },
    );
  }

  get passwordMatchError() {
    return this.form.getError('mismatch') && this.form.get('password_confirmation')?.touched;
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.tnc.invalid) {
      return;
    }
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      this.store
        .dispatch(
          new RegisterAction({
            ...raw,
            country_code: CANADA_DIAL_DIGITS,
          }),
        )
        .subscribe({
          complete: () => {
            this.activeForm.emit('login');
          },
        });
    }
  }

  action(action: string) {
    this.activeForm.emit(action);
  }
}
