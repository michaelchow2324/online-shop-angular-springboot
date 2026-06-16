import { Params } from '../../interface/core.interface';

export class DownloadsAction {
  static readonly type = '[Download] Get';
  constructor(public payload?: Params) {}
}

export class DownloadFilesAction {
  static readonly type = '[Download] Files';
  constructor(public id: number) {}
}

export class DownloadLicenseAction {
  static readonly type = '[Download] License';
  constructor(public id: number) {}
}
