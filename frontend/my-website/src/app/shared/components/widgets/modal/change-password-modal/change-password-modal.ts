import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { UpdateUserPasswordAction } from '../../../../store/action/account.action';
import { CustomValidators } from '../../../../validator/password-match';
import { Button } from '../../button/button';

@Component({
  selector: 'app-change-password-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Button],
  templateUrl: './change-password-modal.html',
  styleUrl: './change-password-modal.scss',
})
export class ChangePasswordModal {
  modalService = inject(NgbModal);
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  public form: FormGroup;

  constructor() {
    this.form = this.formBuilder.group(
      {
        current_password: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        password_confirmation: new FormControl('', [Validators.required]),
      },
      { validator: CustomValidators.MatchValidator('password', 'password_confirmation') },
    );
  }

  get passwordMatchError() {
    return this.form?.getError('mismatch') && this.form?.get('password_confirmation')?.touched;
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.store.dispatch(new UpdateUserPasswordAction(this.form.value)).subscribe({
        complete: () => {
          this.form.reset();
        },
      });
    }
  }
}
