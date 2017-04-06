import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import { RouterModule } from '@angular/router';
// ag-grid
import {AgGridModule} from "ag-grid-angular/main";

//services
import { LogService } from './shared/log.service'
import { HistoryService } from './shared/history.service'
import { WorkdayService } from './shared/workdays.service'
import { SettingsService } from './shared/settings.service'
import { TableService } from './shared/table.service'
import { DataCalcService } from './shared/data-calc.service'
import { DataContextService } from './shared/data-context.service'
import { DataApiService } from './shared/data-api.service'
import { UiStateService } from './shared/ui-state.service'

// application
import {AppComponent} from "./app.component";
import {Error404Component} from './errors/404.component';
import { NavBarComponent } from './nav/navbar.component';
import { SummaryComponent } from './summary/summary.component';
import { Tab1Component } from './tab1/tab1.component';
import { SettingsModule } from './settings/settings.module'

//routes
import { appRoutes } from './routes'




@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        AgGridModule.withComponents([]
        ),
        SettingsModule
    ],
    declarations: [
        AppComponent,
        Error404Component,
        NavBarComponent,
        SummaryComponent,
        Tab1Component
    ],
  providers:    [ 
        LogService,
        HistoryService,
        WorkdayService,
        SettingsService,
        TableService,
        DataCalcService,
        DataContextService,
        DataApiService,
        UiStateService
                  ],    
    bootstrap: [AppComponent]
})
export class AppModule {
}