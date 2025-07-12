import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';

import { AuthGuard } from '../auth/auth.guard';
import { PostComponent } from 'src/app/feature-modules/post/post/post.component';
import { Login } from '../auth/model/login.model';
import { LoginComponent } from '../auth/login/login.component';
import { CreatePostComponent } from 'src/app/feature-modules/post/create-post/create-post.component';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { ProfileComponent } from 'src/app/user-profile/user-profile.component';
import { ChatComponent } from 'src/app/feature-modules/chat/chat.component';
import { TrendsComponent } from 'src/app/feature-modules/trends/trends.component';
import { NearbyPostsComponent } from 'src/app/feature-modules/nearby-posts/nearby-posts.component';
import { UserAccountComponent } from 'src/app/users-list/users-list.component';
import { AnalyticsAdminComponent } from 'src/app/feature-modules/analytics-admin/analytics-admin/analytics-admin.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'home', component: HomeComponent},
  {path: 'posts', component: PostComponent},
  {path: 'login', component: LoginComponent},
  {path: 'create-post', component: CreatePostComponent},
  {path: 'register', component: RegistrationComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'trends', component: TrendsComponent},
  {path: 'nearby-posts', component: NearbyPostsComponent},
  {path: 'app-user-account', component: UserAccountComponent},
  {path: 'admin-analytics', component: AnalyticsAdminComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
