import { classSubjectResponse } from './ClassSubject';

export interface teacherResponse {
  id: string;
  serviceStatus?: string;
  isAvailable?: boolean;
  responsibilityType: string;
  responsibilityFocus?: string;
  userId: string;
  classCategoryId?: string;
  classSubjects?: classSubjectResponse[];
}
