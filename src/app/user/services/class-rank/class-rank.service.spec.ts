import { TestBed } from '@angular/core/testing';

import { ClassRankService } from './class-rank.service';

describe('ClassRankService', () => {
  let service: ClassRankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassRankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
