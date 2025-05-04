import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessmoduleManagementComponent } from './accessmodule-management.component';

describe('AccessmoduleManagementComponent', () => {
  let component: AccessmoduleManagementComponent;
  let fixture: ComponentFixture<AccessmoduleManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessmoduleManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessmoduleManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
