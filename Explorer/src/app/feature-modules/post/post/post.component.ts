import { Component, OnInit } from '@angular/core';
import { Post } from '../model/post.model';
import { PostService } from '../../post.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from '../create-post/create-post.component';

@Component({
  selector: 'xp-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  posts: Post[] = [];
  isLoggedIn = false;
  likedPosts = new Map<number, boolean>(); // Praćenje lajkovanja posta po ID-u
  messages = new Map<number, string>();    // Poruke za prijavu po ID-u posta

  constructor(
    private postService: PostService,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Praćenje statusa prijave korisnika
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user.username; // Ako korisnik ima username, smatramo da je prijavljen
    });

    // Učitavanje postova
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.posts = data;
      },
      (error) => {
        console.error('Došlo je do greške pri učitavanju postova!', error);
      }
    );
  }

  likePost(post: Post) {
    if (!this.isLoggedIn) {
      // Prikaz poruke samo za konkretan post na koji korisnik pokušava da lajkuje
      this.messages.set(post.id, 'You need to log in to like post');
      setTimeout(() => this.messages.delete(post.id), 3000); // Poruka nestaje nakon 3 sekunde
    } else {
      // Dodavanje ili oduzimanje lajka za dati post
      const isLiked = this.likedPosts.get(post.id) || false;
      this.likedPosts.set(post.id, !isLiked);
      post.likes += isLiked ? -1 : 1;
    }
  }
  
  commentOnPost(post: Post): void {
    if (!this.isLoggedIn) {
      // Display message if user is not logged in
      this.messages.set(post.id, 'You need to log in to comment on this post');
      setTimeout(() => this.messages.delete(post.id), 3000); // Message disappears after 3 seconds
    } else {
      // Proceed with commenting functionality (this part can be customized to add a comment)
      console.log('Proceed to comment on post', post.id);
    }
  }

  openCreatePostDialog(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog was closed');
    });
  }
  
  getPostImageUrl(imageName: string): string {
    return `http://localhost:8080/${imageName}`;
  }

}
