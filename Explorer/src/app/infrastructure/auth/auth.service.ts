// auth.service.ts - Privremeno rešenje bez backend metoda
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenStorage } from './jwt/token.service';
import { environment } from 'src/env/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Login } from './model/login.model';
import { AuthenticationResponse } from './model/authentication-response.model';
import { User } from './model/user.model';
import { Registration } from './model/registration.model';
import { UserInfo } from './model/userInfo.model';
import { PasswordChange } from './model/password-change.model';
import { ProfileEdit } from './model/profile-edit.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = new BehaviorSubject<User>({ username: "", id: 0, role: "", email: "" });
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router
  ) {}
  
  getToken(): string {
    return this.tokenStorage.getAccessToken() || '';
  }
  
  // Login method
  login(login: Login): Observable<AuthenticationResponse> {
    return this.http
      .post(environment.apiHost + 'userAccount/login', login, { responseType: 'text' })
      .pipe(
        map((response: string) => {
          if (response === "Email not verified") {
            throw new Error(response);
          }
          return { accessToken: response } as AuthenticationResponse;
        }),
        tap((authenticationResponse: AuthenticationResponse) => {
          this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
          this.setUser();
        })
      );
  }

  // Register method
  register(registration: Registration): Observable<AuthenticationResponse> {
    console.log("REGISTER: " + JSON.stringify(registration));
    return this.http
      .post<AuthenticationResponse>(environment.apiHost + 'userAccount/register', registration)
      .pipe(
        tap((authenticationResponse) => {
          this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
          this.setUser();
        })
      );
  }

  // Logout method
  logout(): void {
    this.router.navigate(['/home']).then(() => {
      this.tokenStorage.clear();
      this.user$.next({ username: "", id: 0, role: "", email: "" });
    });
  }

  // Fetch user information by email
  getUser(email: string | null): Observable<UserInfo> {
    const emailParam = email ? encodeURIComponent(email) : '';
    return this.http.get<UserInfo>(`${environment.apiHost}userAccount/getUserInfo?email=${emailParam}`);
  }

  // Check if user exists method
  checkIfUserExists(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken == null) {
      return;
    }
    this.setUser();
  }

  // Set user from decoded token
 // Set user from decoded token
private setUser(): void {
  const accessToken = this.tokenStorage.getAccessToken() || "";

  if (!accessToken) {
    console.error('Access token not found.');
    return;
  }

  const decodedToken = this.jwtHelper.decodeToken(accessToken);
  console.log('Decoded token:', decodedToken);

  const userEmail = decodedToken.email 
    || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] 
    || decodedToken.sub || '';

  const user: User = {
    id: +decodedToken.userId,
    username: decodedToken.sub,
    role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    email: userEmail
  };

  if (isNaN(user.id)) {
    console.error("User ID is missing or invalid in the decoded token.");
    user.id = 0;
  }

  console.log('Setting user:', user);
  this.user$.next(user);
}


  // Getter for current user ID
  getCurrentUserId(): number {
    return this.user$.value.id;
  }

  getUserPosts(email: string): Observable<any[]> {
    // Mock metoda - vraća prazan niz
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  /*getFollowers(email: string): Observable<any[]> {
    // Mock metoda - vraća prazan niz
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  getFollowing(email: string): Observable<any[]> {
    // Mock metoda - vraća prazan niz
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }*/

 changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
  const email = this.user$.value.email || localStorage.getItem('email') || '';
  return this.http.post(
    `${environment.apiHost}userAccount/changePassword`,
    data,
    { params: { email }, responseType: 'text' }
  );
}

updateProfile(userId: number, profileData: any): Observable<any> {
  const token = this.tokenStorage.getAccessToken();

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  return this.http.put(`${environment.apiHost}userAccount/${userId}/profile`, profileData, { headers });
}
  isAdmin(): boolean {
  return this.user$.value.role === 'ADMIN';
  }

  isUser(): boolean {
    return this.user$.value.role === 'USER';
  }
  
  isGuest(): boolean {
    return !this.tokenStorage.getAccessToken();
  }
  
  getUserById(id: number): Observable<UserInfo> {
    const token = this.tokenStorage.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
  
    return this.http.get<UserInfo>(`${environment.apiHost}userAccount/${id}`, { headers });
  }

  isFollowing(followerId: number, followingId: number) {
    return this.http.get<boolean>(
      `${environment.apiHost}follows/isFollowing?followerId=${followerId}&followingId=${followingId}`
    );
  }
  
  followUser(followerId: number, followingId: number) {
    return this.http.post(
      `${environment.apiHost}follows/follow?followerId=${followerId}&followingId=${followingId}`,
      {}
    );
  }
  
  unfollowUser(followerId: number, followingId: number) {
    return this.http.delete(
      `${environment.apiHost}follows/unfollow?followerId=${followerId}&followingId=${followingId}`
    );
  }
  
  getFollowers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiHost}follows/followers?userId=${userId}`);
  }
  
  getFollowing(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiHost}follows/following?userId=${userId}`);
  }
  
  
  
  
  
  



  

}