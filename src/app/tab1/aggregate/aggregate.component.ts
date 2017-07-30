import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'


import { IYear } from '../../model/year.model'
@Component({
    selector: 'aggregate',
    templateUrl: './aggregate.component.html',
    styleUrls: ['./aggregate.component.css']
})
export class AggregateComponent implements OnInit, AfterViewInit {
    public title:string = 'aggregate Page';
    public headerStyle = 'ag-header-cell';

    public puGridOptions: GridOptions
    public wdGridOptions: GridOptions
    public ahGridOptions: GridOptions
    public prGridOptions: GridOptions
    public tsGridOptions: GridOptions
    public atsGridOptions: GridOptions
    public rtsGridOptions: GridOptions
    public cmGridOptions: GridOptions
    //totals
    public tGridOptions: GridOptions
    public prtGridOptions: GridOptions
    public rtstGridOptions: GridOptions
    public mattGridOptions: GridOptions
    
    public uiState: any;

    //working day tables
    public wdTableHeight: number = 30;
    public wdTableWidth: number = 1800;
    //finance data tables
    public puTableHeight: number = 100;
    public ahTableHeight: number = 100;
    public prTableHeight: number = 100;
    public tsTableHeight: number = 100;
    public atsTableHeight: number = 100;
    public rtsTableHeight: number = 100;
    public cmTableHeight: number = 100;
    //totals
    public tTableHeight: number = 30;
    public prtTableHeight: number = 30;
    public rtstTableHeight: number = 30;
    public mattTableHeight: number = 30;

    public puTableWidth: number = 1800;
    public ahTableWidth: number = 1800;
    public prTableWidth: number = 2000;
    public tsTableWidth: number = 1800;
    public atsTableWidth: number = 1800;
    public rtsTableWidth: number = 2000;
    public cmTableWidth: number = 2000;
    //totals
    public tTableWidth: number = 2100;
    public prtTableWidth: number = 2100;
    public rtstTableWidth: number = 2100;
    public mattTableWidth: number = 2100;

    public _backgroundColour: string = '#99e7ff';
    
    //used to track cell focus
    public _focusCell:any
    public _focusTable:string

