import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditRoleComponent } from './view-edit-role.component';

describe('ViewEditRoleComponent', () => {
  let component: ViewEditRoleComponent;
  let fixture: ComponentFixture<ViewEditRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
