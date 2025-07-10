import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Comment } from '../model/comment.model';
import { PostService } from '../../post.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

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
  username: string = '';


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
      return;
    }
    this.newComment.userId = userId; // test user
    this.loadComments();
  
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
        this.newComment.userId = this.authService.getCurrentUserId();
        this.newComment.username = this.username;
        console.log('xxxxxxxxxxxx:', this.username);
        console.log('Učitani komentari:', this.comments);
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
      //  this.newComment.username = this.username;
      },
      error: (err) => {
        console.error('Greška pri dodavanju komentara:', err);
      },
    });
  }
}
