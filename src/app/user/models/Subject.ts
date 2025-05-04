import { classSubjectResponse } from './ClassSubject';

export interface subjectResponse {
  id: string;
  name: string;
  code: string;
  teacherId?: string;
  classSubjects?: classSubjectResponse[];
  classCategories?: string[];
}

export interface subjectRequest {
  name: string;
  code: string;
  teacherId?: string;
}
