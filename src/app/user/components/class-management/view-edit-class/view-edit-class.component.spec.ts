import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditClassComponent } from './view-edit-class.component';

describe('ViewEditClassComponent', () => {
  let component: ViewEditClassComponent;
  let fixture: ComponentFixture<ViewEditClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditClassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
