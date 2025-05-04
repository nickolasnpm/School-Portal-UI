import { TestBed } from '@angular/core/testing';

import { ClassCategoryService } from './class-category.service';

describe('ClassCategoryService', () => {
  let service: ClassCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
