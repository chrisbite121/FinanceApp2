import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../../service/table.service'
import { DataContextService } from '../../../service/data-context.service'
import { UiStateService } from '../../../service/ui-state.service'
import { ScriptService } from '../../../service/scripts.service'
import { SettingsService } from '../../../service/settings.service'
import { UtilsService } from '../../../service/utils.service'
import { LogService } from '../../../service/log.service'

import { Subscription } from 'rxjs/subscription'


@Component({
    selector: 'cost-summary',
    templateUrl: './cost-summary.component.html',
    styleUrls: ['./cost-summary.component.css']
})
export class CostSummaryComponent implements OnInit, OnDestroy, AfterViewInit {

    public csGridOptions:GridOptions

    csTableHeight: number = 45;
    csTableWidth: number = 991;

    public summaryData: Subscription;
    public csSummaryContextStream: Subscription

    constructor(private tableService: TableService, 
                private dataContextService: DataContextService,
                private uiStateService: UiStateService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private logService: LogService,
                private el: ElementRef) {


            //initialise gridoptions objects
            this.csGridOptions = <GridOptions>{};

            //Summary Table gridoptions
            this.csGridOptions.context = {}
            this.csGridOptions.onCellValueChanged = ($event: any) => {
                let _rowIndex = $event.node.rowIndex
                let _colId = $event.column.colId                
                let _focusTable = 'gsGridOptions'
                this.uiStateService.updateFocusedCell(this.utilsService.financeAppSummaryData, _focusTable, _rowIndex, _colId)
                this.scriptService.updateTable($event).subscribe(this.getSubscriber())

            }
            this.csGridOptions.onGridReady = () => {
                this.csGridOptions.api.setHeaderHeight(0)
            }

            this.csGridOptions.singleClickEdit = true;
            this.csGridOptions.enableColResize = true;
            this.csGridOptions.rowHeight = 40
            this.csGridOptions.suppressCellSelection=true;
            this.csGridOptions.domLayout = 'forPrint'             
        }

    ngOnInit(){
        this.tableService.getTable('CostSummary').subscribe(table => {
            this.csGridOptions.columnDefs = table;
        })

        this.summaryData = this.dataContextService.getSummaryDataStream().subscribe(data => {

            if(!this.csGridOptions.rowData){
                this.csGridOptions.rowData = data;
            } else if (this.csGridOptions.api) {
                this.csGridOptions.api.setRowData(data)
            }
            
            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            let focusedCellData = this.uiStateService.getFocusCellData()
            if(this[focusedCellData.gridOptions]) {
                this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
                this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            }
        })

        this.csSummaryContextStream = this.dataContextService.getResourceContextStream().subscribe(data => {
            let _summaryDataName = 'summaryData'    
            if(typeof(data)=='object'){
                if(this.csGridOptions){
                    this.csGridOptions.context.summaryData = JSON.parse(JSON.stringify(this.dataContextService[_summaryDataName]))
                    this.csGridOptions.context.arrayName = _summaryDataName
                }
            }
        })

        if(this.settingsService.initAppComplete) {
            this.scriptService.getAppData([this.utilsService.financeAppSummaryData],
                                        this.settingsService.year)
                                            .subscribe(this.getSubscriber())
        }


    }

    ngOnDestroy(){
        this.summaryData.unsubscribe()
        this.csSummaryContextStream.unsubscribe()
    }

    ngAfterViewInit(){

    }

    getSubscriber() {
        return {
            next(data){ console.log('next', data) },
            error(err){ console.log('error', err) },
            complete(){ console.log('completed') }
        }
     }
    
}