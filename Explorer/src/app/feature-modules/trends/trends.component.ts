import { Component, OnInit } from '@angular/core';
import { TrendsService } from '../services/trends.service';
import { TrendsData } from '../post/model/trends-data.model';

const backendBaseUrl = 'http://localhost:8080/';

@Component({
  selector: 'xp-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.css']
})
export class TrendsComponent implements OnInit {

  loading = false;
  error: string | null = null;
  trendsData: TrendsData | null = null;

  constructor(private trendsService: TrendsService) {}

  ngOnInit(): void {
    this.loading = true;

    this.trendsService.getTrends().subscribe({
  next: (data) => {
    // Dodaj prefix ka backendu za slike
    data.top5PostsLast7Days.forEach(post => {
      if (post.imageUrl && !post.imageUrl.startsWith('http')) {
        post.imageUrl = backendBaseUrl + post.imageUrl;
      }
    });

    data.top10PostsEver.forEach(post => {
      if (post.imageUrl && !post.imageUrl.startsWith('http')) {
        post.imageUrl = backendBaseUrl + post.imageUrl;
      }
    });

    this.trendsData = data;
    this.loading = false;
  },
  error: (err) => {
    this.error = 'Greška pri učitavanju trendova.';
    this.loading = false;
  }
});
  }
}
