import { IPaginateModel } from './core.interface';

export interface IDownloadModel extends IPaginateModel {
  data: IDownload[];
}

export interface IDownload {
  id: number;
  item_name: string;
  item_image: string;
  can_download_file: boolean;
  can_download_license: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
