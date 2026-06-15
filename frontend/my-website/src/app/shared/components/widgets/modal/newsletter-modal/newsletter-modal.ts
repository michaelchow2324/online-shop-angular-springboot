import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, TemplateRef, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { IOption } from '../../../../interface/theme-option.interface';
import { ThemeOptionService } from '../../../../services/theme-option.service';
import { SubscriptionAction } from '../../../../store/action/subscription.action';
import { UpdateSessionAction } from '../../../../store/action/theme-option.action';
import { ThemeOptionState } from '../../../../store/state/theme-option.state';
import { Button } from '../../button/button';

@Component({
  selector: 'app-newsletter-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Button],
  templateUrl: './newsletter-modal.html',
  styleUrl: './newsletter-modal.scss',
})
export class NewsletterModal {
  private store = inject(Store);
  private modalService = inject(NgbModal);
  themeOptionService = inject(ThemeOptionService);
  private platformId = inject<Object>(PLATFORM_ID);
  formBuilder = inject(FormBuilder);

  newsletter$: Observable<boolean> = inject(Store).select(ThemeOptionState.newsletter);
  themeOption$: Observable<IOption> = inject(Store).select(ThemeOptionState.themeOptions);

  readonly NewsletterModal = viewChild<TemplateRef<string>>('newsletterModal');

  public newsletter: boolean;
  public themeOption: IOption;

  public closeResult: string;
  public modalOpen: boolean = true;
  public newsLetterForm: FormGroup;
  public isSubmit: boolean = false;
  public storageURL = environment.storageURL;

  constructor() {
    const themeOptionService = this.themeOptionService;

    this.newsletter$.subscribe(res => (this.newsletter = res));

    this.newsLetterForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    if (this.newsletter) {
      themeOptionService.newsletterModal = true;
    } else {
      themeOptionService.newsletterModal = false;
    }
    this.themeOption$.subscribe(res => (this.themeOption = res));
  }

  ngAfterViewInit(): void {
    if (this.newsletter === true) {
      setTimeout(() => {
        void this.openModal();
      }, 3000);
      this.store.dispatch(new UpdateSessionAction('newsletter', false));
    }
  }

  async openModal() {
    this.modalOpen = true;
    if (isPlatformBrowser(this.platformId)) {
      this.modalService
        .open(this.NewsletterModal(), {
          ariaLabelledBy: 'profile-Modal',
          centered: true,
          windowClass: 'modal-xl modal-dialog-centered auth-modal theme-modal-2',
        })
        .result.then(
          result => {
            `Result ${result}`;
          },
          reason => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          },
        );
    }
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      this.themeOptionService.newsletterModal = false;
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      this.themeOptionService.newsletterModal = false;
      return 'by clicking on a backdrop';
    } else {
      this.themeOptionService.newsletterModal = false;
      return `with: ${reason}`;
    }
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

  closeModal() {
    this.themeOptionService.newsletterModal = false;
    this.modalService.dismissAll();
  }
}
