import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import { RouterModule } from '@angular/router';

//services
import { LogService } from './service/log.service'
import { HistoryService } from './service/history.service'
import { WorkdayService } from './service/workdays.service'
import { SettingsService } from './service/settings.service'
import { TableService } from './service/table.service'
import { DataCalcService } from './service/data-calc.service'
import { DataContextService } from './service/data-context.service'
import { CommonApiService } from './service/api-common.service'
import { UiStateService } from './service/ui-state.service'
import { UtilsService } from './service/utils.service'
import { ListService } from './service/list.service'
import { ScriptService } from './service/scripts.service'
import { HealthReportService } from './service/health-report.service'
import { NotificationService } from './service/notification.service'

// application
import {AppComponent} from "./app.component";
import {Error404Component} from './errors/404.component';
import { NavBarComponent } from './nav/navbar.component';

import { FabricMainCommandBarWrapperComponent } from './office-fabric/commandbar/fabric.mainCommandbar.wrapper.component'

//modules
import { SummaryModule } from './summary/summary.module'
import { Tab1Module } from './tab1/tab1.module'
import { SettingsModule } from './settings/settings.module'

//routes
import { appRoutes } from './routes'

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        Tab1Module,
        SummaryModule,
        SettingsModule
    ],
    declarations: [
        AppComponent,
        Error404Component,
        NavBarComponent,
        FabricMainCommandBarWrapperComponent
    ],
  providers:    [ 
        LogService,
        HistoryService,
        WorkdayService,
        SettingsService,
        TableService,
        DataCalcService,
        DataContextService,
        CommonApiService,
        UtilsService,
        UiStateService,
        ListService,
        ScriptService,
        HealthReportService,
        NotificationService

        ],    
    bootstrap: [AppComponent]
})
export class AppModule {
}