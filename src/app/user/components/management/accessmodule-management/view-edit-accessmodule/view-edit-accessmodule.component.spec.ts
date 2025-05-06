import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditAccessmoduleComponent } from './view-edit-accessmodule.component';

describe('ViewEditAccessModuleComponent', () => {
  let component: ViewEditAccessmoduleComponent;
  let fixture: ComponentFixture<ViewEditAccessmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditAccessmoduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewEditAccessmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
