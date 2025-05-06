import { Routes } from '@angular/router';
import { HomeComponent } from './user/components/main/home/home.component';
import { LoginComponent } from './user/components/identification/login/login.component';
import { ChangePasswordComponent } from './user/components/identification/change-password/change-password.component';
import { ResetPasswordComponent } from './user/components/identification/reset-password/reset-password.component';
import { VerifyAccountComponent } from './user/components/identification/verify-account/verify-account.component';
import { UserProfileComponent } from './user/components/main/user-profile/user-profile.component';
import { UserManagementComponent } from './user/components/management/user-management/user-management.component';
import { BatchManagementComponent } from './user/components/management/batch-management/batch-management.component';
import { AccessmoduleManagementComponent } from './user/components/management/accessmodule-management/accessmodule-management.component';
import { RoleManagementComponent } from './user/components/management/role-management/role-management.component';
import { RankManagementComponent } from './user/components/management/rank-management/rank-management.component';
import { StreamManagementComponent } from './user/components/management/stream-management/stream-management.component';
import { ClassManagementComponent } from './user/components/management/class-management/class-management.component';
import { SubjectManagementComponent } from './user/components/management/subject-management/subject-management.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'user/home',
    pathMatch: 'full',
  },
  {
    path: 'user',
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'verify-account', component: VerifyAccountComponent },
      { path: 'user-profile', component: UserProfileComponent },
      { path: 'user-management', component: UserManagementComponent },
      {
        path: 'accessmodule-management',
        component: AccessmoduleManagementComponent,
      },
      { path: 'role-management', component: RoleManagementComponent },
      { path: 'batch-management', component: BatchManagementComponent },
      { path: 'rank-management', component: RankManagementComponent },
      { path: 'stream-management', component: StreamManagementComponent },
      { path: 'class-management', component: ClassManagementComponent },
      { path: 'subject-management', component: SubjectManagementComponent },
    ],
  },
  {
    path: '**',
    redirectTo: 'user/home',
  },
];
