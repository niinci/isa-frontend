import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { AnalyticsAdminService, AnalyticsCountsDTO } from '../../analytics-admin.service';

Chart.register(...registerables);

@Component({
  selector: 'xp-analytics-admin',
  templateUrl: './analytics-admin.component.html',
  styleUrls: ['./analytics-admin.component.css']
})
export class AnalyticsAdminComponent implements OnInit, AfterViewInit {

  @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  counts?: AnalyticsCountsDTO;

  userActivityData: number[] = [0, 0, 0]; 

  userActivityLabels = ['Post Made', 'Only Comments', 'Inactive'];

  userActivityOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        onClick: (e, legendItem, legend) => {
        }
      }
    }
  };
  
  constructor(private analyticsService: AnalyticsAdminService) {}

  ngOnInit(): void {
    //TEST
    this.userActivityData = [50, 30, 20];

    this.analyticsService.getCounts().subscribe(data => {
      this.counts = data;
      console.log('Counts data:', data);  
    });

    this.analyticsService.getUserActivityDistribution().subscribe(data => {
      console.log('User activity distribution:', data);  
      this.userActivityData = [
        data.postMakersPercentage,
        data.commentOnlyPercentage,
        data.inactivePercentage
      ];

      if (this.chart) {
        this.chart.data.datasets[0].data = this.userActivityData;
        this.chart.update();
        console.log('Chart data updated:', this.userActivityData);
      }
    });
  }

  ngAfterViewInit(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d')!;
    // Inicijalizuj Chart.js grafikon
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.userActivityLabels,
        datasets: [{
          data: this.userActivityData,
          backgroundColor: ['#4caf50', '#ff9800', '#f44336']
        }]
      },
      options: this.userActivityOptions
    });
  }
}
