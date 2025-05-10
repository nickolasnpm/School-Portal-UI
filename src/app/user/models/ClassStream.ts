import { classCategoryResponse } from './ClassCategory';

export interface classStreamResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  classCategories?: classCategoryResponse[];
  batches?: string[];
  classRanks?: string[];
}

export interface classStreamRequest {
  name: string;
  code: string;
  isActive: boolean;
}
