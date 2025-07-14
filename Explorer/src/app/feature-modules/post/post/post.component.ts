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
  isAdminUser: boolean = false;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Praćenje statusa prijave korisnika
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user.username; // Ako korisnik ima username, smatramo da je prijavljen
      this.isAdminUser = user.role === 'ADMIN';

      if (this.isLoggedIn) {
        this.userId = user.id;  // Pretpostavljam da user objekat ima id polje
        this.loadLikedPosts();
      } else {
        this.userId = null;
        this.likedPosts.clear();
      }
    });

    // Učitavanje postova
    this.loadPosts();
    //this.loadLikedPosts();
  }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.posts = data;
        console.log("Učitani postovi:", this.posts); 
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
    });
  }
  
  getPostImageUrl(imageName: string): string {
    return `http://localhost:8080/${imageName}`;
  }

  editPost(post: Post): void {
  const updatedDescription = prompt('Izmeni opis posta:', post.description);

  if (updatedDescription && updatedDescription.trim() !== '' && updatedDescription !== post.description) {
    const postDTO = { description: updatedDescription }; // možeš dodati i druge podatke ako backend zahteva
    this.postService.updatePost(post.id, postDTO).subscribe({
      next: (updatedPost) => {
        post.description = updatedPost.description;
      },
      error: (err) => {
        console.error('Greška pri izmeni posta:', err);
      }
    });
  }
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

}
