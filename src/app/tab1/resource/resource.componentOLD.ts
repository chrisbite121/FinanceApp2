// import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core'

// import { GridOptions } from 'ag-grid'

// import { TableService } from '../../service/table.service'
// import { DataContextService } from '../../service/data-context.service'
// import { UiStateService } from '../../service/ui-state.service'
// import { WorkdayService } from '../../service/workdays.service'
// import { ScriptService } from '../../service/scripts.service'
// import { SettingsService } from '../../service/settings.service'
// import { UtilsService } from '../../service/utils.service'

// import { IYear } from '../../model/year.model'
// @Component({
//     selector: 'resource',
//     templateUrl: './resource.component.html',
//     styleUrls: ['./resource.component.css']
// })
// export class ResourceComponent implements OnInit, AfterViewInit {
//     public title:string = 'Resources';
//     public headerStyle = 'ag-header-cell';

//     public puGridOptions: GridOptions
//     public wdGridOptions: GridOptions
//     public ahGridOptions: GridOptions
//     public prGridOptions: GridOptions

//     //totals
//     public prtGridOptions: GridOptions
    
//     public uiState: any;

//     //working day tables
//     public wdTableHeight: number = 30;
//     public wdTableWidth: number = 1800;
//     //finance data tables
//     public puTableHeight: number = 100;
//     public ahTableHeight: number = 100;
//     public prTableHeight: number = 100;

//     //totals
//     public prtTableHeight: number = 30;


//     public puTableWidth: number = 1800;
//     public ahTableWidth: number = 1800;
//     public prTableWidth: number = 2000;

//     //totals
//     public prtTableWidth: number = 2100;

//     public _backgroundColour: string = '#99e7ff';
    
//     //used to track cell focus
//     public _focusCell:any
//     public _focusTable:string

//     constructor(private tableService: TableService, 
//                 private dataContext: DataContextService,
//                 private uiStateService: UiStateService,
//                 private workdayService: WorkdayService,
//                 private scriptService: ScriptService,
//                 private settingsService: SettingsService,
//                 private utilsService: UtilsService,
//                 private el: ElementRef) {
        
//         //initialise gridoptions objects
//         this.puGridOptions = <GridOptions>{};
//         this.wdGridOptions = <GridOptions>{};
//         this.ahGridOptions = <GridOptions>{};
//         this.prGridOptions = <GridOptions>{};
//         this.prtGridOptions = <GridOptions>{};

//         //working days gridoptions
//         this.wdGridOptions.context = { };
//         this.wdGridOptions.singleClickEdit = true;
//         this.wdGridOptions.onCellValueChanged = ($event: any) => {
//             this.workdayService.updateWorkingDays($event);
//         };
//         this.wdGridOptions.onGridReady = () => {
//             this.wdGridOptions.api.setHeaderHeight(0)
//         }

//         //percentage utilised gridoptions
//         this.puGridOptions.singleClickEdit = true;
//         this.puGridOptions.enableCellExpressions = true;
//         this.puGridOptions.onCellValueChanged = ($event: any) => {
            
//             //set focus details
//             this._focusCell = this.puGridOptions.api.getFocusedCell()
//             this._focusTable = 'puGridOptions'

//             this.scriptService.updateTable($event).subscribe(this.getSubscriber()); 
            
//         };
//         this.puGridOptions.context = {};
//         this.puGridOptions.rowSelection = 'single';
//         this.puGridOptions.enableColResize = true;    

//         //actual hours gridoptions
//         this.ahGridOptions.context = {};
//         this.ahGridOptions.onCellValueChanged = ($event: any) => {
//             this._focusCell = this.ahGridOptions.api.getFocusedCell()
//             this._focusTable = 'ahGridOptions'
//             this.scriptService.updateTable($event).subscribe(this.getSubscriber());
//         };
//         // this.ahGridOptions.rowSelection = 'single';
//         this.ahGridOptions.singleClickEdit = true;
//         this.ahGridOptions.enableColResize = true; 

//         //project resource gridoptions
//         this.prGridOptions.context = {};
//         this.prGridOptions.onCellValueChanged = ($event: any) => {
//             this._focusCell = this.prGridOptions.api.getFocusedCell()
//             this._focusTable = 'prGridOptions'
//             this.scriptService.updateTable($event).subscribe(this.getSubscriber());
//         };
//         // this.prGridOptions.rowSelection = 'single';
//         this.prGridOptions.singleClickEdit = true;
//         this.prGridOptions.enableColResize = true; 


