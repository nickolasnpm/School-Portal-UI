import { classCategoryResponse } from './ClassCategory';
import { classRankResponse } from './ClassRank';
import { classStreamResponse } from './ClassStream';

export interface batchResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  teacherId?: string;
  classCategories?: classCategoryResponse[];
  classStreams?: classStreamResponse[];
  classRanks?: classRankResponse[];
}

export interface batchRequest {
  name: string;
  code: string;
  isActive: boolean;
  teacherId: string;
  classStreamIds: string[];
  classRankIds: string[];
}
