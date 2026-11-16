import { IAttachment } from './attachment.interface';
import { IPaginateModel } from './core.interface';

export interface IMenuModel extends IPaginateModel {
  data: IMenu[];
}

export interface IMenu {
  id?: number;
  title: string;
  slug?: string;
  link_type: string;
  path: string;
  parent_id: number;
  mega_menu: number | boolean;
  mega_menu_type: string;
  badge_text: string;
  is_target_blank: boolean | number;
  badge_color: string;
  product_ids: number[];
  blog_ids: number[];
  child: IMenu[];
  banner_image_id: string;
  banner_image: IAttachment;
  item_image_id: string;
  item_image: IAttachment;
  active: boolean;
}

export interface IMobileMenu {
  id?: number;
  active?: boolean;
  title?: string;
  icon?: string;
  path?: string;
}
