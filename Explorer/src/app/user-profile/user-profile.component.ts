import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../infrastructure/auth/auth.service';
import { UserInfo } from '../infrastructure/auth/model/userInfo.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../feature-modules/post/model/post.model';
import { Comment } from '../feature-modules/post/model/comment.model';
import { PostService } from '../feature-modules/post.service';

const backendBaseUrl = 'http://localhost:8080/';

interface TempFollower {
  id: number;
  username: string;
  email?: string;
}

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class ProfileComponent implements OnInit {
  email: string | null = null;
  user: UserInfo | null = null;
  isLoading = false;
  error: string | null = null;
  activeTab: string = 'posts';
  

  userPosts: Post[] = [];
  followers: TempFollower[] = [];
  following: TempFollower[] = [];

  postsLoading = false;
  followersLoading = false;
  followingLoading = false;

  passwordForm: FormGroup;
  profileEditForm: FormGroup;

  isFollowing: boolean = false;
  newCommentContent: { [postId: number]: string } = {}; // Map to store comment text for each post ID
  likedPosts = new Map<number, boolean>(); // To track liked posts on the profile
  messages = new Map<number, string>(); // Messages for login requirement or errors
   isLoggedIn: boolean = false; // Add this line!


  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router:Router,
    private postService: PostService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.profileEditForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      number: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = user.id !== 0; // Set isLoggedIn based on user ID presence
    });
    this.route.queryParams.subscribe(params => {
      const routeUserId = Number(params['userId']);
      const loggedUserId = this.authService.getCurrentUserId();
  
      if (routeUserId && routeUserId !== loggedUserId) {
        this.loadLikedPostsForDisplayedUser(routeUserId);
        this.email = null;
        this.getUserById(routeUserId);
        this.checkIfFollowing(loggedUserId, routeUserId);
      } else {
        this.email = this.authService.user$.value.email || localStorage.getItem('email');
        this.getUser();
        this.loadLikedPostsForDisplayedUser(loggedUserId);

      }
    });
  }
  

  checkIfFollowing(followerId: number, followingId: number): void {
    this.authService.isFollowing(followerId, followingId).subscribe({
      next: (result) => {
        this.isFollowing = result;
      },
      error: () => {
        this.isFollowing = false;
      }
    });
  }

  followUser(): void {
    const followerId = this.authService.getCurrentUserId();
    const followingId = this.user?.id;
  
    if (!followingId) return;
  
    this.authService.followUser(followerId, followingId).subscribe({
      next: () => {
        this.isFollowing = true;
        console.log('Follow success'); // Dodaj
        this.loadFollowers();
        this.loadFollowing();
      },
      error: () => alert('Failed to follow user')
    });
  }
  
  
  
  unfollowUser(): void {
    const followerId = this.authService.getCurrentUserId();
    const followingId = this.user?.id;
  
    if (!followingId) return;
  
    this.authService.unfollowUser(followerId, followingId).subscribe({
      next: () => {
        this.isFollowing = false;
  
        this.loadFollowers();
        this.loadFollowing();
      },
      error: () => alert('Failed to unfollow user')
    });
  }
  
  
  
  

  get isMyProfile(): boolean {
    const currentUserEmail = this.authService.user$.value.email || localStorage.getItem('email');
    return this.user?.email === currentUserEmail;
  }
  

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  getUser(): void {
    this.isLoading = true;
    this.resetUserRelatedData();
  
    const currentUserId = this.authService.getCurrentUserId();
  
    if (currentUserId && currentUserId !== 0) {
      // Ako imamo userId, učitavamo po ID-ju
      this.authService.getUserById(currentUserId).subscribe({
        next: (data) => {
          this.user = data;
          this.initializeEditForm();
          this.loadFollowers();
          this.loadFollowing();

          this.loadUserPosts();
          this.loadLikedPostsForDisplayedUser(currentUserId);

          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to load profile';
          this.isLoading = false;
        }
      });
    } else if (this.email) {
      // Ako nemamo userId, pokušavamo po emailu (ako je na raspolaganju)
      this.authService.getUser(this.email).subscribe({
        next: (data) => {
          this.user = data;
          this.initializeEditForm();
          this.loadFollowers();
          this.loadFollowing();

          this.loadUserPosts();
          this.loadLikedPostsForDisplayedUser(this.user.id);

          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to load profile';
          this.isLoading = false;
        }
      });
    } else {
      this.error = 'No user info available';
      this.isLoading = false;
    }
  }
  
  
  

  getUserById(id: number): void {
    this.isLoading = true;
    this.resetUserRelatedData();
  
    this.authService.getUserById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.initializeEditForm();
  
        if (this.user?.id != null) {
          this.loadFollowers();
          this.loadFollowing();
          this.loadUserPosts();
          this.loadLikedPostsForDisplayedUser(this.authService.getCurrentUserId());

        }
  
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load user by ID';
        this.isLoading = false;
      }
    });
  }
  
  
  

  initializeEditForm(): void {
    if (this.user) {
      this.profileEditForm.patchValue({
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        street: this.user.address?.street || '',
        city: this.user.address?.city || '',
        country: this.user.address?.country || '',
        number: this.user.address?.number || ''
      });
    }
  }

    setActiveTab(tabName: string) {
    this.activeTab = tabName;}


  loadUserPosts(): void {
  if (!this.user) return;
  this.postsLoading = true;

  this.authService.getUserPosts(this.user.id).subscribe({
    next: posts => {
      // Izvući userId-jeve iz komentara
      const userIds = Array.from(new Set(posts.flatMap(post => post.comments?.map(c => c.userId) || [])));

      if (userIds.length === 0) {
        console.log('Nema komentara sa userId.');
        this.userPosts = posts;
        this.postsLoading = false;
        return;
      }

      this.authService.getUsernamesByUserIds(userIds).subscribe({
        next: usernamesList => {
          console.log('Dobijeni username-i:', usernamesList);

          const userIdToUsername = new Map(usernamesList.map(u => [u.userId, u.username]));

          posts.forEach(post => {
            if (post.imageUrl && !post.imageUrl.startsWith('http')) {
              post.imageUrl = backendBaseUrl + post.imageUrl;
            }

            post.comments?.forEach(comment => {
              comment.username = userIdToUsername.get(comment.userId) || 'Anonymous';
            });
          });

          this.userPosts = posts;
          this.postsLoading = false;
        },
        error: err => {
          console.error('Greška pri dohvatu username-a:', err);
          this.userPosts = posts; // fallback
          this.postsLoading = false;
        }
      });
    },
    error: err => {
      console.error('Greška pri dohvatu postova:', err);
      this.postsLoading = false;
    }
  });
} 

  loadFollowers(): void {
    this.followers = [];

    if (!this.user) return;
    this.followersLoading = true;
    this.authService.getFollowers(this.user.id).subscribe({
      next: (followers) => {
        this.followers = followers;
        this.followersLoading = false;
      },
      error: () => {
        this.followersLoading = false;
        // Opcionalno: obrada greške, npr alert ili console.error
      }
    });
  }
  
  loadFollowing(): void {
    this.following = [];

    if (!this.user) return;
    this.followingLoading = true;
    this.authService.getFollowing(this.user.id).subscribe({
      next: (following) => {
        this.following = following;
        this.followingLoading = false;
      },
      error: () => {
        this.followingLoading = false;
        // možeš dodati alert ili console.error ako želiš
      }
    });
  }
  

  onProfileEditSubmit(): void {
    if (!this.profileEditForm.valid || !this.user) return;

    const profileData = {
      firstName: this.profileEditForm.value.firstName,
      lastName: this.profileEditForm.value.lastName,
      address: {
        street: this.profileEditForm.value.street,
        city: this.profileEditForm.value.city,
        country: this.profileEditForm.value.country,
        number: this.profileEditForm.value.number
      }
    };

    const userId = this.user.id;

    this.authService.updateProfile(userId, profileData).subscribe({
      next: (updatedUser) => {
        if (typeof updatedUser.address === 'string') {
          try {
            updatedUser.address = JSON.parse(updatedUser.address);
          } catch {
            updatedUser.address = null;
          }
        }

        this.user = {
          ...this.user,
          ...updatedUser,
          address: updatedUser.address || profileData.address
        };

        alert('Profile updated');
        this.initializeEditForm();
      },
      error: () => alert('Failed to update profile')
    });
  }

  onPasswordSubmit(): void {
    if (!this.passwordForm.valid) return;

    const passwordData = this.passwordForm.value;

    this.authService.changePassword(passwordData).subscribe({
      next: () => {
        alert('Password changed');
        this.passwordForm.reset();
      },
      error: () => alert('Failed to change password')
    });
  }

  cancelEdit(): void {
    this.initializeEditForm();
  }

  cancelPasswordChange(): void {
    this.passwordForm.reset();
  }
  onAccountIconClick() {
    const currentUserId = this.authService.getCurrentUserId();
  
    // Proveri trenutno u URL-u da li gledamo tuđi profil (userId parametar)
    const routeUserIdParam = this.route.snapshot.queryParamMap.get('userId');
    const routeUserId = routeUserIdParam ? Number(routeUserIdParam) : null;
  
    if (routeUserId === currentUserId || !routeUserId) {
      // Ako je tvoj profil ili nema parametra userId, prebaci na /profile bez parametara (tvoj profil)
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/profile']);
      });
    } else {
      // Ako gledamo profil drugog korisnika, prebaci na svoj profil (/profile bez parametara)
      this.router.navigate(['/profile']);
    }
  }

  private resetUserRelatedData(): void {
    this.userPosts = [];
    this.followers = [];
    this.following = [];
    this.postsLoading = false;
    this.followersLoading = false;
    this.followingLoading = false;
    this.activeTab = 'posts'; // možeš i drugačije, po želji
  }
  
  loadLikedPostsForDisplayedUser(userId: number): void {
    if (!this.isLoggedIn || userId === 0) { // Ensure user is logged in to check likes
      this.likedPosts.clear();
      return;
    }

    this.postService.getLikedPosts(userId).subscribe(posts => {
      this.likedPosts.clear(); // Clear previous state
      posts.forEach(post => this.likedPosts.set(post.id, true));
    });
  }

  likePost(post: Post): void {
    if (!this.isLoggedIn) {
      this.messages.set(post.id, 'You need to log in to like this post');
      setTimeout(() => this.messages.delete(post.id), 3000);
      return;
    }

    if (this.isMyProfile) {
      // Prevent liking your own posts if that's the desired behavior
      return;
    }

    // Call PostService to toggle like
    this.postService.likePost(post.id!).subscribe({
      next: (response) => {
        const liked = response.liked;
        this.likedPosts.set(post.id!, liked);
        post.likesCount += liked ? 1 : -1;
      },
      error: () => {
        this.messages.set(post.id!, 'An error occurred while liking the post');
        setTimeout(() => this.messages.delete(post.id!), 3000);
      }
    });
  }

  addComment(post: Post): void {
    if (!this.isLoggedIn) {
      this.messages.set(post.id!, 'You need to log in to comment on this post');
      setTimeout(() => this.messages.delete(post.id!), 3000);
      return;
    }

    if (this.isMyProfile) {
      // Prevent commenting on your own posts if that's the desired behavior
      return;
    }

      const commentContent = this.newCommentContent[post.id!];
    if (!commentContent || commentContent.trim() === '') {
      this.messages.set(post.id!, 'Comment cannot be empty.');
      setTimeout(() => this.messages.delete(post.id!), 3000);
      return;
    }

    // Create an instance of the Comment class
    const newCommentInstance = new Comment();
    newCommentInstance.id = 0; // ID will be assigned by the backend
    newCommentInstance.content = commentContent;
    newCommentInstance.userId = this.authService.getCurrentUserId();
    newCommentInstance.postId = post.id!;
    newCommentInstance.username = this.authService.user$.value.username || 'Anonymous';
    newCommentInstance.commentedAt = new Date(); // Set it as a Date object initially

    // You might need to call parseCommentedAt() here if it's meant to process
    // the 'commentedAt' field for 'formattedCommentedAt' *before* sending to the backend,
    // or rely on the backend to return the correct format.
    // Given your `loadComments` logic, it seems `parseCommentedAt` is called
    // when data is *received*. So, you likely don't need to call it here.

    this.postService.addComment(post.id!, newCommentInstance).subscribe({ // Pass the class instance
      next: (comment) => {
        if (!post.comments) {
          post.comments = [];
        }
        // When you receive the comment from the backend, it might come as a plain object.
        // You should convert it to a Comment class instance and then parse the date.
        const receivedComment = new Comment();
        Object.assign(receivedComment, comment); // Copy properties from backend response
        receivedComment.parseCommentedAt(); // Now parse the date on the received object

        post.comments.push(receivedComment); // Push the correctly formatted instance
        this.newCommentContent[post.id!] = ''; // Clear the input field
        this.messages.delete(post.id!); // Clear any previous messages
      },
      error: () => {
        this.messages.set(post.id!, 'Failed to add comment.');
        setTimeout(() => this.messages.delete(post.id!), 3000);
      }
    })


  }
  
}
