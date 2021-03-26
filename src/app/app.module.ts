import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataProcessingOutputComponent } from './components/data-processing-output/data-processing-output.component';
import { ChartsModule } from 'ng2-charts';
import { TestFileComponent } from './components/test/test-file/test-file.component';

@NgModule({
  declarations: [
    AppComponent,
    DataProcessingOutputComponent,
    TestFileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
