import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../infrastructure/auth/auth.service';
import { UserInfo } from '../infrastructure/auth/model/userInfo.model';
import { ActivatedRoute, Router } from '@angular/router';

interface TempPost {
  id: number;
  content: string;
  author?: string;
}

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
  activeTab: 'profile' | 'posts' | 'followers' | 'following' | 'settings' = 'profile';
  

  userPosts: TempPost[] = [];
  followers: TempFollower[] = [];
  following: TempFollower[] = [];

  postsLoading = false;
  followersLoading = false;
  followingLoading = false;

  passwordForm: FormGroup;
  profileEditForm: FormGroup;

  isFollowing: boolean = false;


  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router:Router
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
    this.route.queryParams.subscribe(params => {
      const routeUserId = Number(params['userId']);
      const loggedUserId = this.authService.getCurrentUserId();
  
      if (routeUserId && routeUserId !== loggedUserId) {
        this.email = null;
        this.getUserById(routeUserId);
        this.checkIfFollowing(loggedUserId, routeUserId);
      } else {
        this.email = this.authService.user$.value.email || localStorage.getItem('email');
        this.getUser();
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

  setActiveTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    if (tab === 'posts') this.loadUserPosts();
    if (tab === 'followers') this.loadFollowers();
    if (tab === 'following') this.loadFollowing();
  }

  loadUserPosts(): void {
    if (!this.user || this.userPosts.length > 0) return;
    this.postsLoading = true;
    this.authService.getUserPosts(this.user.email).subscribe({
      next: (posts) => {
        this.userPosts = posts;
        this.postsLoading = false;
      },
      error: () => this.postsLoading = false
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
    this.followers = [];

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
  
  



  
}
