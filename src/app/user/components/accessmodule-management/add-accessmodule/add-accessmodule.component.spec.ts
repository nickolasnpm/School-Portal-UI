import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAccessmoduleComponent } from './add-accessmodule.component';

describe('AddAccessmoduleComponent', () => {
  let component: AddAccessmoduleComponent;
  let fixture: ComponentFixture<AddAccessmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAccessmoduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAccessmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
