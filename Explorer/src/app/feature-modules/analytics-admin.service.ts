import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment'; 


export interface AnalyticsCountsDTO {
  weeklyComments: number;
  monthlyComments: number;
  yearlyComments: number;
  weeklyPosts: number;
  monthlyPosts: number;
  yearlyPosts: number;
}

export interface UserActivityDistributionDTO {
  postMakersPercentage: number;
  commentOnlyPercentage: number;
  inactivePercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsAdminService {

  private apiUrl = environment.apiHost + 'analytics'; 

  constructor(private http: HttpClient) {}

  getCounts(): Observable<AnalyticsCountsDTO> {
    return this.http.get<AnalyticsCountsDTO>(`${this.apiUrl}/counts`);
  }

  getUserActivityDistribution(): Observable<UserActivityDistributionDTO> {
    return this.http.get<UserActivityDistributionDTO>(`${this.apiUrl}/user-distribution`);
  }
}
