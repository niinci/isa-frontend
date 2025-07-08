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
  userId: number | null = null;


  constructor(
    private postService: PostService,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user.username;
      if (this.isLoggedIn) {
        this.userId = user.id;  // Pretpostavljam da user objekat ima id polje
      } else {
        this.userId = null;
      }
    });
  
    this.loadPosts();
    this.loadLikedPosts();
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

  likePost(post: Post): void {
    console.log('likePost called for post:', post.id);

    if (!this.isLoggedIn) {
      this.messages.set(post.id, 'You need to log in to like this post');
      setTimeout(() => this.messages.delete(post.id), 3000);
    } else {
      if (this.userId == null) return;
      console.log('User isLoggedIn:', this.isLoggedIn, 'userId:', this.userId);

      this.postService.likePost(post.id).subscribe({
        next: (response) => {
          const liked = response.liked;
          this.likedPosts.set(post.id, liked);
          post.likes += liked ? 1 : -1;
        },
        error: () => {
          this.messages.set(post.id, 'An error occurred while liking the post');
          setTimeout(() => this.messages.delete(post.id), 3000);
        }
      });
    }
  }
  
  loadLikedPosts(): void {
    if (this.userId == null) return;
  
    this.postService.getLikedPosts(this.userId).subscribe(posts => {
      posts.forEach(post => this.likedPosts.set(post.id, true));
    });
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
