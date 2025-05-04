import { classCategoryResponse } from './ClassCategory';

export interface classRankResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  classCategories?: classCategoryResponse[];
  Batches?: string[];
  ClassStreams?: string[];
}

export interface classRankRequest {
  name: string;
  code: string;
  isActive: boolean;
}
