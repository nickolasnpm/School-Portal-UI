import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditUserComponent } from './view-edit-user.component';

describe('ViewEditUserComponent', () => {
  let component: ViewEditUserComponent;
  let fixture: ComponentFixture<ViewEditUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewEditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
