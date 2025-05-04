import { classSubjectResponse } from './ClassSubject';

export interface studentResponse {
  id: string;
  entranceYear?: number;
  estimatedExitYear?: number;
  realExitYear?: number;
  exitReason?: string;
  userId: string;
  classCategoryId: string;
  classSubjects?: classSubjectResponse[];
}

export interface studentsBulkUpdate {
  studentIds: string[];
  entranceYear: number;
  estimatedExitYear: number;
  realExitYear: number;
  exitReason: string;
  isActive: boolean;
  classCategoryId?: string;
}
