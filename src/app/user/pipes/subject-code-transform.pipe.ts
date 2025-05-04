import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'subjectCodeTransform',
})
export class SubjectCodeTransformPipe implements PipeTransform {
  transform(value: string): string | null {
    switch (true) {
      case value.includes('B-BM'):
        return 'Malay Language';
      case value.includes('B-BI'):
        return 'English Language';
      case value.includes('B-ME'):
        return 'Mandarin Language';
      case value.includes('B-TE'):
        return 'Tamil Language';
      case value.includes('A-MATH'):
        return 'Mathematics';
      case value.includes('A-CHE'):
        return 'Chemistry';
      case value.includes('A-BIO'):
        return 'Biology';
      case value.includes('A-PHY'):
        return 'Physics';
      default:
        return null;
    }
  }
}
