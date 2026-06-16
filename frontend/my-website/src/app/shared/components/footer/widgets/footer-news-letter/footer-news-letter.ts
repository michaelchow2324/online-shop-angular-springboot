import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IOption } from '../../../../interface/theme-option.interface';
import { SubscriptionAction } from '../../../../store/action/subscription.action';
import { ThemeOptionState } from '../../../../store/state/theme-option.state';
import { Button } from '../../../widgets/button/button';

@Component({
  selector: 'app-footer-news-letter',
  imports: [TranslateModule, ReactiveFormsModule, Button, AsyncPipe],
  templateUrl: './footer-news-letter.html',
  styleUrl: './footer-news-letter.scss',
})
export class FooterNewsLetter {
  private store = inject(Store);
  formBuilder = inject(FormBuilder);

  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  readonly newsLetterStyle = input<string>();

  public newsLetterForm: FormGroup;
  public isSubmit: boolean = false;
  public show = false;

  constructor() {
    this.newsLetterForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  submit() {
    this.isSubmit = true;
    this.newsLetterForm.markAllAsTouched();
    if (this.newsLetterForm.valid) {
      this.store.dispatch(new SubscriptionAction(this.newsLetterForm.value!));
      this.newsLetterForm.reset();
      this.isSubmit = false;
    }
  }

  toggle() {
    this.show = !this.show;
  }
}
