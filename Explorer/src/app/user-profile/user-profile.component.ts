// user-profile.component.ts - Popravljena verzija
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../infrastructure/auth/auth.service';
import { UserInfo } from '../infrastructure/auth/model/userInfo.model';
import { ActivatedRoute } from '@angular/router';

// Privremeno koristimo any tipove dok ne kreirate model fajlove
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

interface TempPasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}


@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class ProfileComponent implements OnInit {
  email: string | null = null;
  user: UserInfo | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  
  // Tab management
  activeTab: 'profile' | 'posts' | 'followers' | 'following' | 'settings' = 'profile';
  
  // Data arrays - koristimo any tipove privremeno
  userPosts: TempPost[] = [];
  followers: TempFollower[] = [];
  following: TempFollower[] = [];
  
  // Loading states for different sections
  postsLoading: boolean = false;
  followersLoading: boolean = false;
  followingLoading: boolean = false;
  
  // Forms
  passwordForm: FormGroup;
  profileEditForm: FormGroup;
  
  // Edit modes
  isEditingProfile: boolean = false;
  isChangingPassword: boolean = false;

  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Initialize forms
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });

    this.profileEditForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      number: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.paramMap.get('email');
    this.getUser();
  }

  // Custom validator for password confirmation
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  getUser(): void {
    if (!this.email) return;
    
    this.isLoading = true;
    this.error = null;
    
    this.authService.getUser(this.email).subscribe({
      next: (data: UserInfo) => {
        this.user = data;
        this.isLoading = false;
        this.initializeEditForm();
      },
      error: (error: any) => {
        console.error('Error fetching user', error);
        this.error = 'Failed to load user profile';
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

  setActiveTab(tab: 'profile' | 'posts' | 'followers' | 'following' | 'settings'): void {
    this.activeTab = tab;
    
    switch (tab) {
      case 'posts':
        this.loadUserPosts();
        break;
      case 'followers':
        this.loadFollowers();
        break;
      case 'following':
        this.loadFollowing();
        break;
    }
  }

  loadUserPosts(): void {
    if (!this.email || this.userPosts.length > 0) return;
    
    this.postsLoading = true;
    this.authService.getUserPosts(this.email).subscribe({
      next: (posts: any[]) => {
        this.userPosts = posts;
        this.postsLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading posts', error);
        this.postsLoading = false;
      }
    });
  }

  loadFollowers(): void {
    if (!this.email || this.followers.length > 0) return;
    
    this.followersLoading = true;
    this.authService.getFollowers(this.email).subscribe({
      next: (followers: any[]) => {
        this.followers = followers;
        this.followersLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading followers', error);
        this.followersLoading = false;
      }
    });
  }

  loadFollowing(): void {
    if (!this.email || this.following.length > 0) return;
    
    this.followingLoading = true;
    this.authService.getFollowing(this.email).subscribe({
      next: (following: any[]) => {
        this.following = following;
        this.followingLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading following', error);
        this.followingLoading = false;
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      const passwordData: TempPasswordChange = this.passwordForm.value;
      
      this.authService.changePassword(passwordData).subscribe({
        next: () => {
          alert('Password changed successfully');
          this.isChangingPassword = false;
          this.passwordForm.reset();
        },
        error: (error: any) => {
          console.error('Error changing password', error);
          alert('Failed to change password');
        }
      });
    }
  }

  onProfileEditSubmit(): void {
    if (this.profileEditForm.valid && this.user) {
      const formData = this.profileEditForm.value;
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: {
          street: formData.street,
          city: formData.city,
          country: formData.country,
          number: formData.number
        }
      };
      
      // Koristimo dummy ID jer UserInfo možda nema id property
      const userId = (this.user as any).id || 1;
      
      this.authService.updateProfile(userId, profileData).subscribe({
        next: (updatedUser: any) => {
          // Ažuriramo user objekat
          this.user = { ...this.user, ...updatedUser };
          this.isEditingProfile = false;
          alert('Profile updated successfully');
        },
        error: (error: any) => {
          console.error('Error updating profile', error);
          alert('Failed to update profile');
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
    this.initializeEditForm();
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordForm.reset();
  }
}