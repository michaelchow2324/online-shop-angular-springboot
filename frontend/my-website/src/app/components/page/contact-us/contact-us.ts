import { Component, inject } from '@angular/core';
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

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Button } from '../../../shared/components/widgets/button/button';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IContact, IOption } from '../../../shared/interface/theme-option.interface';
import { ContactUsAction } from '../../../shared/store/action/page.action';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-contact-us',
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, Breadcrumb, Button],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs {
  private formBuilder = inject(FormBuilder);
  private store = inject(Store);

  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public breadcrumb: IBreadcrumb = {
    title: 'Contact',
    items: [{ label: 'Contact', active: true }],
  };

  public form: FormGroup;
  public contactData: IContact;

  constructor() {
    this.form = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required]),
      subject: new FormControl('', [Validators.required]),
      message: new FormControl('', [Validators.required]),
    });

    this.themeOption$.subscribe(data => (this.contactData = data?.contact_us));
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.store.dispatch(new ContactUsAction(this.form.value)).subscribe({
        complete: () => {
          this.form.reset();
        },
      });
    }
  }
}
