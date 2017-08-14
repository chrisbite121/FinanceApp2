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
    csTableWidth: number = 1400;

    public _focusCell:any
    public _focusTable:string
    

    public summaryData: Subscription;
    public csSummaryContextStream: Subscription
    // public focusCellStream: Subscription

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
                this._focusTable = 'gsGridOptions'
                this._focusCell = this.csGridOptions.api.getFocusedCell()
                this.uiStateService.updateFocusedCell(this.utilsService.financeAppSummaryData, this._focusTable, this._focusCell.rowIndex, this._focusCell.column.colId)
                // this.csGridOptions.api.clearFocusedCell()
                this.scriptService.updateTable($event).subscribe(this.getSubscriber())

            }
            this.csGridOptions.onGridReady = () => {
                this.csGridOptions.api.setHeaderHeight(0)
            }

            this.csGridOptions.singleClickEdit = true;
            this.csGridOptions.enableColResize = true;
            this.csGridOptions.rowHeight = 40                    
        }

    ngOnInit(){
        this.tableService.getTable('CostSummary').subscribe(table => {
            this.csGridOptions.columnDefs = table;
        })

        this.summaryData = this.dataContextService.getSummaryDataStream().subscribe(data => {
            console.error('DATA')

            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            let focusedCellData = this.uiStateService.getFocusCellData()
            if(this[focusedCellData.gridOptions]) {
                this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
                this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            }            

            if(!this.csGridOptions.rowData){
                this.csGridOptions.rowData = data;
            } else if (this.csGridOptions.api) {
                this.csGridOptions.api.setRowData(data)
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
        
        // this.focusCellStream = this.uiStateService.getFocusCellDataStream().subscribe(data => {
        //     console.error('FOCUS')
        //     if(this[data.gridOptions]){
        //         this[data.gridOptions].api.setFocusedCell(data.rowIndex, data.columnId)
        //         this[data.gridOptions].api.startEditingCell({colKey: data.columnId,rowIndex: data.rowIndex})
        //     }
        // })        

        if(this.settingsService.initAppComplete) {
            this.scriptService.getAppData([this.utilsService.financeAppSummaryData],
                                        this.settingsService.year)
                                            .subscribe(this.getSubscriber())
        }


    }

    ngOnDestroy(){
        this.summaryData.unsubscribe()
        this.csSummaryContextStream.unsubscribe()
        // this.focusCellStream.unsubscribe()
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
    
    // setCellFocus(){
    //     if (this._focusCell && 
    //         this._focusCell.rowIndex >=0 &&
    //         this._focusCell.column &&
    //         this._focusCell.column.colId &&
    //         this._focusTable &&
    //         this[this._focusTable] &&
    //         this[this._focusTable].api
    //         ) {
    //         try { //set focused column
    //             this[this._focusTable].api.setFocusedCell(this._focusCell.rowIndex, this._focusCell.column.colId)
    //             this[this._focusTable].api.tabToNextCell()
    //         } catch (e) {
    //             this.logService.log(`error tyring to set cell focus on focusTable: ${this._focusTable}` )
    //         }
    //     }       
    // }     
}