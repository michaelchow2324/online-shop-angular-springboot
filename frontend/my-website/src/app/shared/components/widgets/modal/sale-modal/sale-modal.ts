import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IOption } from '../../../../interface/theme-option.interface';
import { ThemeOptionState } from '../../../../store/state/theme-option.state';

@Component({
  selector: 'app-sale-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './sale-modal.html',
  styleUrl: './sale-modal.scss',
})
export class SaleModal {
  private modalService = inject(NgbModal);

  @ViewChild('saleModal', { static: false }) SaleModal: TemplateRef<string>;
  themeOption$: Observable<IOption> = inject(Store).select(ThemeOptionState.themeOptions);

  public closeResult: string;
  public modalOpen: boolean = true;

  async openModal() {
    localStorage.setItem('exit', 'true');
    this.modalOpen = true;
    this.modalService
      .open(this.SaleModal, {
        ariaLabelledBy: 'profile-Modal',
        centered: true,
        windowClass: 'theme-modal modal-lg exit-modal',
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