//         //Project Resource Totals gridoptions
//         this.prtGridOptions.context = {};
//         this.prtGridOptions.onGridReady = () => {
//             //Remove Header
//             this.prtGridOptions.api.setHeaderHeight(0)
//         }
        
//         this.prtGridOptions.singleClickEdit = true;
//         this.prtGridOptions.enableColResize = true;

                                          
//     }

//     ngOnInit() {
//         this.tableService.getTable('percentageUtilised').subscribe(table => {
//             this.puGridOptions.columnDefs = table;
//         });
//         this.tableService.getTable('workDays').subscribe(table => {
//             this.wdGridOptions.columnDefs = table;
//         });
//         this.tableService.getTable('actualHours').subscribe(table => {
//             this.ahGridOptions.columnDefs = table;
//         });
//         this.tableService.getTable('projectResource').subscribe(table => {
//             this.prGridOptions.columnDefs = table;
//         });
        
//         //Totals
//         this.tableService.getTable('PRTotals').subscribe(table => {
//             this.prtGridOptions.columnDefs = table;
//         });

//         this.dataContext.getResourceDataStream().subscribe(data => {
//             console.error('RESOURCE DATA RECEIVED')
//             console.log(data);

//             if (!this.puGridOptions.rowData) {
//                 this.puGridOptions.rowData = data;
//             } else if (this.puGridOptions.api) {
//                 this.puGridOptions.api.setRowData(data);
//             }

//             if (!this.ahGridOptions.rowData) {
//                 this.ahGridOptions.rowData = data;
//             } else if (this.ahGridOptions.api) {
//                 this.ahGridOptions.api.setRowData(data);
//             }

//             if (!this.prGridOptions.rowData) {
//                 this.prGridOptions.rowData = data;
//             } else if (this.prGridOptions.api) {
//                 this.prGridOptions.api.setRowData(data);
//             }

//             if(this.puGridOptions.api &&
//                 this.ahGridOptions.api &&
//                 this.prGridOptions.api 
//                 ) {
//                     this.applyCellHighlights(data);  

//                 }
//             this.resizeTables(data.length);
//             this.setCellFocus();
//         })
        
//         this.dataContext.getTotalDataStream().subscribe(data => {
//             console.log('TOTAL DATA RECEIVED')
//             console.log(data)

//             if (!this.prtGridOptions.rowData) {
//                 this.prtGridOptions.rowData = data;
//             } else if (this.prtGridOptions.api) {
//                 this.prtGridOptions.api.setRowData(data);
//             }

//             if(this.prtGridOptions.api) {
//                     this.applyTotalCellHighlights(data);  
//                 }            
//         })

//         this.uiStateService.uiState().subscribe(data => {
//             this.uiState = data;
//         })
//         this.workdayService.getWorkdayStream().subscribe(data => {
//             if (!this.wdGridOptions.rowData){
//                 this.wdGridOptions.rowData = <Array<IYear>>data;
//             } else if (this.wdGridOptions.api) {
//                 this.wdGridOptions.api.setRowData(data)
//             }




//         });
//         this.workdayService.getWorkdayData();
//         this.scriptService.getAppData([this.utilsService.financeAppResourceData, 
//                                         this.utilsService.financeAppTotalsData],
//                                         this.settingsService.year)
//                                         .subscribe(this.getSubscriber());
//         //get inital ui state values
//         this.uiStateService.updateState();

//     }

//     ngAfterViewInit () {
//         if (this.settingsService.settings.headerColour) {
//             this.changeHeaderBGColor(this.settingsService.settings.headerColour)
//         }
//         if (this.settingsService.settings.headerColour) {
//             this.changeHeaderFontColour(this.settingsService.settings.headerFontColour)
//         }
//     }

//     addResourceRow(){
//         this.scriptService.addDataRow(this.utilsService.financeAppResourceData)
//             .subscribe(this.getSubscriber());
//         return
//     }

//     deleteResourceRow(){
//         let selectedNode = this.puGridOptions.api.getSelectedNodes();
//         if (selectedNode[0] && 
//             selectedNode[0].data && 
//             selectedNode[0].data.ID) {
//                 this.scriptService.deleteDataRow(this.utilsService.financeAppResourceData,
//                                                 selectedNode[0].data.ID)
//                     .subscribe(this.getSubscriber());
//             } else {
//                 alert('no row selected');
//             }
//         return
//     }

