import { Routes } from '@angular/router';
import { HomeComponent } from './user/components/home/home.component';
import { LoginComponent } from './user/components/login/login.component';
import { ChangePasswordComponent } from './user/components/change-password/change-password.component';
import { ResetPasswordComponent } from './user/components/reset-password/reset-password.component';
import { VerifyAccountComponent } from './user/components/verify-account/verify-account.component';
import { UserProfileComponent } from './user/components/user-profile/user-profile.component';
import { UserManagementComponent } from './user/components/user-management/user-management.component';
import { BatchManagementComponent } from './user/components/batch-management/batch-management.component';
import { AccessmoduleManagementComponent } from './user/components/accessmodule-management/accessmodule-management.component';
import { RoleManagementComponent } from './user/components/role-management/role-management.component';
import { RankManagementComponent } from './user/components/rank-management/rank-management.component';
import { StreamManagementComponent } from './user/components/stream-management/stream-management.component';
import { ClassManagementComponent } from './user/components/class-management/class-management.component';
import { SubjectManagementComponent } from './user/components/subject-management/subject-management.component';

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
      { path: 'accessmodule-management', component: AccessmoduleManagementComponent },
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
