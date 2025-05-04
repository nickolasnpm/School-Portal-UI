import { TestBed } from '@angular/core/testing';

import { AccessModuleService } from './access-module.service';

describe('AccessModuleService', () => {
  let service: AccessModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
