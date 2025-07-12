import { Component, OnInit } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { AnalyticsAdminService, AnalyticsCountsDTO } from '../../analytics-admin.service';

@Component({
  selector: 'xp-analytics-admin',
  templateUrl: './analytics-admin.component.html',
  styleUrls: ['./analytics-admin.component.css']
})
export class AnalyticsAdminComponent implements OnInit {

  counts?: AnalyticsCountsDTO;

  userActivityLabels = ['Post Made', 'Only Comments', 'Inactive'];

  userActivityData: ChartData<'doughnut'> = {
    labels: this.userActivityLabels,
    datasets: [
      {
        data: []
      }
    ],
  };

  userActivityOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' } 
    }
  };

  chartType: ChartType = 'pie';  

  constructor(private analyticsService: AnalyticsAdminService) {}

  ngOnInit(): void {
    this.analyticsService.getCounts().subscribe(data => {
      this.counts = data;
    });

    this.analyticsService.getUserActivityDistribution().subscribe(data => {
      this.userActivityData.datasets[0].data = [
        data.postPercentage,
        data.commentOnlyPercentage,
        data.inactivePercentage
      ];
    });
  }
}