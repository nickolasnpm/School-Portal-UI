import { classSubjectResponse } from './ClassSubject';
import { studentResponse } from './Student';
import { teacherResponse } from './Teacher';

export interface classCategoryResponse {
  id: string;
  code: string;
  academicYear: number;
  batchId: string;
  classStreamId: string;
  classRankId: string;
  classSubjects?: classSubjectResponse[];
  subjects?: string[];
  students?: studentResponse[];
  teachers?: teacherResponse[];
}

export interface classCategoryRequest {
  academicYear: number;
  batchId: string;
  classStreamId: string;
  classRankId: string;
  Subjects?: string[];
}
