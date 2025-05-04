import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStreamComponent } from './add-stream.component';

describe('AddStreamComponent', () => {
  let component: AddStreamComponent;
  let fixture: ComponentFixture<AddStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
