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
    selector: 'gross-summary',
    templateUrl: './gross-summary.component.html',
    styleUrls: ['./gross-summary.component.css']
})
export class GrossSummaryComponent implements OnInit, OnDestroy, AfterViewInit {

    public gsGridOptions:GridOptions

    gsTableHeight: number = 45;
    gsTableWidth: number = 1400;

    public _focusCell:any
    public _focusTable:string
    // public focusCellStream: Subscription

    public summaryData: Subscription;
    public gsSummaryContextStream: Subscription

    constructor(private tableService: TableService, 
                private dataContextService: DataContextService,
                private uiStateService: UiStateService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private logService: LogService,
                private el: ElementRef) {

        //initialise gridoptions objects
        this.gsGridOptions = <GridOptions>{};

        //Summary Table gridoptions
        this.gsGridOptions.context = {}

        this.gsGridOptions.onCellValueChanged = ($event: any) => {

            this._focusCell = this.gsGridOptions.api.getFocusedCell()
            this._focusTable = 'gsGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppSummaryData, this._focusTable, this._focusCell.rowIndex, this._focusCell.column.colId)
            this.scriptService.updateTable($event).subscribe(this.getSubscriber())

        }
        this.gsGridOptions.onGridReady = () => {
            this.gsGridOptions.api.setHeaderHeight(0)
        }

        this.gsGridOptions.singleClickEdit = true;
        this.gsGridOptions.enableColResize = true;
        this.gsGridOptions.rowHeight = 40
    }

    ngOnInit(){
        this.tableService.getTable('GrossSummary').subscribe(table => {
            this.gsGridOptions.columnDefs = table;
        })

        this.summaryData = this.dataContextService.getSummaryDataStream().subscribe(data => {
            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            let focusedCellData = this.uiStateService.getFocusCellData()
            if(this[focusedCellData.gridOptions]) {
                this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
                this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            }

            if(!this.gsGridOptions.rowData){
                this.gsGridOptions.rowData = data;
            } else if (this.gsGridOptions.api) {
                this.gsGridOptions.api.setRowData(data)
            }

            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            // let focusedCellData = this.uiStateService.getFocusCellData()
            // if(this[focusedCellData.gridOptions]) {
            //     // console.error('setting editing cell')
            //     // console.log(focusedCellData)
            //     this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
            //     this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            // }
        })

        this.gsSummaryContextStream = this.dataContextService.getResourceContextStream().subscribe(data => {
            let _summaryDataName = 'summaryData'    
            if(typeof(data)=='object'){
                if(this.gsGridOptions){
                    this.gsGridOptions.context.summaryData = JSON.parse(JSON.stringify(this.dataContextService[_summaryDataName]))
                    this.gsGridOptions.context.arrayName = _summaryDataName
                }
            }
        })

        // this.focusCellStream = this.uiStateService.getFocusCellDataStream().subscribe(data => {
        //     if(this[data.gridOptions]){
        //         console.log(data.rowIndex)
        //         console.log(data.columnId)
        //         console.log('setting gross summary focus cell')
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

    ngAfterViewInit(){
     
    }

    ngOnDestroy(){
        this.summaryData.unsubscribe()
        this.gsSummaryContextStream.unsubscribe()
        // this.focusCellStream.unsubscribe()
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