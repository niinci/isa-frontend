import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Dodaj ovo
import { HTTP_INTERCEPTORS,HttpClientModule } from '@angular/common/http';  // Za rad sa HTTP-om
import { LayoutModule } from './feature-modules/layout/layout.module';
import { AppComponent } from './app.component';
import { PostComponent } from './feature-modules/post/post/post.component';
import { AppRoutingModule } from './infrastructure/routing/app-routing.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './feature-modules/chat/chat.component';
import { TrendsComponent } from './feature-modules/trends/trends.component';
import { NearbyPostsComponent } from './feature-modules/nearby-posts/nearby-posts.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PostModule } from './feature-modules/post/post.module';
import { AuthInterceptor } from './auth.interceptor';
import { ProfileComponent } from './user-profile/user-profile.component';
import { UserAccountComponent } from './users-list/users-list.component';
import { NgChartsModule } from 'ng2-charts';
import { AnalyticsAdminComponent } from './feature-modules/analytics-admin/analytics-admin/analytics-admin.component';
import { RegisterAdminComponent } from './infrastructure/register-admin/register-admin.component';


@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    TrendsComponent,
    NearbyPostsComponent,
    UserAccountComponent,
    AnalyticsAdminComponent,
    RegisterAdminComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,  // Dodaj FormsModule za ngModel
    HttpClientModule,
    LayoutModule,
    AppRoutingModule,
    AuthModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NgChartsModule, 
    PostModule
  ],
  providers: [
  {  provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
