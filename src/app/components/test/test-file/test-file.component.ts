import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TestServiceService } from 'src/app/services/test-service.service';

@Component({
  selector: 'app-test-file',
  templateUrl: './test-file.component.html',
  styleUrls: ['./test-file.component.scss']
})
export class TestFileComponent implements OnInit {
  public chartOptions: any = {
    scaleShowVerticalLines: true,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  public chartLabels: string[] = ['Real time data for the chart'];
  public chartType: string = 'bar';
  public chartLegend: boolean = true;
  public colors: any[] = [{ backgroundColor: '#5491DA' }, { backgroundColor: '#E74C3C' }, { backgroundColor: '#82E0AA' }, { backgroundColor: '#E5E7E9' }]

  public chartClicked = (event: Event) => {
    console.log(event);
    //this.signalRService.broadcastChartData();
  }

  constructor(public signalRService: TestServiceService, private http: HttpClient ) { }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.addTransferChartDataListener();
    //this.signalRService.addBroadcastChartDataListener();
    this.startHttpRequest();
  }

  private startHttpRequest(){
    this.http.get('https://localhost:5001/api/chart').subscribe(res => console.log(res));
  }

}


