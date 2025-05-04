import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamManagementComponent } from './stream-management.component';

describe('StreamManagementComponent', () => {
  let component: StreamManagementComponent;
  let fixture: ComponentFixture<StreamManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
