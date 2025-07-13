import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrendsData } from '../post/model/trends-data.model';

@Injectable({
  providedIn: 'root'
})
export class TrendsService {
private baseUrl = 'http://localhost:8080/api/posts/trends';

  constructor(private http: HttpClient) {}

  getTrends(): Observable<TrendsData> {
    return this.http.get<TrendsData>(this.baseUrl);
  }
}