import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module'

//components
import { SummaryComponent } from './summary.component'
import { HomeComponent } from './home/home.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { SummaryNavComponent } from './nav/summary-nav.component'
import { SummaryTableComponent } from './summary-table/summary-table.component'
import { NetSummaryComponent } from './summary-table/net-summary/net-summary.component'
import { GrossSummaryComponent } from './summary-table/gross-summary/gross-summary.component'
import { CostSummaryComponent } from './summary-table/cost-summary/cost-summary.component'

//Ag-Grid
import {AgGridModule} from "ag-grid-angular/main";



import { summaryRoutes } from './summary.routes'

@NgModule({
    imports: [
        // CommonModule,
        RouterModule.forChild(summaryRoutes),
        AgGridModule.withComponents([]),          
        SharedModule
    ],
    declarations: [
        SummaryComponent,
        HomeComponent,
        DashboardComponent,
        SummaryNavComponent,
        SummaryTableComponent,
        NetSummaryComponent,
        GrossSummaryComponent,
        CostSummaryComponent
    ],
    exports: []
})
export class SummaryModule {}