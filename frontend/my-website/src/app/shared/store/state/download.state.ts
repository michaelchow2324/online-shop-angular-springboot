import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IDownload } from '../../interface/download.interface';
import { DownloadsService } from '../../services/downloads.service';
import {
  DownloadFilesAction,
  DownloadLicenseAction,
  DownloadsAction,
} from '../action/download.action';

export class DownloadStateModel {
  download = {
    data: [] as IDownload[],
    total: 0,
  };
}

@State<DownloadStateModel>({
  name: 'download',
  defaults: {
    download: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class DownloadState {
  private downloadService = inject(DownloadsService);

  @Selector()
  static download(state: DownloadStateModel) {
    return state.download;
  }

  @Action(DownloadsAction)
  downloads(ctx: StateContext<DownloadStateModel>, action: DownloadsAction) {
    return this.downloadService.downloads(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            download: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(DownloadFilesAction)
  downloadFiles(_ctx: StateContext<DownloadStateModel>, _action: DownloadFilesAction) {
    //  Download Files Logic Here
  }

  @Action(DownloadLicenseAction)
  downloadLicense(_ctx: StateContext<DownloadStateModel>, _action: DownloadFilesAction) {
    //  Download License Logic Here
  }
}