//     refreshGrid(){
//         this.scriptService.getAppData([this.utilsService.financeAppResourceData, 
//                                         this.utilsService.financeAppTotalsData],
//                                         this.settingsService.year)
//                                         .subscribe(this.getSubscriber());
//     }

//     saveUpdates(){
//         this.scriptService.saveAppData()
//             .subscribe(this.getSubscriber())
//     }

//     applyCellHighlights(tableData: any){
//         let bkColour = this._backgroundColour;
//         let data:Array<any> = this.constructHighlightsObject(tableData);
//         this.puGridOptions.columnDefs.forEach((column:any) => {
//             //highlight updated cells
//             return this.applyCellStyle(column,data, bkColour);
//         })
//         this.ahGridOptions.columnDefs.forEach((column:any) => {
//             //highlight updated cells
//             return this.applyCellStyle(column,data, bkColour);
//         })
//         this.prGridOptions.columnDefs.forEach((column:any) => {
//             //highlight updated cells
//             return this.applyCellStyle(column,data, bkColour);
//         })

//         this.puGridOptions.api.setColumnDefs(this.puGridOptions.columnDefs);
//         this.ahGridOptions.api.setColumnDefs(this.ahGridOptions.columnDefs);
//         this.prGridOptions.api.setColumnDefs(this.prGridOptions.columnDefs);
//     }

//     applyTotalCellHighlights(tableData: any){
//         let bkColour = this._backgroundColour;
//         let data:Array<any> = this.constructHighlightsObject(tableData);
//         console.log(data);
//         console.log(this.prtGridOptions.columnDefs)
//         this.prtGridOptions.columnDefs.forEach((column:any) => {
//             //highlight updated cells
//             return this.applyCellStyle(column,data, bkColour);
//         })
//         this.prtGridOptions.api.setColumnDefs(this.prtGridOptions.columnDefs);

//     }

//     applyCellStyle(column: any, data: any, bkColour: string){
//             column.cellStyle = function(params: any){
//                 let fldName = params.colDef.field;
//                 let rowID = params.data.ID;
//                 console.log(rowID)
//                 let highlightCell = false;
//                 if (data.length > 0) {
                    
//                     data.forEach(function(dataCell: any){
//                          if(dataCell.fieldName == fldName &&
//                             dataCell.ID == rowID) {
//                                 highlightCell = true;
//                             }
//                     });
//                 }
//                 return (highlightCell? 
//                         {backgroundColor: bkColour}:
//                         {backgroundColor: '#ffff'})

//             }
//     }

//     constructHighlightsObject(tableData:any){
//         let data:Array<any> = []
//         if (tableData.length > 0){
//             tableData.forEach((rowData:any)=> {
//                 if (rowData.Highlights && 
//                     rowData.Highlights.length>0) {
//                          rowData.Highlights.forEach((highlight:any) => {
//                             data.push(highlight);
//                         })

//                     }
//             })   
//         }
//         return data
//     }

//     resizeTables(noRows: number) {
//         this.puTableHeight = (noRows * 25) + 40;
//         this.ahTableHeight = (noRows * 25) + 40;
//         this.prTableHeight = (noRows * 25) + 40;

//         this.puTableWidth = 1800;
//         this.ahTableWidth = 1800;
//         this.prTableWidth = 2000;

//         //Totals

//         this.prtTableWidth = 2100;

//     }


//     getSubscriber() {
//         return {
//             next(data){ console.log('next', data) },
//             error(err){ console.log('error', err) },
//             complete(){ console.log('completed') }
//         }
//      }

//      changeHeaderBGColor(value) {
//         if (value) {
//             var cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
//             for(let i=0; i<cols.length; i++) {
//                 cols[i]['style'].backgroundColor = value;
//             }
//         }
//     }

//     changeHeaderFontColour(value) {
//         if (value) {
//             var cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
//             for(let i=0; i<cols.length; i++) {
//                 cols[i]['style'].fontColor = value;
//             }
//         }
//     }

//     setCellFocus(){
//         if (this._focusCell && 
//             this._focusCell.rowIndex >=0 &&
//             this._focusCell.column &&
//             this._focusCell.column.colId &&
//             this._focusTable &&
//             this[this._focusTable] &&
//             this[this._focusTable].api
//             ) {
//             try { //set focused column
//                 this[this._focusTable].api.setFocusedCell(this._focusCell.rowIndex, this._focusCell.column.colId)
//                 this[this._focusTable].api.tabToNextCell()
//             } catch (e) {
//                 console.log(e);
//             }
//         }       
//     }
// }