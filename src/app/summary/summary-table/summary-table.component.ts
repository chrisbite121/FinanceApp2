import { Component, OnInit } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { GrossSummaryComponent } from './gross-summary/gross-summary.component'
import { NetSummaryComponent } from './net-summary/net-summary.component'
import { CostSummaryComponent } from './cost-summary/cost-summary.component'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'
import { LogService } from '../../service/log.service'

@Component({
    selector: 'summary-table',
    templateUrl: './summary-table.component.html',
    styleUrls: ['./summary-table.component.css']
})
export class SummaryTableComponent {


    constructor(){}



}