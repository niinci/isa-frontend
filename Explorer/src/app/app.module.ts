import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Dodaj ovo
import { HttpClientModule } from '@angular/common/http';  // Za rad sa HTTP-om
import { LayoutModule } from './feature-modules/layout/layout.module';
import { AppComponent } from './app.component';
import { PostComponent } from './feature-modules/post/post.component';
import { AppRoutingModule } from './infrastructure/routing/app-routing.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreatePostComponent } from './feature-modules/create-post/create-post.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './feature-modules/chat/chat.component';
import { TrendsComponent } from './feature-modules/trends/trends.component';
import { NearbyPostsComponent } from './feature-modules/nearby-posts/nearby-posts.component';

@NgModule({
  declarations: [
    AppComponent,
    PostComponent,
    CreatePostComponent,
    ChatComponent,
    TrendsComponent,
    NearbyPostsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,  // Dodaj FormsModule za ngModel
    HttpClientModule,
    LayoutModule,
    AppRoutingModule,
    AuthModule,
    BrowserAnimationsModule,
    ReactiveFormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
