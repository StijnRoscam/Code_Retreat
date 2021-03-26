import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr'
import { Subscription } from 'rxjs';
import { UserPortfolio } from 'src/app/models/user-portfolio';
import { SignalrServiceService } from 'src/app/services/signalr-service.service';

@Component({
  selector: 'app-data-processing-output',
  templateUrl: './data-processing-output.component.html',
  styleUrls: ['./data-processing-output.component.scss']
})
export class DataProcessingOutputComponent implements OnInit {
  private subscription: Subscription;

  constructor(private signalRService: SignalrServiceService, private http: HttpClient) { }

  total: number;

  portfolio: UserPortfolio;

  ngOnInit(): void {
    this.signalRService.getLocalStorage();
    this.signalRService.login();
    this.signalRService.startConnection();
    this.signalRService.addDataListener();

    this.portfolio = this.signalRService.portfolio;

    this.subscription = this.signalRService.portfolioChanged.subscribe(
      (portfolio: UserPortfolio) => {
        this.portfolio = portfolio;
        this.total = 0;
        portfolio.currencies.forEach(element => {
          this.total += element.value;
        });
      }
    )
  }

  private startHttpRequest(){
    this.http.get('https://involvedexchangewebapi20210324153741.azurewebsites.net/api/Currency/GetCurrencies').subscribe(res => console.log(res));
  }

  public buyCoin(){
    // this.signalRService.BuyItem( "1d83cb98-b184-448f-89c4-90262310036f", "79428676-eac3-4056-a6a8-6aa63c679d8d", 1, 0);
    // this.getPortfolio();
  }

  public getPortfolio(){
    this.signalRService.GetPortfolio();
    this.portfolio = this.signalRService.portfolio;
  }
}
