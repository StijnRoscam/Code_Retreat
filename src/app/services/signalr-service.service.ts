import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'
import axios, { AxiosResponse } from 'axios';
import { config, Subject } from 'rxjs';
import { Currencies } from '../models/currencies';
import { Currency } from '../models/currency';
import { UserPortfolio } from '../models/user-portfolio';

@Injectable({
  providedIn: 'root'
})
export class SignalrServiceService {
  jwttoken: string;
  currencies: any[] = [];
  public portfolio:UserPortfolio;
  portfolioChanged = new Subject<UserPortfolio>();

  PastRate: Currency[][];
  CurrentRate: Currency[];

  counter: number = 0;

  constructor() { }


  private hubConnection: signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://involvedexchangewebapi20210324153741.azurewebsites.net/InvolvedExchange', {withCredentials: false})
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => console.log('connection started')).catch(err => console.log('error while starting connection ' + err))
  }

  public addDataListener = () => {
    this.hubConnection.on('CurrencyUpdate', (data) => {
      if (this.counter++ % 3 == 0) {
        this.GetCurrencies();
        this.GetPortfolio();
      }
    });
  }

  public getLocalStorage() {
    const currencies = localStorage.getItem('currencies')
    if (currencies !== null) {
      this.currencies = JSON.parse(currencies)
    }
  }

  public login(){
    axios.post('https://involvedexchangewebapi20210324153741.azurewebsites.net/api/User/Authenticate', {username: "stagiairs", password: "test123"})
      .then((_:AxiosResponse<AuthenticateResponse>) => {
        this.jwttoken = _.data.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.jwttoken}`;
        this.GetPortfolio();
      });
  }

  public GetCurrencies(){
    axios.get('https://involvedexchangewebapi20210324153741.azurewebsites.net/api/Currency/GetCurrencies')
      .then(_ => {
        this.currencies.push(_.data);
        if(this.currencies.length > 500)
        this.currencies = this.currencies.slice(this.currencies.length - 500)
        localStorage.setItem('currencies', JSON.stringify(this.currencies));
        console.log("Added new data to history");
        this.CalculateTrends()
      });
  }

  public CalculateTrends(){
    const movingAveragesLongPrevious = {}
    const movingAveragesLongCurrent = {}
    const movingAveragesPrevious = {}
    const movingAveragesCurrent = {}
    this.currencies[this.currencies.length - 1]
    for (let index = 0; index < 70; index++) {
      this.currencies[this.currencies.length - 1 - index].forEach((currency: Currency) => {
        if(movingAveragesPrevious[currency.id] == null)
          movingAveragesPrevious[currency.id] = 0
        movingAveragesPrevious[currency.id] += currency.value / 70
      });
      this.currencies[this.currencies.length - 11 - index].forEach((currency: Currency) => {
        if(movingAveragesCurrent[currency.id] == null)
          movingAveragesCurrent[currency.id] = 0
        movingAveragesCurrent[currency.id] += currency.value / 70
      })
    }
    for (let index = 0; index < 490; index++) {
      this.currencies[this.currencies.length - 1 - index].forEach((currency: Currency) => {
        if(movingAveragesLongPrevious[currency.id] == null)
          movingAveragesLongPrevious[currency.id] = 0
        movingAveragesLongPrevious[currency.id] += currency.value / 490
      });
      this.currencies[this.currencies.length -10- index].forEach((currency: Currency) => {
        if(movingAveragesLongCurrent[currency.id] == null)
          movingAveragesLongCurrent[currency.id] = 0
        movingAveragesLongCurrent[currency.id] += currency.value / 490
      })
    }
    Object.keys(movingAveragesCurrent).forEach(key => {
      const change = movingAveragesCurrent[key] / movingAveragesPrevious[key]
      const changeLong = movingAveragesLongCurrent[key] / movingAveragesLongPrevious[key]
      console.log('ma:' + change)
      console.log('malong:' + changeLong)
      if(changeLong > 1 && change > 1){
        this.BuyFromEuro(key, this.portfolio.currencies.find(_ => _.currencyId == '1d83cb98-b184-448f-89c4-90262310036f').amount*0.005)
      }
      if(changeLong < 1 && change > 1){
        this.SellToEuro(key, this.portfolio.currencies.find(_ => _.currencyId == key).amount*0.006)
      }
    }
    )



    //kopen : stijgende trend en lage value

    //verkopen: dalende trende en hoge value --> als we al winst genoeg hebben

    //Idee: nog meerdere averages berekenen zodat we het verschil tussen recent en wat langer kunnen berekenen zodat we sneller kunnen ingrijpen als onze trade slecht is aan het gaan
  }

  public GetPortfolio(){
    axios.get('https://involvedexchangewebapi20210324153741.azurewebsites.net/api/Account/GetPortfolio')
      .then(_ => {
        this.portfolio = _.data;
        this.portfolioChanged.next(this.portfolio);
      });
  }

  public BuyItem(toSell: string, toBuy: string, toSellAmount: number, toBuyAmount: number ){
    axios.post('https://involvedexchangewebapi20210324153741.azurewebsites.net/api/Account/BuyCurrency',{
      fromCurrencyId: toSell,
      toCurrencyId: toBuy,
      fromAmount: toSellAmount,
      toAmount: toBuyAmount
    });
    this.GetPortfolio();
  }

  public SellToEuro(coin: string, amount: number){
    axios.post('https://involvedexchangewebapi20210324153741.azurewebsites.net/api/Account/BuyCurrency',{
      fromCurrencyId: coin,
      toCurrencyId: '1d83cb98-b184-448f-89c4-90262310036f',
      fromAmount: amount,
      toAmount: 0
    });
    this.GetPortfolio();
  }

  public BuyFromEuro(coin: string, amount: number){
    axios.post('https://involvedexchangewebapi20210324153741.azurewebsites.net/api/Account/BuyCurrency',{
      fromCurrencyId: '1d83cb98-b184-448f-89c4-90262310036f',
      toCurrencyId: coin,
      fromAmount: amount,
      toAmount: 0
    });
    this.GetPortfolio();
  }
}

export interface AuthenticateResponse{
  userName: string;
  token: string;
}
