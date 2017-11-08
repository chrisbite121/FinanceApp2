import { Component, OnInit } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../service/table.service'
import { DataContextService } from '../service/data-context.service'
import { UiStateService } from '../service/ui-state.service'
// import { WorkdayService } from '../service/workdays.service'
import { ScriptService } from '../service/scripts.service'
import { SettingsService } from '../service/settings.service'

import { IYear } from '../model/year.model'
@Component({
    selector: 'fyb2',
    templateUrl: './tab1.component.html',
    styleUrls: ['./tab1.component.css']
})
export class Tab1Component implements OnInit {
    ngOnInit(){

    }

}