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


@NgModule({
  declarations: [
    AppComponent,
    PostComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,  // Dodaj FormsModule za ngModel
    HttpClientModule,
    LayoutModule,
    AppRoutingModule,
    AuthModule,
    BrowserAnimationsModule


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
