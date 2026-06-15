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
import { Select2Module } from 'ng-select2-component';
import { Observable } from 'rxjs';

import { countryCodes } from '../../../../data/country-code';
import { IAccountUser } from '../../../../interface/account.interface';
import { UpdateUserProfileAction } from '../../../../store/action/account.action';
import { AccountState } from '../../../../store/state/account.state';
import { Button } from '../../button/button';

@Component({
  selector: 'app-edit-profile-modal',
  imports: [TranslateModule, Select2Module, FormsModule, ReactiveFormsModule, Button],
  templateUrl: './edit-profile-modal.html',
  styleUrl: './edit-profile-modal.scss',
})
export class EditProfileModal {
  modalService = inject(NgbModal);
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  user$: Observable<IAccountUser> = inject(Store).select(
    AccountState.user,
  ) as Observable<IAccountUser>;

  public form: FormGroup;
  public closeResult: string;

  public modalOpen: boolean = false;
  public flicker: boolean = false;
  public codes = countryCodes;

  constructor() {
    this.user$.subscribe(user => {
      this.flicker = true;
      this.form = this.formBuilder.group({
        name: new FormControl(user?.name, [Validators.required]),
        email: new FormControl(user?.email, [Validators.required, Validators.email]),
        phone: new FormControl(user?.phone, [Validators.required, Validators.pattern(/^[0-9]*$/)]),
        country_code: new FormControl(user?.country_code),
        profile_image_id: new FormControl(user?.profile_image_id),
        _method: new FormControl('PUT'),
      });
      setTimeout(() => (this.flicker = false), 200);
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.store.dispatch(new UpdateUserProfileAction(this.form.value));
    }
  }
}
