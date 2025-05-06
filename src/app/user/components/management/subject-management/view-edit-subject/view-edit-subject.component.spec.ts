import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditSubjectComponent } from './view-edit-subject.component';

describe('ViewEditSubjectComponent', () => {
  let component: ViewEditSubjectComponent;
  let fixture: ComponentFixture<ViewEditSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditSubjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
