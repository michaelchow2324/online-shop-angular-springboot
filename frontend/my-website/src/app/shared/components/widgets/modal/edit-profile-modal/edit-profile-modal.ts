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
import { Observable } from 'rxjs';

import { IAccountUser } from '../../../../interface/account.interface';
import { UpdateUserProfileAction } from '../../../../store/action/account.action';
import { AccountState } from '../../../../store/state/account.state';
import { Button } from '../../button/button';

@Component({
  selector: 'app-edit-profile-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Button],
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
  public flicker: boolean = false;

  constructor() {
    this.user$.subscribe(user => {
      this.flicker = true;
      this.form = this.formBuilder.group({
        displayName: new FormControl(user?.name ?? '', [Validators.maxLength(255)]),
        email: new FormControl({ value: user?.email ?? '', disabled: true }),
      });
      setTimeout(() => (this.flicker = false), 200);
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const displayName = String(this.form.getRawValue().displayName ?? '').trim();
      this.store.dispatch(new UpdateUserProfileAction({ displayName }));
    }
  }
}
