import { Component, HostListener, inject, TemplateRef, viewChild } from '@angular/core';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IOption } from '../../../../interface/theme-option.interface';
import { UpdateSessionAction } from '../../../../store/action/theme-option.action';
import { ThemeOptionState } from '../../../../store/state/theme-option.state';
import { Button } from '../../button/button';
import { environment } from './../../../../../../environments/environment';

@Component({
  selector: 'app-exit-modal',
  imports: [Button],
  templateUrl: './exit-modal.html',
  styleUrl: './exit-modal.scss',
})
export class ExitModal {
  private modalService = inject(NgbModal);
  private store = inject(Store);

  readonly ExitModal = viewChild<TemplateRef<string>>('exitModal');

  exit$: Observable<boolean> = inject(Store).select(ThemeOptionState.exit);
  themeOption$: Observable<IOption> = inject(Store).select(ThemeOptionState.themeOptions);

  public closeResult: string;
  public modalOpen: boolean = true;
  public isTabInFocus = true;
  public exit: boolean;
  public themeOption: IOption;
  public storageURL = environment.storageURL;

  constructor() {
    this.exit$.subscribe(res => (this.exit = res));
    this.themeOption$.subscribe(res => (this.themeOption = res));
  }

  @HostListener('window:mouseout', ['$event'])
  onMouseOut(event: MouseEvent) {
    if (event.clientY <= 0) {
      if (this.exit === true) {
        void this.openModal();
        this.store.dispatch(new UpdateSessionAction('exit', false));
      }
    }
  }

  async openModal() {
    localStorage.setItem('exit', 'true');
    this.modalOpen = true;
    this.modalService
      .open(this.ExitModal(), {
        ariaLabelledBy: 'profile-Modal',
        centered: true,
        windowClass: 'modal-dialog-centered auth-modal exit-modal',
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

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
