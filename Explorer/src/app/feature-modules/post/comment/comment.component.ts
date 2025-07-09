import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Comment } from '../model/comment.model';
import { PostService } from '../../post.service';

@Component({
  selector: 'xp-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  @Input() postId!: number;  // OVO JE KLJUČNO

  //postId!: number;
  comments: Comment[] = [];
  newComment: Comment = new Comment();
  commentsLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    if (!this.postId || isNaN(this.postId)) {
      console.error('Nevalidan postId:', this.postId);
      return;
    }
  
    this.loadComments();
  
    this.newComment.userId = 1; // test user
  }
  
  

  loadComments(): void {
    if (this.commentsLoaded || !this.postId) return;

    this.postService.getCommentsByPost(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.commentsLoaded = true;

        // Pripremi novi komentar
        this.newComment = new Comment();
        this.newComment.postId = this.postId;
        this.newComment.userId = 1; // Test user; zameni stvarnim
      },
      error: (err) => {
        console.error('Greška pri učitavanju komentara:', err);
      },
    });
  }
  submitComment(): void {
    if (!this.newComment.content?.trim()) return;

    this.postService.addComment(this.postId, this.newComment).subscribe({
      next: (createdComment) => {
        this.comments.push(createdComment);
        this.newComment.content = '';
      },
      error: (err) => {
        console.error('Greška pri dodavanju komentara:', err);
      },
    });
  }
}
