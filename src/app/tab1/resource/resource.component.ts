import { Component, OnInit, OnDestroy, ElementRef, AfterContentChecked } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'
import { fadeInAnimation } from '../../animations/fade-in.animation'
import { slideInOutAnimation } from '../../animations/slide-in-out.animation'

import { FabricIconPanelWrapperComponent } from '../../office-fabric/panel/fabric.panel.wrapper.component'

import { Subscription } from 'rxjs/subscription'

import { IYear } from '../../model/year.model'

@Component({
    selector: 'resource',
    templateUrl: './resource.component.html',
    styleUrls: ['./resource.component.css'],
    // make fade in animation available to this component
    animations: [fadeInAnimation, slideInOutAnimation],
})
export class ResourceComponent implements OnInit, OnDestroy, AfterContentChecked {
    public title:string = 'Resources';
    public headerStyle = 'ag-header-cell';
    public collapsed: boolean = false;
    public tableReady: boolean = false;    

    public puGridOptions: GridOptions
    public wdGridOptions: GridOptions
    public ahGridOptions: GridOptions
    public prGridOptions: GridOptions

    //totals
    public prtGridOptions: GridOptions
    
    public uiState: any;

    //working day tables
    public wdTableHeight: number = 30;
    public wdTableWidth: number = 1800;
    //finance data tables
    public puTableHeight: number = 100;
    public ahTableHeight: number = 100;
    public prTableHeight: number = 100;

    //totals
    public prtTableHeight: number = 30;


    public puTableWidth: number = 1800;
    public ahTableWidth: number = 1800;
    public prTableWidth: number = 2000;

    //totals
    public prtTableWidth: number = 2100;
    
    //continuous streams that need to be destroyed on exit
    public resouceStream: Subscription
    public totalStream: Subscription
    public workdayStream: Subscription
    public resourceContextStream: Subscription
    public totalContextStream: Subscription



    constructor(private tableService: TableService, 
                private dataContextService: DataContextService,
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
        this.prtGridOptions = <GridOptions>{};

        //working days gridoptions
        this.wdGridOptions.context = { };
        this.wdGridOptions.singleClickEdit = true;
        this.wdGridOptions.onCellValueChanged = ($event: any) => {
            this.workdayService.updateWorkingDays($event);
        };
        this.wdGridOptions.onGridReady = () => {
            this.wdGridOptions.api.setHeaderHeight(0)
        }
        this.wdGridOptions.suppressCellSelection=true;
        this.wdGridOptions.domLayout = 'forPrint'         

        //percentage utilised gridoptions
        this.puGridOptions.singleClickEdit = true;
        this.puGridOptions.enableCellExpressions = true;
        this.puGridOptions.suppressCellSelection=true;
        this.puGridOptions.domLayout = 'forPrint'
       

        this.puGridOptions.onCellValueChanged = ($event: any) => {
            let _rowIndex = $event.node.rowIndex
            let _colId = $event.column.colId
            let _focusTable = 'puGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppResourceData, _focusTable, _rowIndex, _colId)
            this.scriptService.updateTable($event)
                .subscribe(
                    data => console.log(data),
                    err => console.log(err),
                    () => { 
                        console.error('COMPLETED');                            
                        this.uiStateService.updateMessage('update completed', this.utilsService.completeStatus).subscribe(this.getSubscriber())
                });
        };
        this.puGridOptions.context = {};
        this.puGridOptions.rowSelection = 'single';
        this.puGridOptions.enableColResize = true;    

        //actual hours gridoptions
        this.ahGridOptions.context = {};
        this.ahGridOptions.onCellValueChanged = ($event: any) => {
            let _rowIndex = $event.node.rowIndex
            let _colId = $event.column.colId
            let _focusTable = 'ahGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppResourceData, _focusTable, _rowIndex, _colId)
            this.scriptService.updateTable($event)
                .subscribe(
                    data => console.log(data),
                    err => console.log(err),
                    () => { 
                        console.error('COMPLETED');                            
                        this.uiStateService.updateMessage('update completed', this.utilsService.completeStatus).subscribe(this.getSubscriber())
                });
        };
        // this.ahGridOptions.rowSelection = 'single';
        this.ahGridOptions.singleClickEdit = true;
        this.ahGridOptions.enableColResize = true;
        this.ahGridOptions.suppressCellSelection=true;
        this.ahGridOptions.domLayout = 'forPrint'        

        //project resource gridoptions
        this.prGridOptions.context = {};
        this.prGridOptions.onCellValueChanged = ($event: any) => {
            let _rowIndex = $event.node.rowIndex
            let _colId = $event.column.colId
            let _focusTable = 'prGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppResourceData, _focusTable, _rowIndex, _colId)
            this.scriptService.updateTable($event)
                .subscribe(
                    data => console.log(data),
                    err => console.log(err),
                    () => { 
                        console.error('COMPLETED');                            
                        this.uiStateService.updateMessage('update completed', this.utilsService.completeStatus).subscribe(this.getSubscriber())
                });
        };
        // this.prGridOptions.rowSelection = 'single';
        this.prGridOptions.singleClickEdit = true;
        this.prGridOptions.enableColResize = true; 
        this.prGridOptions.suppressCellSelection=true;
        this.prGridOptions.domLayout = 'forPrint'

        //Project Resource Totals gridoptions
        this.prtGridOptions.context = {};
        this.prtGridOptions.onGridReady = () => {
            //Remove Header
            this.prtGridOptions.api.setHeaderHeight(0)
        }
        
        this.prtGridOptions.singleClickEdit = true;
        this.prtGridOptions.enableColResize = true;
        this.prtGridOptions.suppressCellSelection=true;
        this.prtGridOptions.domLayout = 'forPrint'        

                                          
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
        
        //Totals
        this.tableService.getTable('PRTotals').subscribe(table => {
            this.prtGridOptions.columnDefs = table;
        });

        this.resouceStream = this.dataContextService.getResourceDataStream().subscribe(data => {
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

            this.resizeTables(data.length);

            // redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            let focusedCellData = this.uiStateService.getFocusCellData()
            if(this[focusedCellData.gridOptions]) {
                this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
                this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            }
        })
        
        this.totalStream = this.dataContextService.getTotalDataStream().subscribe(data => {
            if (!this.prtGridOptions.rowData) {
                this.prtGridOptions.rowData = data;
            } else if (this.prtGridOptions.api) {
                this.prtGridOptions.api.setRowData(data);
            }

        })

        this.workdayStream = this.workdayService.getWorkdayStream().subscribe(data => {
            if (!this.wdGridOptions.rowData){
                this.wdGridOptions.rowData = <Array<IYear>>data;
            } else if (this.wdGridOptions.api) {
                this.wdGridOptions.api.setRowData(data)
            }

        });

        this.resourceContextStream = this.dataContextService.getResourceContextStream().subscribe(data => {
            let _resourceDataName = 'resourceData'    
            if(typeof(data)=='object'){
                if(this.puGridOptions){
                    this.puGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContextService[_resourceDataName]))
                    this.puGridOptions.context.arrayName = _resourceDataName
                }

                if(this.prGridOptions){
                    this.prGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContextService[_resourceDataName]))
                    this.prGridOptions.context.arrayName = _resourceDataName
                }

