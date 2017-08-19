import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../../service/table.service'
import { DataContextService } from '../../../service/data-context.service'
//import { UiStateService } from '../../../service/ui-state.service'
import { ScriptService } from '../../../service/scripts.service'
import { SettingsService } from '../../../service/settings.service'
import { UtilsService } from '../../../service/utils.service'
import { LogService } from '../../../service/log.service'

import { Subscription } from 'rxjs/subscription'

@Component({
    selector: 'net-summary',
    templateUrl: './net-summary.component.html',
    styleUrls: ['./net-summary.component.css']
})
export class NetSummaryComponent implements OnInit, OnDestroy, AfterViewInit {

    public nsGridOptions:GridOptions

    nsTableHeight: number = 45;
    nsTableWidth: number = 1380;

    public summaryData: Subscription;
    public nsSummaryContextStream: Subscription;

    constructor(private tableService: TableService, 
                private dataContextService: DataContextService,
                //private uiStateService: UiStateService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private logService: LogService,
                private el: ElementRef) {

        //initialise gridoptions objects
        this.nsGridOptions = <GridOptions>{};

        //Summary Table gridoptions
        this.nsGridOptions.context = {}
        this.nsGridOptions.onCellValueChanged = ($event: any) => {
            let _rowIndex = $event.node.rowIndex
            let _colId = $event.column.colId 
            let _focusTable = 'gsGridOptions'
            this.scriptService.updateTable($event).subscribe(this.getSubscriber())
        }
        this.nsGridOptions.onGridReady = () => {
            this.nsGridOptions.api.setHeaderHeight(0)
        }

        this.nsGridOptions.singleClickEdit = true;
        this.nsGridOptions.enableColResize = true;
        this.nsGridOptions.suppressCellSelection=true;
        this.nsGridOptions.domLayout = 'forPrint'          
        this.nsGridOptions.rowHeight = 40
    }

    ngOnInit(){
        this.tableService.getTable('NetSummary').subscribe(table => {
            this.nsGridOptions.columnDefs = table;
        })

        this.summaryData = this.dataContextService.getSummaryDataStream().subscribe(data => {
            console.log(data);

            if(!this.nsGridOptions.rowData){
                this.nsGridOptions.rowData = data;
            } else if (this.nsGridOptions.api) {
                this.nsGridOptions.api.setRowData(data)
            }
        })

        this.nsSummaryContextStream = this.dataContextService.getResourceContextStream().subscribe(data => {
            let _summaryDataName = 'summaryData'    
            if(typeof(data)=='object'){
                if(this.nsGridOptions){
                    this.nsGridOptions.context.summaryData = JSON.parse(JSON.stringify(this.dataContextService[_summaryDataName]))
                    this.nsGridOptions.context.arrayName = _summaryDataName
                }
            }
        })        

        if(this.settingsService.initAppComplete) {
            this.scriptService.getAppData([this.utilsService.financeAppSummaryData],
                                        this.settingsService.year)
                                            .subscribe(this.getSubscriber())
        }
    }

    ngAfterViewInit(){
     
    }

    ngOnDestroy(){
        this.summaryData.unsubscribe()
        this.nsSummaryContextStream.unsubscribe()
    }

    getSubscriber() {
        return {
            next(data){ console.log('next', data) },
            error(err){ console.log('error', err) },
            complete(){ console.log('completed') }
        }
     }
}