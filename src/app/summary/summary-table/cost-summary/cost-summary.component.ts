import { Component, OnInit, OnDestroy, ElementRef, AfterContentChecked } from '@angular/core'

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

import { FabricIconPanelWrapperComponent } from '../../../office-fabric/panel/fabric.panel.wrapper.component'

@Component({
    selector: 'cost-summary',
    templateUrl: './cost-summary.component.html',
    styleUrls: ['./cost-summary.component.css'],
    // make fade in animation available to this component
    animations: [fadeInAnimation]    
})
export class CostSummaryComponent implements OnInit, OnDestroy, AfterContentChecked {
    public title: string = 'Cost Summary';
    public tableReady: boolean = false;
    public csGridOptions:GridOptions

    csTableHeight: number = 43;
    csTableWidth: number = 1361;

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

            this.csGridOptions.singleClickEdit = true;
            this.csGridOptions.enableColResize = true;
            this.csGridOptions.rowHeight = 40
            this.csGridOptions.suppressCellSelection=true;
            this.csGridOptions.domLayout = 'forPrint'      

            //Summary Table gridoptions
            this.csGridOptions.context = {}
            this.csGridOptions.onCellValueChanged = ($event: any) => {
                if(+$event.newValue !== $event.oldValue) {
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
            this.csGridOptions.onGridReady = () => {
                if(this.csGridOptions.api){
                    this.csGridOptions.api.setHeaderHeight(0)
                }
                
            }

            this.csGridOptions.tabToNextCell = (params: any) => {
                let _focusTable = 'csGridOptions'
                this.handleTab(params, _focusTable, this.utilsService.financeAppSummaryData)
                return null;
            }
            this.csGridOptions.navigateToNextCell = (params: any) => {
                console.error('CLICK')
                let _focusTable = 'csGridOptions'
                this.handleNavigate(params, _focusTable, this.utilsService.financeAppSummaryData)
                return null;
            }
    
            this.csGridOptions.onCellClicked = (event: any) => {
                let _focusTable = 'csGridOptions'
                this.handleClick(event, _focusTable, this.utilsService.financeAppSummaryData)
            }            

       
        }

    ngOnInit(){
        this.tableService.getTable('CostSummary').subscribe(table => {
            this.csGridOptions.columnDefs = table;
        })

        this.summaryData = this.dataContextService.getSummaryDataStream().subscribe(data => {
            console.error('COST SUMMARY DATA RECEIVED')
            if(!this.csGridOptions.rowData){
                this.csGridOptions.rowData = data;
            } 
            
            if (this.csGridOptions.api) {
                this.csGridOptions.api.setRowData(data)
            }
            
            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            this.updateFocusedCell()
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
                            .subscribe(data => console.log(data),
                                        err => console.log(err),
                                        ()=> this.uiStateService.updateMessage(`App Data Retrieved`, this.utilsService.completeStatus)
                                                .subscribe(this.getSubscriber()))
        }


    }

    ngOnDestroy(){
        this.summaryData.unsubscribe()
        this.csSummaryContextStream.unsubscribe()
    }

    ngAfterContentChecked(){
        this.tableReady = true;
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