import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../model/post.model';
import { PostService } from '../../post.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from '../create-post/create-post.component';
import { UserAccountService } from 'src/app/user-account.service';

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
  isAdminUser: boolean = false;

  username: string;
  @Input() adminView: boolean = false;  // <--- novo

  usernameMap = new Map<number, string>();

  constructor(
    private postService: PostService,
    private authService: AuthService,
    public dialog: MatDialog,private userAcountService:UserAccountService
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user.username;
      this.isAdminUser = user.role === 'ADMIN';
      // this.username = user.username; - ovo vraca EMAIL, popraviti :)
      if (this.isLoggedIn) {
        this.userId = user.id;
        this.loadLikedPosts();
      } else {
        this.userId = null;
        this.likedPosts.clear();
      }
  
      this.loadPosts(); // pozivamo ovde kad znamo sve
    });
  }
  

  loadPosts(): void {
    const loadPostsCallback = (data: Post[]) => {
      this.posts = data;
      data.forEach(post => {
        this.loadUsername(post.userId);
      });
    };
  
    if (this.adminView) {
      this.postService.getAllPostsFromAllUsers().subscribe(
        loadPostsCallback,
        (error) => {
          console.error('Greška pri učitavanju svih postova:', error);
        }
      );
    } else {
      this.postService.getAllPosts().subscribe(
        loadPostsCallback,
        (error) => {
          console.error('Greška pri učitavanju feed postova:', error);
        }
      );
    }
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
          post.likesCount += liked ? 1 : -1;
        },
        error: () => {
          this.messages.set(post.id, 'An error occurred while liking the post');
          setTimeout(() => this.messages.delete(post.id), 3000);
        }
      });
    }
  }
  
  loadLikedPosts(): void {
    if (!this.isLoggedIn || this.userId == null) {
      this.likedPosts.clear();
      return;
    }
  
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
      this.loadPosts(); // osveži postove nakon kreiranja
    });
  }
  
  getPostImageUrl(imageName: string): string {
    return `http://localhost:8080/${imageName}`;
  }

  editPost(post: Post): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: '500px',
      data: { post: post }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPosts(); // ili window.location.reload();
      }
    });
  }
  
  

deletePost(postId: number): void {
  if (confirm('Da li sigurno želiš da obrišeš ovaj post?')) {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
      },
      error: (err) => {
        console.error('Greška pri brisanju posta:', err);
      }
    });
  }
}

toggleAdvertisableStatus(post: Post): void {
  if (post.id === undefined) {
    console.error('Post ID is undefined.');
    return;
  }

  const currentStatus = post.isAdvertisable === true; 
  const newStatus = !currentStatus; 

  this.postService.updatePostAdvertisableStatus(post.id, newStatus).subscribe({
    next: () => {
      post.isAdvertisable = newStatus; 
      //alert(`Objava "${post.description}" je ${newStatus ? 'označena kao reklamirana' : 'uklonjena iz reklamiranja'}.`);
      // this.loadPosts();
    },
    error: (err) => {
      console.error('Greška pri ažuriranju statusa reklamiranja:', err);
      //alert('Došlo je do greške pri ažuriranju statusa reklamiranja.');
    }
  });
}

loadUsername(userId: number): void {
  if (!this.usernameMap.has(userId)) {
    this.userAcountService.getUsernameById(userId).subscribe({
      next: (username) => {
        this.usernameMap.set(userId, username);
      },
      error: () => {
        this.usernameMap.set(userId, 'Unknown');
      }
    });
  }
}


}
