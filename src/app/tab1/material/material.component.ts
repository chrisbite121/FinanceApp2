import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'

import { Subscription } from 'rxjs/subscription'

import { IYear } from '../../model/year.model'
@Component({
    selector: 'material',
    templateUrl: './material.component.html',
    styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit, AfterViewInit, OnDestroy {
    public title:string = 'Materials';
    public headerStyle = 'ag-header-cell';

    public cmGridOptions: GridOptions
    //totals
    public mattGridOptions: GridOptions
    
    public uiState: any;

    public cmTableHeight: number = 100;
    public mattTableHeight: number = 30;

    public cmTableWidth: number = 2000;
    public mattTableWidth: number = 2100;

    // public _backgroundColour: string = '#99e7ff';
    
    //used to track cell focus
    public _focusCell:any
    public _focusTable:string

    public materialStream: Subscription
    public totalStream: Subscription
    public materialContextStream: Subscription
    public totalContextStream: Subscription

    constructor(private tableService: TableService, 
                private dataContext: DataContextService,
                private uiStateService: UiStateService,
                private workdayService: WorkdayService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private el: ElementRef) {
        
        //initialise gridoptions objects
        this.cmGridOptions = <GridOptions>{};
        this.mattGridOptions = <GridOptions>{};

        //Project cost material gridoptions
        this.cmGridOptions.context = {};
        this.cmGridOptions.onCellValueChanged = ($event: any) => {

            this._focusCell = this.cmGridOptions.api.getFocusedCell()
            this._focusTable = 'cmGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppMaterialData, this._focusTable, this._focusCell.rowIndex, this._focusCell.column.colId)
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());

        };

        this.cmGridOptions.singleClickEdit = true;
        this.cmGridOptions.enableColResize = true;
        this.cmGridOptions.rowSelection = 'single';

        //Project Materials Totals gridoptions
        this.mattGridOptions.context = {};
        this.mattGridOptions.onGridReady = () => {
            //Remove Header
             this.mattGridOptions.api.setHeaderHeight(0)
        }
        this.mattGridOptions.singleClickEdit = true;
        this.mattGridOptions.enableColResize = true;                                             
    }

    ngOnInit() {
        this.tableService.getTable('ProjectCostsMaterials').subscribe(table => {
            this.cmGridOptions.columnDefs = table;
        }); 
        this.tableService.getTable('MatTotals').subscribe(table => {
            this.mattGridOptions.columnDefs = table;
        });


        this.materialStream = this.dataContext.getMaterialDataStream().subscribe(data=>{
            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            let focusedCellData = this.uiStateService.getFocusCellData()
            if(this[focusedCellData.gridOptions]) {
                this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
                this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            }

            if (!this.cmGridOptions.rowData) {
                this.cmGridOptions.rowData = data;

            } else if (this.cmGridOptions.api) {
                this.cmGridOptions.api.setRowData(data);
             
            }
            this.resizeMaterialTable(data.length);
        })

        this.totalStream = this.dataContext.getTotalDataStream().subscribe(data => {
            if (!this.mattGridOptions.rowData) {
                this.mattGridOptions.rowData = data;
            } else if (this.mattGridOptions.api) {
                this.mattGridOptions.api.setRowData(data);
            } else {
                console.error('unable to set updated total data')
            }

        })

        this.materialContextStream = this.dataContext.getMaterialContextStream().subscribe(data => {
            if(typeof(data) == 'object') {
                if(this.cmGridOptions){
                    let _materialDataName = 'materialData'

                    this.cmGridOptions.context.materialData = JSON.parse(JSON.stringify(this.dataContext[_materialDataName]))
                    this.cmGridOptions.context.arrayName = _materialDataName                    
                }
            }
        })

        this.totalContextStream = this.dataContext.getTotalContextStream().subscribe(data => {
            if(typeof(data) == 'object') {
                if(this.mattGridOptions) {
                    let _totalsDataName = 'totalsData'
                    this.mattGridOptions.context.totalsData = JSON.parse(JSON.stringify(this.dataContext[_totalsDataName]))
                    this.mattGridOptions.context.arrayName = _totalsDataName
                }
            }
        })        

        // this.uiStateService.uiState().subscribe(data => {
        //     this.uiState = data;
            
        // })

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
        this.materialStream.unsubscribe()
        this.totalStream.unsubscribe()
        this.materialContextStream.unsubscribe()
        this.totalContextStream.unsubscribe()
    }

    addMaterialRow(){
        this.scriptService.addDataRow(this.utilsService.financeAppMaterialData, this.settingsService.year, this.settingsService.autoSave)
            .subscribe(this.getSubscriber());
        return
    }
    

    deleteMaterialRow(){
        
        let selectedNode:any = this.cmGridOptions.api.getSelectedNodes();
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
                this.scriptService.deleteDataRow(this.utilsService.financeAppMaterialData,
                selectedNode[0].data.ID)
                    .subscribe(this.getSubscriber());
                    } else {
                        alert('something has gone wrong, required data values are not available to delete row')
                    }
        return
    }  

    refreshGrid(){
        if(this.settingsService.initAppComplete){
            this.scriptService.getAppData([this.utilsService.financeAppMaterialData, 
                                        this.utilsService.financeAppTotalsData],
                                        this.settingsService.year)
                                        .subscribe(this.getSubscriber());
        } else {
            console.log('waiting for application to complete before loading data')
        }
    }

    saveUpdates(){
        this.scriptService.saveAppData()
            .subscribe(this.getSubscriber())
    }

    // applyCellHighlights(tableData: any){
    //     let bkColour = this._backgroundColour;
    //     let data:Array<any> = this.constructHighlightsObject(tableData);
    //     this.cmGridOptions.api.setColumnDefs(this.cmGridOptions.columnDefs);

    // }
    // applyMaterialCellHighlights(tableData: any) {
    //     let bkColour = this._backgroundColour;
    //     let data:Array<any> = this.constructHighlightsObject(tableData);

    //     this.cmGridOptions.columnDefs.forEach((column: any) => {
    //         //highlight updated cells
    //         return this.applyCellStyle(column, data, bkColour);
    //     })

    //     this.cmGridOptions.api.setColumnDefs(this.cmGridOptions.columnDefs);
    // }

    // applyTotalCellHighlights(tableData: any){
    //     let bkColour = this._backgroundColour;
    //     let data:Array<any> = this.constructHighlightsObject(tableData);

    //     this.mattGridOptions.columnDefs.forEach((column:any) => {
    //         //highlight updated cells
    //         return this.applyCellStyle(column,data, bkColour);
    //     })                        
    //     this.mattGridOptions.api.setColumnDefs(this.mattGridOptions.columnDefs);
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
        this.mattTableWidth = 2100;
    }

    resizeMaterialTable(noRows: number) {
        this.cmTableHeight = (noRows * 25) + 40;
        this.cmTableWidth = 2000;
    }

    getSubscriber() {
        return {
            next(data){ console.log('next', data) },
            error(err){ console.log('error', err) },
            complete(){ console.log('completed') }
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
    //     let _materialDataName = 'materialData'
    //     let _totalsDataName = 'totalsData'

    //     this.cmGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContext[_materialDataName]))
    //     this.cmGridOptions.context.arrayName = _materialDataName

    //     this.mattGridOptions.context.totalsData = JSON.parse(JSON.stringify(this.dataContext[_totalsDataName]))
    //     this.mattGridOptions.context.arrayName = _totalsDataName
    // }
}