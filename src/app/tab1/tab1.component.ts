import { Component, OnInit } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../shared/table.service'
import { DataContextService } from '../shared/data-context.service'
import { UiStateService } from '../shared/ui-state.service'
import { WorkdayService } from '../shared/workdays.service'

import { IYear } from '../model/year.model'
@Component({
    selector: 'fyb2',
    templateUrl: './tab1.component.html',
    styles: [`
        .tables {
            overflow: hidden;
            width: 2800px; 
            height: 2000px;
        }
        .ag-header-cell {
            background-color: black;
        }
        span {
            background-color: black;
            color: red;
        }
    `]
})
export class Tab1Component implements OnInit {
    public title:string = 'FYB Page';
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

    constructor(private tableService: TableService, 
                private dataContext: DataContextService,
                private uiStateService: UiStateService,
                private workdayService: WorkdayService) {
        
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
            console.log($event);
            this.workdayService.updateWorkingDays($event);
        };
        this.wdGridOptions.onGridReady = () => {
            this.wdGridOptions.api.setHeaderHeight(0)
        }

        //percentage utilised gridoptions
        this.puGridOptions.singleClickEdit = true;
        this.puGridOptions.enableCellExpressions = true;
        this.puGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };
        this.puGridOptions.context = { };
        this.puGridOptions.rowSelection = 'single';
        this.puGridOptions.enableColResize = true;    

        //actual hours gridoptions
        this.ahGridOptions.context = {};
        this.ahGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };
        // this.ahGridOptions.rowSelection = 'single';
        this.ahGridOptions.singleClickEdit = true;
        this.ahGridOptions.enableColResize = true; 

        //project resource gridoptions
        this.prGridOptions.context = {};
        this.prGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };
        // this.prGridOptions.rowSelection = 'single';
        this.prGridOptions.singleClickEdit = true;
        this.prGridOptions.enableColResize = true; 

        //travel subsidence gridoptions
        this.tsGridOptions.context = {};
        this.tsGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };
        // this.tsGridOptions.rowSelection = 'single';
        this.tsGridOptions.singleClickEdit = true;
        this.tsGridOptions.enableColResize = true;   

        //actual travel subsidence gridoptions
        this.atsGridOptions.context = {};
        this.atsGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };
        // this.atsGridOptions.rowSelection = 'single';
        this.atsGridOptions.singleClickEdit = true;
        this.atsGridOptions.enableColResize = true;

        //Project resource travel subsistence gridoptions
        this.rtsGridOptions.context = {};
        this.rtsGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };
        this.rtsGridOptions.rowSelection = 'single';
        this.rtsGridOptions.singleClickEdit = true;
        this.rtsGridOptions.enableColResize = true;

        //Project cost material gridoptions
        this.cmGridOptions.context = {};
        this.cmGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };

        this.cmGridOptions.singleClickEdit = true;
        this.cmGridOptions.enableColResize = true;


        //Total cost gridoptions
        this.tGridOptions.context = {};
        this.tGridOptions.onCellValueChanged = ($event: any) => {
            this.dataContext.updateTable($event);
        };
        this.tGridOptions.onGridReady = () => {
            //Remove Header
            this.tGridOptions.api.setHeaderHeight(0)
        }

        this.tGridOptions.singleClickEdit = true;
        this.tGridOptions.enableColResize = true;
        

        //Project Resource Totals gridoptions
        this.prtGridOptions.context = {};
        this.prtGridOptions.onGridReady = () => {
            //Remove Header
            this.prtGridOptions.api.setHeaderHeight(0)
        }

        this.prtGridOptions.singleClickEdit = true;
        this.prtGridOptions.enableColResize = true;

        //Resource Travel Subsistence Totals gridoptions
        this.rtstGridOptions.context = {};
        this.rtstGridOptions.onGridReady = () => {
            //Remove Header
            this.rtstGridOptions.api.setHeaderHeight(0)
        }

        this.rtstGridOptions.singleClickEdit = true;
        this.rtstGridOptions.enableColResize = true;

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

        this.dataContext.getDataStream().subscribe(data => {
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

            // if (!this.cmGridOptions.rowData) {
            //     this.cmGridOptions.rowData = data;
            // } else if (this.cmGridOptions.api) {
            //     this.cmGridOptions.api.setRowData(data);
            // }

            if(this.puGridOptions.api &&
                this.ahGridOptions.api &&
                this.prGridOptions.api &&
                this.tsGridOptions.api &&
                this.atsGridOptions.api &&
                this.rtsGridOptions.api
                // && this.cmGridOptions.api
                ) {
                    this.applyCellHighlights(data);  
                }

            this.resizeTables(data.length);
        })

        this.dataContext.getMaterialDataStream().subscribe(data=>{
            if (!this.cmGridOptions.rowData) {
                this.cmGridOptions.rowData = data;
            } else if (this.cmGridOptions.api) {
                this.cmGridOptions.api.setRowData(data);
            }

            if(this.cmGridOptions.api) {
                this.applyMaterialCellHighlights(data);
            }

            this.resizeMaterialTable(data.length);            
        })

        this.dataContext.getTotalDataStream().subscribe(data => {
            console.log(data);
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
        this.dataContext.getData();
        //get inital ui state values
        this.uiStateService.updateState();
    }

    addRow(){
        this.dataContext.addRow();
        return    
    }

    deleteRow(){
        let selectedNode = this.puGridOptions.api.getSelectedNodes();
        if (selectedNode[0] && 
            selectedNode[0].data && 
            selectedNode[0].data.Id) {
                this.dataContext.deleteRow(selectedNode[0].data.Id);
            } else {
                alert('no row selected');
            }
        return
    }

    refreshGrid(){
        this.puGridOptions.api.refreshView();
    }

    saveUpdates(){
        this.dataContext.saveUpdates();
    }

    undo(){
        this.dataContext.undo();
    }

    redo(){
        this.dataContext.redo();
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

        //now a seperate table
        // this.cmGridOptions.columnDefs.forEach((column:any) => {
        //     //highlight updated cells
        //     return this.applyCellStyle(column,data, bkColour);
        // })

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
                let rowId = params.data.Id;
                let highlightCell = false;
                if (data.length > 0) {
                    
                    data.forEach(function(dataCell: any){
                         if(dataCell.fieldName == fldName &&
                            dataCell.Id == rowId) {
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
}