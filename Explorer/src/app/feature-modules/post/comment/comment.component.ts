import { Component, Input, OnInit, OnDestroy  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Comment } from '../model/comment.model';
import { PostService } from '../../post.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'xp-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit, OnDestroy  {

  @Input() postId!: number;
  @Input() isLoggedIn: boolean = false;

  comments: Comment[] = [];
  newComment: Comment = new Comment();
  commentsLoaded = false;
  username: string = '';
  messages: string | null = null;
  commentingDisabled: boolean = false;
  private commentingTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {

    console.log('CommentComponent ngOnInit pokrenut, postId:', this.postId);
    this.authService.user$.subscribe(user => {
      this.username = user.username;
    });    

    if (!this.postId || isNaN(this.postId)) {
      console.error('Nevalidan postId:', this.postId);
      return;
    }
    const userId = this.authService.getCurrentUserId();
    if (!userId || userId === 0) {
      console.error('Korisnik nije prijavljen ili ID nije validan.');
      this.loadComments();
      return;
    }
    this.newComment.userId = userId;
    this.loadComments();
  
  }
  
  loadComments(): void {
    if (!this.postId) return;

    this.postService.getCommentsByPost(this.postId).subscribe({
      next: (commentsData) => {
        this.comments = commentsData.map(c => {
          const comment = new Comment();
          Object.assign(comment, c);

          if (Array.isArray(comment.commentedAt) && comment.commentedAt.length >= 6) {
            const [year, month, day, hour, minute, second, nano] = comment.commentedAt;
            comment.formattedCommentedAt = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
          } else if (typeof comment.commentedAt === 'string') {
              comment.formattedCommentedAt = new Date(comment.commentedAt);
          }
          return comment;
        });

        this.comments.sort((a, b) => {
            const dateA = a.formattedCommentedAt instanceof Date ? a.formattedCommentedAt.getTime() : 0;
            const dateB = b.formattedCommentedAt instanceof Date ? b.formattedCommentedAt.getTime() : 0;
            return dateB - dateA;
        });

        this.commentsLoaded = true;

        if(this.isLoggedIn) {
          this.newComment = new Comment();
          this.newComment.postId = this.postId;
          this.newComment.userId = this.authService.getCurrentUserId();
          this.newComment.username = this.username;
          console.log('Priprema novog komentara za korisnika:', this.username);
        }
        console.log('Učitani i parsirani komentari:', this.comments);
      },
      error: (err) => {
        console.error('Greška pri učitavanju komentara:', err);
      },
    });
  }

  submitComment(): void {
    if (!this.isLoggedIn) {
      this.messages = 'You must be logged in to add a comment!';
      setTimeout(() => this.messages = null,60000);
      return;
    }

    if (!this.newComment.content?.trim()) {
      this.messages = 'Comment cannot be empty!';
      setTimeout(() => this.messages = null, 60000);
      return;
    }

    if (this.commentingTimeout) {
      clearTimeout(this.commentingTimeout);
      this.commentingTimeout = null;
    }

    this.postService.addComment(this.postId, this.newComment).subscribe({
      next: (createdCommentData) => {
        const newCommentInstance = new Comment();
        Object.assign(newCommentInstance, createdCommentData);

        if (Array.isArray(newCommentInstance.commentedAt) && newCommentInstance.commentedAt.length >= 6) {
            const [year, month, day, hour, minute, second, nano] = newCommentInstance.commentedAt;
            newCommentInstance.formattedCommentedAt = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
        } else if (typeof newCommentInstance.commentedAt === 'string') {
            newCommentInstance.formattedCommentedAt = new Date(newCommentInstance.commentedAt);
        }

        this.comments.unshift(newCommentInstance);
        this.newComment.content = '';
        this.commentingDisabled = false;
        this.messages = null;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding comment:', err);
        if (err.status === 429) {
          this.messages = typeof err.error === 'string' ? err.error : 'You have exceeded the comment limit. Try again later!';
          this.commentingDisabled = true; 

          this.commentingTimeout = setTimeout(() => {
            this.commentingDisabled = false; 
            this.messages = 'You can add comments again!';

            setTimeout(() => this.messages = null, 10000);
          }, 60 * 1000);

        } else if (err.status === 401) { 
          this.messages = 'You are not authorized. Please log in again.';
          this.commentingDisabled = false; 
        } else if (err.status === 403) {  
          this.messages = 'You do not have permission to perform this action.';
          this.commentingDisabled = false; 
        } else if (err.status === 400 || err.status === 404 || err.status === 500) {
          this.messages = typeof err.error === 'string' ? err.error : 'An error occurred while adding a comment. Check the entered data.';
          this.commentingDisabled = false; 
        } else {
          this.messages = 'An unexpected error occurred. Please try again.';
          this.commentingDisabled = false; 
        }

        if (err.status !== 429) {
          setTimeout(() => this.messages = null, 60000);  
        }
      },
    });
  }

  ngOnDestroy(): void {
    if (this.commentingTimeout) {
      clearTimeout(this.commentingTimeout);
    }
  }
  
}