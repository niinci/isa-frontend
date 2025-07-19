import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';

@Injectable({
  providedIn: 'root'
})
export class UserAccountService {
  private apiUrl = environment.apiHost + 'userAccount';


  constructor(private http: HttpClient) {}
  getAllUsers(page: number, size: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`);
  }
  searchByFirstName(firstName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/firstName`, { params: { firstName } });
  }
  searchByLastName(lastName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/lastName`, { params: { lastName } });
  }
  searchByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/email`, { params: { email } });
  }
  searchByUsername(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/username`, { params: { username } });
  }
  

  getUsernameById(userId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${userId}/username`, { responseType: 'text' });
  }
  searchByPostCount(min: number, max: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('min', min);
    params = params.append('max', max);
    return this.http.get(`${this.apiUrl}/search/postCount`, { params });
  }
  sortByFollowingCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sort/followingCount`);
  }
  sortByEmail(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sort/email`);
  }
}