                if(this.ahGridOptions){
                    this.ahGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContextService[_resourceDataName]))
                    this.ahGridOptions.context.arrayName = _resourceDataName            
                }
            }
        })

        this.totalContextStream = this.dataContextService.getTotalContextStream().subscribe(data => {
            if(typeof(data) == 'object') {
                if(this.prtGridOptions) {
                    let _totalsDataName = 'totalsData'
                    this.prtGridOptions.context.totalsData = JSON.parse(JSON.stringify(this.dataContextService[_totalsDataName]))
                    this.prtGridOptions.context.arrayName = _totalsDataName
                }
            }
        })


        this.refreshGrid()
    }

    ngAfterContentChecked(){
        this.tableReady = true;
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderBGColor(this.settingsService.settings.headerColour)
        }
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderFontColour(this.settingsService.settings.headerFontColour)  
        }
    }

    ngOnDestroy(){
        this.resouceStream.unsubscribe()
        this.totalStream.unsubscribe()
        this.workdayStream.unsubscribe()
        this.resourceContextStream.unsubscribe()
        this.totalContextStream.unsubscribe()
    }

    addResourceRow(){
        this.scriptService.addDataRow(this.utilsService.financeAppResourceData, this.settingsService.year, this.settingsService.autoSave)
            .subscribe(
                data => console.log(data),
                err => console.log(err),
                () => {
                    this.uiStateService.updateMessage(`row created`, this.utilsService.completeStatus).subscribe()
                    console.log(`add resource row completed`);
                    
                }
            );
        return
    }

    deleteResourceRow(){
        
        let selectedNode:any = this.puGridOptions.api.getSelectedNodes();
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
                    .subscribe(
                        data => console.log(data),
                        err => console.log(err),
                        () => {
                            console.log(`delete row completed`);
                            this.uiStateService.updateMessage(`row deleted`, this.utilsService.completeStatus).subscribe()
                        }
                    );
                    } else {
                        alert('something has gone wrong, required data values are not available to delete row')
                    }
        return
    }

    refreshGrid(){
        if(this.settingsService.initAppComplete){
            this.workdayService.getWorkdayData();
            this.scriptService.getAppData([this.utilsService.financeAppResourceData, 
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

    resizeTables(noRows: number) {
        this.wdTableWidth = 1501

        this.puTableHeight = (noRows * 25) + 30;
        this.ahTableHeight = (noRows * 25) + 30;
        this.prTableHeight = (noRows * 25) + 30;

        this.puTableWidth = 1601;
        this.ahTableWidth = 1701;
        this.prTableWidth = 1901;

        //Totals

        this.prtTableWidth = 1920;

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
            var cols =     this.el.nativeElement.getElementsByClassName('ag-header-row');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].backgroundColor = value;
            }
        }
    }

    changeHeaderFontColour(value) {
        if (value) {
            var cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].color = value;
            }
        }
    }

    public isCollapsed(): boolean {
        return this.collapsed;
    }
    
    public toggleMenu(): void {
        this.collapsed = !this.collapsed;
    }
}