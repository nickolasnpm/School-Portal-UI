import { TestBed } from '@angular/core/testing';

import { ClassSubjectService } from './class-subject.service';

describe('ClassSubjectService', () => {
  let service: ClassSubjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassSubjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
