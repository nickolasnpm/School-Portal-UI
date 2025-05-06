import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditStreamComponent } from './view-edit-stream.component';

describe('ViewEditStreamComponent', () => {
  let component: ViewEditStreamComponent;
  let fixture: ComponentFixture<ViewEditStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
