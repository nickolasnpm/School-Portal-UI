import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditBatchComponent } from './view-edit-batch.component';

describe('ViewEditBatchComponent', () => {
  let component: ViewEditBatchComponent;
  let fixture: ComponentFixture<ViewEditBatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditBatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
