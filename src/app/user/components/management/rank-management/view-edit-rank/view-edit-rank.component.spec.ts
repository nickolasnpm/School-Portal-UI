import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditRankComponent } from './view-edit-rank.component';

describe('ViewEditRankComponent', () => {
  let component: ViewEditRankComponent;
  let fixture: ComponentFixture<ViewEditRankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditRankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
