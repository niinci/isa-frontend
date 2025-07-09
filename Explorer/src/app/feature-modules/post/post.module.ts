import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreatePostComponent } from './create-post/create-post.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentComponent } from './comment/comment.component';
import { FormsModule } from '@angular/forms';
import { PostComponent } from './post/post.component';

@NgModule({
  declarations: [
    CreatePostComponent,
    CommentComponent,
    PostComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    PostComponent,
    CommentComponent
  ]
})
export class PostModule { }
