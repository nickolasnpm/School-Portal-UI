import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRankComponent } from './add-rank.component';

describe('AddRankComponent', () => {
  let component: AddRankComponent;
  let fixture: ComponentFixture<AddRankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