    constructor(private tableService: TableService, 
                private dataContext: DataContextService,
                private uiStateService: UiStateService,
                private workdayService: WorkdayService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private el: ElementRef) {
        
        //initialise gridoptions objects
        this.puGridOptions = <GridOptions>{};
        this.wdGridOptions = <GridOptions>{};
        this.ahGridOptions = <GridOptions>{};
        this.prGridOptions = <GridOptions>{};
        this.tsGridOptions = <GridOptions>{};
        this.atsGridOptions = <GridOptions>{};
        this.rtsGridOptions = <GridOptions>{};
        this.cmGridOptions = <GridOptions>{};
        this.tGridOptions = <GridOptions>{};
        this.prtGridOptions = <GridOptions>{};
        this.rtstGridOptions = <GridOptions>{};
        this.mattGridOptions = <GridOptions>{};

        //working days gridoptions
        this.wdGridOptions.context = { };
        this.wdGridOptions.singleClickEdit = true;
        this.wdGridOptions.onCellValueChanged = ($event: any) => {
            this.workdayService.updateWorkingDays($event);
        };
        this.wdGridOptions.onGridReady = () => {
            this.wdGridOptions.headerHeight = 0
        }

        //percentage utilised gridoptions
        this.puGridOptions.singleClickEdit = true;
        this.puGridOptions.enableCellExpressions = true;
        this.puGridOptions.onCellValueChanged = ($event: any) => {
            
            //set focus details
            this._focusCell = this.puGridOptions.api.getFocusedCell()
            this._focusTable = 'puGridOptions'

            console.error(this._focusCell)

            this.scriptService.updateTable($event).subscribe(this.getSubscriber()); 
            
        };
        this.puGridOptions.context = { };
        this.puGridOptions.rowSelection = 'single';
        this.puGridOptions.enableColResize = true;    

        //actual hours gridoptions
        this.ahGridOptions.context = {};
        this.ahGridOptions.onCellValueChanged = ($event: any) => {
            this._focusCell = this.ahGridOptions.api.getFocusedCell()
            this._focusTable = 'ahGridOptions'
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        // this.ahGridOptions.rowSelection = 'single';
        this.ahGridOptions.singleClickEdit = true;
        this.ahGridOptions.enableColResize = true; 

        //project resource gridoptions
        this.prGridOptions.context = {};
        this.prGridOptions.onCellValueChanged = ($event: any) => {
            this._focusCell = this.prGridOptions.api.getFocusedCell()
            this._focusTable = 'prGridOptions'
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        // this.prGridOptions.rowSelection = 'single';
        this.prGridOptions.singleClickEdit = true;
        this.prGridOptions.enableColResize = true; 

        //travel subsidence gridoptions
        this.tsGridOptions.context = {};
        this.tsGridOptions.onCellValueChanged = ($event: any) => {
            this._focusCell = this.tsGridOptions.api.getFocusedCell()
            this._focusTable = 'tsGridOptions'
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
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        this.rtsGridOptions.rowSelection = 'single';
        this.rtsGridOptions.singleClickEdit = true;
        this.rtsGridOptions.enableColResize = true;

        //Project cost material gridoptions
        this.cmGridOptions.context = {};
        this.cmGridOptions.onCellValueChanged = ($event: any) => {
            this._focusCell = this.cmGridOptions.api.getFocusedCell()
            this._focusTable = 'cmGridOptions'
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };

        this.cmGridOptions.singleClickEdit = true;
        this.cmGridOptions.enableColResize = true;
        this.cmGridOptions.rowSelection = 'single';

        //Total cost gridoptions
        this.tGridOptions.context = {};
        this.tGridOptions.onCellValueChanged = ($event: any) => {
            this._focusTable = 'tGridOptions'
            this._focusCell = this.tGridOptions.api.getFocusedCell()
            this.scriptService.updateTable($event).subscribe();
        };
        this.tGridOptions.onGridReady = () => {
            //Remove Header
            this.tGridOptions.headerHeight = 0
        }

        this.tGridOptions.singleClickEdit = true;
        this.tGridOptions.enableColResize = true;
        

        //Project Resource Totals gridoptions
        this.prtGridOptions.context = {};
        this.prtGridOptions.onGridReady = () => {
            //Remove Header
            this.prtGridOptions.headerHeight = 0
        }

        this.prtGridOptions.singleClickEdit = true;
        this.prtGridOptions.enableColResize = true;

        //Resource Travel Subsistence Totals gridoptions
        this.rtstGridOptions.context = {};
        this.rtstGridOptions.onGridReady = () => {
            //Remove Header
            this.rtstGridOptions.headerHeight = 0
        }

        this.rtstGridOptions.singleClickEdit = true;
        this.rtstGridOptions.enableColResize = true;

        //Project Materials Totals gridoptions
        this.mattGridOptions.context = {};
        this.mattGridOptions.onGridReady = () => {
            //Remove Header
             this.mattGridOptions.headerHeight = 0
        }
        this.mattGridOptions.singleClickEdit = true;
        this.mattGridOptions.enableColResize = true;                                             
    }

    ngOnInit() {
        this.tableService.getTable('percentageUtilised').subscribe(table => {
            this.puGridOptions.columnDefs = table;
        });
        this.tableService.getTable('workDays').subscribe(table => {
            this.wdGridOptions.columnDefs = table;
        });
        this.tableService.getTable('actualHours').subscribe(table => {
            this.ahGridOptions.columnDefs = table;
        });
        this.tableService.getTable('projectResource').subscribe(table => {
            this.prGridOptions.columnDefs = table;
        });
        this.tableService.getTable('travelSubsistence').subscribe(table => {
            this.tsGridOptions.columnDefs = table;
        });
        this.tableService.getTable('actualTravelSubsistence').subscribe(table => {
            this.atsGridOptions.columnDefs = table;
        });
        this.tableService.getTable('projectResourceTandS').subscribe(table => {
            this.rtsGridOptions.columnDefs = table;
        });
        this.tableService.getTable('ProjectCostsMaterials').subscribe(table => {
            this.cmGridOptions.columnDefs = table;
        }); 
        
        //Totals
        this.tableService.getTable('Totals').subscribe(table => {
            this.tGridOptions.columnDefs = table;
        });
        this.tableService.getTable('PRTotals').subscribe(table => {
            this.prtGridOptions.columnDefs = table;
        });
        this.tableService.getTable('RTSTotals').subscribe(table => {
            this.rtstGridOptions.columnDefs = table;
        });
        this.tableService.getTable('MatTotals').subscribe(table => {
            this.mattGridOptions.columnDefs = table;
        });                        

        this.dataContext.getResourceDataStream().subscribe(data => {
            console.error('RESOURCE DATA RECEIVED')

            if (!this.puGridOptions.rowData) {
                this.puGridOptions.rowData = data;
            } else if (this.puGridOptions.api) {
                this.puGridOptions.api.setRowData(data);
            }

            if (!this.ahGridOptions.rowData) {
                this.ahGridOptions.rowData = data;
            } else if (this.ahGridOptions.api) {
                this.ahGridOptions.api.setRowData(data);
            }

            if (!this.prGridOptions.rowData) {
                this.prGridOptions.rowData = data;
            } else if (this.prGridOptions.api) {
                this.prGridOptions.api.setRowData(data);
            }

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

            
            
            if(this.puGridOptions.api &&
                this.ahGridOptions.api &&
                this.prGridOptions.api &&
                this.tsGridOptions.api &&
                this.atsGridOptions.api &&
                this.rtsGridOptions.api
                // && this.cmGridOptions.api
                ) {
                    console.error('APPLYING CELL HIGHLIGHTS')
                    this.applyCellHighlights(data);  
                    console.error('CELL HIGHLIGHTS APPLIED')
                }
            console.error('RESIZING TABLES')
            this.resizeTables(data.length);
            this.setCellFocus();
            console.error('TABLES RESIZED')
        })
        


        this.dataContext.getMaterialDataStream().subscribe(data=>{
            if(this.settingsService.autoSave) {
                this.scriptService.saveAppData().subscribe(this.getSubscriber())
            }


            if (!this.cmGridOptions.rowData) {
                this.cmGridOptions.rowData = data;

            } else if (this.cmGridOptions.api) {
                this.cmGridOptions.api.setRowData(data);
             
            }

            if(this.cmGridOptions.api) {
                this.applyMaterialCellHighlights(data);
            }

            this.resizeMaterialTable(data.length);
            this.setCellFocus();            
        })

        this.dataContext.getTotalDataStream().subscribe(data => {
            
            if (!this.tGridOptions.rowData) {
                this.tGridOptions.rowData = data;
            } else if (this.tGridOptions.api) {
                this.tGridOptions.api.setRowData(data);
            }

            if (!this.prtGridOptions.rowData) {
                this.prtGridOptions.rowData = data;
            } else if (this.prtGridOptions.api) {
                this.prtGridOptions.api.setRowData(data);
            }

            if (!this.rtstGridOptions.rowData) {
                this.rtstGridOptions.rowData = data;
            } else if (this.rtstGridOptions.api) {
                this.rtstGridOptions.api.setRowData(data);
            }

            if (!this.mattGridOptions.rowData) {
                this.mattGridOptions.rowData = data;
            } else if (this.mattGridOptions.api) {
                this.mattGridOptions.api.setRowData(data);
            }                                    

            if( this.tGridOptions.api &&
                this.prtGridOptions.api &&
                this.rtstGridOptions.api &&
                this.mattGridOptions.api) {
                    this.applyTotalCellHighlights(data);  
                }            
        })

        this.uiStateService.uiState().subscribe(data => {
            this.uiState = data;
            
        })
        this.workdayService.getWorkdayStream().subscribe(data => {
            if (!this.wdGridOptions.rowData){
                this.wdGridOptions.rowData = <Array<IYear>>data;
            } else if (this.wdGridOptions.api) {
                this.wdGridOptions.api.setRowData(data)
            }
        });
        this.workdayService.getWorkdayData();
        this.scriptService.getAppData([this.utilsService.financeAppResourceData,
                                        this.utilsService.financeAppMaterialData,
                                        this.utilsService.financeAppTotalsData,
                                        this.utilsService.financeAppSummaryData], 
                                        this.settingsService.year)
                                    .subscribe(
                                        data => console.log(data),
                                        err => console.error(err),
                                        () => console.log('get app data completed')
                                    );
        //get inital ui state values
        this.uiStateService.updateState();

    }

    ngAfterViewInit () {
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderBGColor(this.settingsService.settings.headerColour)
        }
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderFontColour(this.settingsService.settings.headerFontColour)
        }
        
    }

    addResourceRow(){
        this.dataContext.addResourceRow();
        return
    }

    addMaterialRow(){
        this.dataContext.addMaterialRow();
        return
    }    
    

    deleteResourceRow(){
        let selectedNode = this.puGridOptions.api.getSelectedNodes();
        if (selectedNode[0] && 
            selectedNode[0].data && 
            selectedNode[0].data.ItemId) {
                this.scriptService.deleteDataRow(this.utilsService.financeAppResourceData, selectedNode[0].data.ItemId).subscribe(this.getSubscriber());
            } else {
                alert('no row selected');
            }
        return
    }

    deleteMaterialRow(){
        let selectedNode = this.cmGridOptions.api.getSelectedNodes();
        if (selectedNode[0] && 
            selectedNode[0].data && 
            selectedNode[0].data.ItemId) {
                this.scriptService.deleteDataRow(this.utilsService.financeAppMaterialData, selectedNode[0].data.ItemId).subscribe(this.getSubscriber());
            } else {
                alert('no row selected');
            }
        return
    }    

    refreshGrid(){
        this.puGridOptions.api.refreshView();
    }

    saveUpdates(){
        this.scriptService.saveAppData().subscribe(this.getSubscriber());
    }

    applyCellHighlights(tableData: any){
        let bkColour = this._backgroundColour;
        let data:Array<any> = this.constructHighlightsObject(tableData);
        this.puGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })
        this.ahGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })
        this.prGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })
        this.tsGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })
        this.atsGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })

        this.rtsGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })


        this.puGridOptions.api.setColumnDefs(this.puGridOptions.columnDefs);
        this.ahGridOptions.api.setColumnDefs(this.ahGridOptions.columnDefs);
        this.prGridOptions.api.setColumnDefs(this.prGridOptions.columnDefs);
        this.tsGridOptions.api.setColumnDefs(this.tsGridOptions.columnDefs);
        this.atsGridOptions.api.setColumnDefs(this.atsGridOptions.columnDefs);
        this.rtsGridOptions.api.setColumnDefs(this.rtsGridOptions.columnDefs);
        this.cmGridOptions.api.setColumnDefs(this.cmGridOptions.columnDefs);

    }
    applyMaterialCellHighlights(tableData: any) {
        let bkColour = this._backgroundColour;
        let data:Array<any> = this.constructHighlightsObject(tableData);

        this.cmGridOptions.columnDefs.forEach((column: any) => {
            //highlight updated cells
            return this.applyCellStyle(column, data, bkColour);
        })

        this.cmGridOptions.api.setColumnDefs(this.cmGridOptions.columnDefs);
    }

    applyTotalCellHighlights(tableData: any){
        let bkColour = this._backgroundColour;
        let data:Array<any> = this.constructHighlightsObject(tableData);

        this.tGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })

        this.prtGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })

        this.rtstGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })

        this.mattGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })                        
        
        this.tGridOptions.api.setColumnDefs(this.tGridOptions.columnDefs);
        this.prtGridOptions.api.setColumnDefs(this.prtGridOptions.columnDefs);
        this.rtstGridOptions.api.setColumnDefs(this.rtstGridOptions.columnDefs);
        this.mattGridOptions.api.setColumnDefs(this.mattGridOptions.columnDefs);
    }

    applyCellStyle(column: any, data: any, bkColour: string){
            column.cellStyle = function(params: any){
                let fldName = params.colDef.field;
                let rowId = params.data.ItemId;
                let highlightCell = false;
                if (data.length > 0) {
                    
                    data.forEach(function(dataCell: any){
                         if(dataCell.fieldName == fldName &&
                            dataCell.ItemId == rowId) {
                                highlightCell = true;
                            }
                    });
                }
                return (highlightCell? 
                        {backgroundColor: bkColour}:
                        {backgroundColor: '#ffff'})

            }
    }

    constructHighlightsObject(tableData:any){
        let data:Array<any> = []
        if (tableData.length > 0){
            tableData.forEach((rowData:any)=> {
                if (rowData.Highlights && 
                    rowData.Highlights.length>0) {
                         rowData.Highlights.forEach((highlight:any) => {
                            data.push(highlight);
                        })

                    }
            })   
        }
        return data
    }

    resizeTables(noRows: number) {
        this.puTableHeight = (noRows * 25) + 40;
        this.ahTableHeight = (noRows * 25) + 40;
        this.prTableHeight = (noRows * 25) + 40;
        this.tsTableHeight = (noRows * 25) + 40;
        this.atsTableHeight = (noRows * 25) + 40;
        this.rtsTableHeight = (noRows * 25) + 40;
        

        this.puTableWidth = 1800;
        this.ahTableWidth = 1800;
        this.prTableWidth = 2000;
        this.tsTableWidth = 1800;
        this.atsTableWidth = 1800;
        this.rtsTableWidth = 2000;


        
        
        //Totals
        this.tTableWidth = 2100;
        this.prtTableWidth = 2100;
        this.rtstTableWidth = 2100;
        this.mattTableWidth = 2100;
    }

    resizeMaterialTable(noRows: number) {
        this.cmTableHeight = (noRows * 25) + 40;
        this.cmTableWidth = 2000;
    }

    getSubscriber() {
        return {
            next(data){
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                if (data && this.log) {
                    this.log.push(data);
                }
                
            },
            error(err){
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                if (err && this.log) {
                    this.log.push(err);
                }
                
            },
            complete(){
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                if (this.log) {
                    this.log.push('completed');
                }
            }
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

    setCellFocus(){
        if (this._focusCell && 
            this._focusCell.rowIndex >=0 &&
            this._focusCell.column &&
            this._focusCell.column.colId &&
            this._focusTable &&
            this[this._focusTable] &&
            this[this._focusTable].api
            ) {
            try { //set focused column
                this[this._focusTable].api.setFocusedCell(this._focusCell.rowIndex, this._focusCell.column.colId)
                this[this._focusTable].api.tabToNextCell()
            } catch (e) {
                console.log(e);
            }
        }       
    }
}