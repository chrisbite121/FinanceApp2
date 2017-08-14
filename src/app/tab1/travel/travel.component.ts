import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'
import { UiStateService } from '../../service/ui-state.service'

import { Subscription } from 'rxjs/subscription'

import { IYear } from '../../model/year.model'
@Component({
    selector: 'travel',
    templateUrl: './travel.component.html',
    styleUrls: ['./travel.component.css']
})
export class TravelComponent implements OnInit, AfterViewInit, OnDestroy {
    public title:string = 'Travel & Subsistence';
    public headerStyle = 'ag-header-cell';


    public tsGridOptions: GridOptions
    public atsGridOptions: GridOptions
    public rtsGridOptions: GridOptions
    public rtstGridOptions: GridOptions
    
    public uiState: any;

    public tsTableHeight: number = 100;
    public atsTableHeight: number = 100;
    public rtsTableHeight: number = 100;
    public rtstTableHeight: number = 30;

    public tsTableWidth: number = 1800;
    public atsTableWidth: number = 1800;
    public rtsTableWidth: number = 2000;
    public rtstTableWidth: number = 2100;

    // public _backgroundColour: string = '#99e7ff';
    
    //used to track cell focus
    public _focusCell:any
    public _focusTable:string

    public resourceStream: Subscription
    public resourceContextStream: Subscription
    public totalStream: Subscription
    public totalContextStream: Subscription

