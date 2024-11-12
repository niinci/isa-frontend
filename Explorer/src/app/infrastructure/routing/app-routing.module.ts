import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';

import { AuthGuard } from '../auth/auth.guard';
import { PostComponent } from 'src/app/feature-modules/post/post.component';
import { Login } from '../auth/model/login.model';
import { LoginComponent } from '../auth/login/login.component';
import { CreatePostComponent } from 'src/app/feature-modules/create-post/create-post.component';
import { RegistrationComponent } from '../auth/registration/registration.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'posts', component: PostComponent},
  {path: 'login', component: LoginComponent},
  {path: 'create-post', component: CreatePostComponent}
  {path: 'register', component: RegistrationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
