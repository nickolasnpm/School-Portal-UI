import { studentResponse } from './Student';
import { teacherResponse } from './Teacher';

export interface classSubjectResponse {
  id: string;
  code: string;
  academicYear: number;
  classCategoryId: string;
  subjectId: string;
  teachers?: teacherResponse[];
  students?: studentResponse[];
}