    constructor(private tableService: TableService, 
                private dataContext: DataContextService,
                private workdayService: WorkdayService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private uiStateService: UiStateService,
                private el: ElementRef) {
        
        //initialise gridoptions objects
        this.tsGridOptions = <GridOptions>{};
        this.atsGridOptions = <GridOptions>{};
        this.rtsGridOptions = <GridOptions>{};
        this.rtstGridOptions = <GridOptions>{};

        //travel subsidence gridoptions
        this.tsGridOptions.context = {};
        this.tsGridOptions.onCellValueChanged = ($event: any) => {
            this._focusCell = this.tsGridOptions.api.getFocusedCell()
            this._focusTable = 'tsGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppResourceData, this._focusTable, this._focusCell.rowIndex, this._focusCell.column.colId)
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        // this.tsGridOptions.rowSelection = 'single';
        this.tsGridOptions.singleClickEdit = true;
        this.tsGridOptions.enableColResize = true;   

        //actual travel subsidence gridoptions
        this.atsGridOptions.context = {};
        this.atsGridOptions.onCellValueChanged = ($event: any) => {

            this._focusCell = this.atsGridOptions.api.getFocusedCell()
            this._focusTable = 'atsGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppResourceData, this._focusTable, this._focusCell.rowIndex, this._focusCell.column.colId)
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        // this.atsGridOptions.rowSelection = 'single';
        this.atsGridOptions.singleClickEdit = true;
        this.atsGridOptions.enableColResize = true;

        //Project resource travel subsistence gridoptions
        this.rtsGridOptions.context = {};
        this.rtsGridOptions.onCellValueChanged = ($event: any) => {
            this._focusCell = this.rtsGridOptions.api.getFocusedCell()
            this._focusTable = 'rtsGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppResourceData, this._focusTable, this._focusCell.rowIndex, this._focusCell.column.colId)
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        this.rtsGridOptions.rowSelection = 'single';
        this.rtsGridOptions.singleClickEdit = true;
        this.rtsGridOptions.enableColResize = true;

        //Resource Travel Subsistence Totals gridoptions
        this.rtstGridOptions.context = {};
        this.rtstGridOptions.onGridReady = () => {
            //Remove Header
            this.rtstGridOptions.api.setHeaderHeight(0)
        }

        this.rtstGridOptions.singleClickEdit = true;
        this.rtstGridOptions.enableColResize = true;
                         
    }

    ngOnInit() {
        this.tableService.getTable('travelSubsistence').subscribe(table => {
            this.tsGridOptions.columnDefs = table;
        });
        this.tableService.getTable('actualTravelSubsistence').subscribe(table => {
            this.atsGridOptions.columnDefs = table;
        });
        this.tableService.getTable('projectResourceTandS').subscribe(table => {
            this.rtsGridOptions.columnDefs = table;
        });
        this.tableService.getTable('RTSTotals').subscribe(table => {
            this.rtstGridOptions.columnDefs = table;
        });

        this.resourceStream = this.dataContext.getResourceDataStream().subscribe(data => {
            console.error('RESOURCE DATA RECEIVED')
            console.log(data)

            if (!this.tsGridOptions.rowData) {
                this.tsGridOptions.rowData = data;
            } else if (this.tsGridOptions.api) {
                this.tsGridOptions.api.setRowData(data);
            }
            
            if (!this.atsGridOptions.rowData) {
                this.atsGridOptions.rowData = data;
            } else if (this.atsGridOptions.api) {
                this.atsGridOptions.api.setRowData(data);
            }
            
            if (!this.rtsGridOptions.rowData) {
                this.rtsGridOptions.rowData = data;
            } else if (this.rtsGridOptions.api) {
                this.rtsGridOptions.api.setRowData(data);
            }

            // if(this.tsGridOptions.api &&
            //     this.atsGridOptions.api &&
            //     this.rtsGridOptions.api
            //     ) {
            //         this.applyCellHighlights(data);  
            //     }
            this.resizeTables(data.length);
            // this.setCellFocus();
        })

        this.totalStream = this.dataContext.getTotalDataStream().subscribe(data => {

            if (!this.rtstGridOptions.rowData) {
                this.rtstGridOptions.rowData = data;
            } else if (this.rtstGridOptions.api) {
                this.rtstGridOptions.api.setRowData(data);
            }

                         

            // if(this.rtstGridOptions.api) {
            //         this.applyTotalCellHighlights(data);  
            //     }            
        })

        // this.uiStateService.uiState().subscribe(data => {
        //     this.uiState = data;
            
        // })

        this.resourceContextStream = this.dataContext.getResourceContextStream().subscribe(data => {
            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            let focusedCellData = this.uiStateService.getFocusCellData()
            if(this[focusedCellData.gridOptions]) {
                this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
                this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            }

            let _resourceDataName = 'resourceData'
            if(typeof(data) == 'object') {
                if(this.tsGridOptions){
                    this.tsGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContext[_resourceDataName]))
                    this.tsGridOptions.context.arrayName = _resourceDataName
                }

                if(this.atsGridOptions) {
                    this.atsGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContext[_resourceDataName]))
                    this.atsGridOptions.context.arrayName = _resourceDataName
                }

                if(this.rtsGridOptions) {
                    this.rtsGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContext[_resourceDataName]))
                    this.rtsGridOptions.context.arrayName = _resourceDataName
                }
            }
        })

        this.totalContextStream = this.dataContext.getTotalContextStream().subscribe(data => {
            if(typeof(data) == 'object') {
                if(this.rtstGridOptions) {
                    let _totalsDataName = 'totalsData'
                    this.rtstGridOptions.context.totalsData = JSON.parse(JSON.stringify(this.dataContext[_totalsDataName]))
                    this.rtstGridOptions.context.arrayName = _totalsDataName
                }
            }
        })  

        this.refreshGrid()
        
        //get inital ui state values
        // this.uiStateService.updateState();

    }

    ngAfterViewInit () {
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderBGColor(this.settingsService.settings.headerColour)
        }
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderFontColour(this.settingsService.settings.headerFontColour)
        }
    }

    ngOnDestroy(){
        this.resourceStream.unsubscribe()
        this.resourceContextStream.unsubscribe()
        this.totalStream.unsubscribe()
        this.totalContextStream.unsubscribe()
    }


    addResourceRow(){
        this.scriptService.addDataRow(this.utilsService.financeAppResourceData, this.settingsService.year, this.settingsService.autoSave)
            .subscribe(this.getSubscriber());
        return
    }

    deleteResourceRow(){
        let selectedNode:any = this.tsGridOptions.api.getSelectedNodes();
        console.log(selectedNode)
        
        if (!Array.isArray(selectedNode)) {
            alert('no row selected');
            return
        }

        if (selectedNode.length !== 1) {
            alert('only 1 row must be selected to perform the delete operation')
            return
        }

        if (selectedNode[0].hasOwnProperty('data') && 
            selectedNode[0].data.hasOwnProperty('ID')) {
                this.scriptService.deleteDataRow(this.utilsService.financeAppResourceData,
                selectedNode[0].data.ID)
                    .subscribe(this.getSubscriber());
                    } else {
                        alert('something has gone wrong, required data values are not available to delete row')
                    }
        return
    }    

    refreshGrid(){
        if(this.settingsService.initAppComplete) {
            this.scriptService.getAppData([this.utilsService.financeAppResourceData, 
                                        this.utilsService.financeAppTotalsData],
                                        this.settingsService.year)
                                        .subscribe(this.getSubscriber());
        }
    }

    saveUpdates(){
        this.scriptService.saveAppData()
            .subscribe(this.getSubscriber());
    }

    // applyCellHighlights(tableData: any){
    //     let bkColour = this._backgroundColour;
    //     let data:Array<any> = this.constructHighlightsObject(tableData);
    //     this.tsGridOptions.columnDefs.forEach((column:any) => {
    //         //highlight updated cells
    //         return this.applyCellStyle(column,data, bkColour);
    //     })
    //     this.atsGridOptions.columnDefs.forEach((column:any) => {
    //         //highlight updated cells
    //         return this.applyCellStyle(column,data, bkColour);
    //     })

    //     this.rtsGridOptions.columnDefs.forEach((column:any) => {
    //         //highlight updated cells
    //         return this.applyCellStyle(column,data, bkColour);
    //     })
    //     this.tsGridOptions.api.setColumnDefs(this.tsGridOptions.columnDefs);
    //     this.atsGridOptions.api.setColumnDefs(this.atsGridOptions.columnDefs);
    //     this.rtsGridOptions.api.setColumnDefs(this.rtsGridOptions.columnDefs);

    // }

    // applyTotalCellHighlights(tableData: any){
    //     let bkColour = this._backgroundColour;
    //     let data:Array<any> = this.constructHighlightsObject(tableData);

    //     this.rtstGridOptions.columnDefs.forEach((column:any) => {
    //         //highlight updated cells
    //         return this.applyCellStyle(column,data, bkColour);
    //     })
    //     this.rtstGridOptions.api.setColumnDefs(this.rtstGridOptions.columnDefs);
    // }

    // applyCellStyle(column: any, data: any, bkColour: string){
    //         column.cellStyle = function(params: any){
    //             let fldName = params.colDef.field;
    //             let rowId = params.data.ItemId;
    //             let highlightCell = false;
    //             if (data.length > 0) {
                    
    //                 data.forEach(function(dataCell: any){
    //                      if(dataCell.fieldName == fldName &&
    //                         dataCell.ItemId == rowId) {
    //                             highlightCell = true;
    //                         }
    //                 });
    //             }
    //             return (highlightCell? 
    //                     {backgroundColor: bkColour}:
    //                     {backgroundColor: '#ffff'})

    //         }
    // }

    // constructHighlightsObject(tableData:any){
    //     let data:Array<any> = []
    //     if (tableData.length > 0){
    //         tableData.forEach((rowData:any)=> {
    //             if (rowData.Highlights && 
    //                 rowData.Highlights.length>0) {
    //                      rowData.Highlights.forEach((highlight:any) => {
    //                         data.push(highlight);
    //                     })

    //                 }
    //         })   
    //     }
    //     return data
    // }

    resizeTables(noRows: number) {
        this.tsTableHeight = (noRows * 25) + 40;
        this.atsTableHeight = (noRows * 25) + 40;
        this.rtsTableHeight = (noRows * 25) + 40;

        this.tsTableWidth = 1800;
        this.atsTableWidth = 1800;
        this.rtsTableWidth = 2000;
        //Totals
        this.rtstTableWidth = 2100;
    }

    getSubscriber() {
        return {
            next(data){ console.log('next', data) },
            error(err){ console.log('error', err) },
            complete(){ console.log('completed'); }
        }
     }

     changeHeaderBGColor(value) {
        if (value) {
            var cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].backgroundColor = value;
            }
        }
    }

    changeHeaderFontColour(value) {
        if (value) {
            var cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].fontColor = value;
            }
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
    //             console.log(e);
    //         }
    //     }       
    // }

    // updateContext() {
    //     let _resourceDataName = 'resourceData'
    //     let _totalsDataName = 'totalsData'

    //     this.tsGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContext[_resourceDataName]))
    //     this.tsGridOptions.context.arrayName = _resourceDataName

    //     this.atsGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContext[_resourceDataName]))
    //     this.atsGridOptions.context.arrayName = _resourceDataName

    //     this.rtsGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContext[_resourceDataName]))
    //     this.rtsGridOptions.context.arrayName = _resourceDataName
        
    //     this.rtstGridOptions.context.totalsData = JSON.parse(JSON.stringify(this.dataContext[_totalsDataName]))
    //     this.rtstGridOptions.context.arrayName = _totalsDataName
    // }    
}