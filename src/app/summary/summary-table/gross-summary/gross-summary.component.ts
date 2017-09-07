import { Component, OnInit, OnDestroy, AfterContentChecked, ElementRef } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../../service/table.service'
import { DataContextService } from '../../../service/data-context.service'
import { UiStateService } from '../../../service/ui-state.service'
import { ScriptService } from '../../../service/scripts.service'
import { SettingsService } from '../../../service/settings.service'
import { UtilsService } from '../../../service/utils.service'
import { LogService } from '../../../service/log.service'
import { fadeInAnimation } from '../../../animations/fade-in.animation'

import { Subscription } from 'rxjs/subscription'

@Component({
    selector: 'gross-summary',
    templateUrl: './gross-summary.component.html',
    styleUrls: ['./gross-summary.component.css'],
    // make fade in animation available to this component
    animations: [fadeInAnimation]
})
export class GrossSummaryComponent implements OnInit, OnDestroy, AfterContentChecked {
    public title: string = 'Gross Summary'
    public tableReady: boolean = false;
    public gsGridOptions:GridOptions

    public gsTableHeight: number = 43;
    public gsTableWidth: number = 1361;

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
        this.gsGridOptions.singleClickEdit = true;
        this.gsGridOptions.enableColResize = true;
        this.gsGridOptions.suppressCellSelection=true;
        this.gsGridOptions.domLayout = 'forPrint';         
        this.gsGridOptions.rowHeight = 40

        this.gsGridOptions.onCellValueChanged = ($event: any) => {
            if(+$event.oldValue !== $event.newValue){
                this.scriptService.updateTable($event)
                .subscribe(
                    data => console.log(data),
                    err => console.log(err),
                    () => { 
                        console.error('COMPLETED');                            
                        this.uiStateService.updateMessage('update completed', this.utilsService.completeStatus).subscribe(this.getSubscriber())
                });
            } else {
                this.updateFocusedCell()
            }
        }

        this.gsGridOptions.tabToNextCell = (params: any) => {
            let _focusTable = 'gsGridOptions'
            this.handleTab(params, _focusTable, this.utilsService.financeAppSummaryData)
            return null;
        }
        this.gsGridOptions.navigateToNextCell = (params: any) => {
            let _focusTable = 'gsGridOptions'
            this.handleNavigate(params, _focusTable, this.utilsService.financeAppSummaryData)
            return null;
        }

        this.gsGridOptions.onCellClicked = (event: any) => {
            let _focusTable = 'gsGridOptions'
            this.handleClick(event, _focusTable, this.utilsService.financeAppSummaryData)
        }

        this.gsGridOptions.onGridReady = () => {
            if(this.gsGridOptions.api){
                this.gsGridOptions.api.setHeaderHeight(0)
            }

        }
    }

    ngOnInit(){
        this.tableService.getTable('GrossSummary').subscribe(table => {
            this.gsGridOptions.columnDefs = table;
        })

        this.summaryData = this.dataContextService.getSummaryDataStream().subscribe(data => {
            if(!this.gsGridOptions.rowData){
                this.gsGridOptions.rowData = data;
            } 
            
            if (this.gsGridOptions.api) {
                this.gsGridOptions.api.setRowData(data)
            }

            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            this.updateFocusedCell()
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

        if(this.settingsService.initAppComplete) {
            this.scriptService.getAppData([this.utilsService.financeAppSummaryData],
                                        this.settingsService.year)
                            .subscribe(data => console.log(data),
                                        err => console.log(err),
                                        ()=> this.uiStateService.updateMessage(`App Data Retrieved`, this.utilsService.completeStatus)
                                                .subscribe(this.getSubscriber()));
        }

        
    }

    ngAfterContentChecked(){
        this.tableReady = true;
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

     updateFocusedCell(){
        let focusedCellData = this.uiStateService.getFocusCellData()
        if(this[focusedCellData.gridOptions]) {
            this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
            this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
        }
    }

    handleClick(event, focusTable, listName){
        console.error('CLICK')
        let _colId = event.column.colId;
        let _rowIndex = event.node.rowIndex;
        let _rowCount = this[focusTable].api.getDisplayedRowCount()
        this.uiStateService.moveFocusedCell(listName, focusTable, _rowIndex, _colId, _rowCount, this.utilsService.directionStay)
        this[focusTable].api.stopEditing(false)
    }

    handleTab(params, focusTable, listName){
        let _colId = params.previousCellDef.column.colId;
        let _rowIndex = params.previousCellDef.rowIndex;
        let _rowCount = this[focusTable].api.getDisplayedRowCount()
        this.uiStateService.moveFocusedCell(listName, focusTable, _rowIndex, _colId, _rowCount, this.utilsService.directionRight)
        this[focusTable].api.stopEditing()
    }

    handleNavigate(params, focusTable, listName){
        let _colId = params.previousCellDef.column.colId;
        let _rowIndex = params.previousCellDef.rowIndex;
        let _rowCount = this[focusTable].api.getDisplayedRowCount()
        //right arrow
        if(params.event.keyCode == 39) {
            this.uiStateService.moveFocusedCell(listName, focusTable, _rowIndex, _colId, _rowCount, this.utilsService.directionRight)
        //left arrow
        } else if (params.event.keyCode == 37) {
            this.uiStateService.moveFocusedCell(listName, focusTable, _rowIndex, _colId, _rowCount, this.utilsService.directionLeft)
        //key up
        } else if (params.event.keyCode == 38) {
            this.uiStateService.moveFocusedCell(listName, focusTable, _rowIndex, _colId, _rowCount, this.utilsService.directionUp)
        //key down
        } else if (params.event.keyCode == 40) {
            this.uiStateService.moveFocusedCell(listName, focusTable, _rowIndex, _colId, _rowCount, this.utilsService.directionDown)
        }
        this[focusTable].api.stopEditing()
    }   

}