import { classCategoryResponse } from './ClassCategory';

export interface batchResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  teacherId?: string;
  classCategories?: classCategoryResponse[];
  classStreams?: string[];
  classRanks?: string[];
}

export interface batchRequest {
  name: string;
  code: string;
  isActive: boolean;
  teacherId: string;
}
