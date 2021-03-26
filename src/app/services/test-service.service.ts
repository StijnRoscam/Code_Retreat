import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'

@Injectable({
  providedIn: 'root'
})
export class TestServiceService {

  constructor() { }

  //public broadcastedData: ChartModel[];

  private hubConnection: signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://involvedexchangewebapi20210324153741.azurewebsites.net/InvolvedExchange')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => console.log('connection started')).catch(err => console.log('error while starting connection ' + err))
  }

  public addTransferChartDataListener = () => {
    this.hubConnection.on('CurrencyUpdate', (data) => {
      console.log(data);
    });
  }
}


export interface CurrencyUpdate{

}
