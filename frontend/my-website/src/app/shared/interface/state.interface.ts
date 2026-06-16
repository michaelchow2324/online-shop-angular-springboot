import { IPaginateModel } from './core.interface';

export interface IStatesModel extends IPaginateModel {
  data: IStates[];
}

export interface IStates {
  id: number;
  name: string;
  country_id: number;
}
