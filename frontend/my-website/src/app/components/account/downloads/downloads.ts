import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { Params } from '../../../shared/interface/core.interface';
import { IDownloadModel } from '../../../shared/interface/download.interface';
import {
  DownloadFilesAction,
  DownloadLicenseAction,
  DownloadsAction,
} from '../../../shared/store/action/download.action';
import { DownloadState } from '../../../shared/store/state/download.state';

@Component({
  selector: 'app-downloads',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, NgbModule, NoData, AsyncPipe],
  templateUrl: './downloads.html',
  styleUrl: './downloads.scss',
})
export class Downloads {
  private store = inject(Store);

  download$: Observable<IDownloadModel> = inject(Store).select(
    DownloadState.download,
  ) as Observable<IDownloadModel>;

  public filter: Params = {
    page: 1, // Current page number
    paginate: 10, // Display per page,
  };

  public term = new FormControl('');

  constructor() {
    this.store.dispatch(new DownloadsAction(this.filter));
  }

  setPaginate(page: number) {
    this.filter['page'] = page;
    this.store.dispatch(new DownloadsAction(this.filter));
  }

  search() {
    this.filter['search'] = this.term.value;
    this.store.dispatch(new DownloadsAction(this.filter));
  }

  downloadFiles(id: number) {
    this.store.dispatch(new DownloadFilesAction(id));
  }

  downloadLicense(id: number) {
    this.store.dispatch(new DownloadLicenseAction(id));
  }
}
