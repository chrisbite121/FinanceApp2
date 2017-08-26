import { Component, OnInit, OnDestroy, ElementRef, AfterContentChecked } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'
import { UiStateService } from '../../service/ui-state.service'

import { fadeInAnimation } from '../../animations/fade-in.animation'
import { slideInOutAnimation } from '../../animations/slide-in-out.animation'
import { FabricIconPanelWrapperComponent } from '../../office-fabric/panel/fabric.panel.wrapper.component'

import { Subscription } from 'rxjs/subscription'

import { IYear } from '../../model/year.model'
@Component({
    selector: 'travel',
    templateUrl: './travel.component.html',
    styleUrls: ['./travel.component.css'],
    // make fade in animation available to this component
    animations: [fadeInAnimation, slideInOutAnimation],   
})
export class TravelComponent implements OnInit, OnDestroy, AfterContentChecked {
    public tableReady: boolean = false;
    public collapsed: boolean = false;    
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
            let _rowIndex = $event.node.rowIndex
            let _colId = $event.column.colId
            let _focusTable = 'tsGridOptions'
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
        // this.tsGridOptions.rowSelection = 'single';
        this.tsGridOptions.singleClickEdit = true;
        this.tsGridOptions.enableColResize = true;
        this.tsGridOptions.suppressCellSelection=true;
        this.tsGridOptions.domLayout = 'forPrint'  

        //actual travel subsidence gridoptions
        this.atsGridOptions.context = {};
        this.atsGridOptions.onCellValueChanged = ($event: any) => {

            let _rowIndex = $event.node.rowIndex
            let _colId = $event.column.colId
            let _focusTable = 'atsGridOptions'
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
        // this.atsGridOptions.rowSelection = 'single';
        this.atsGridOptions.singleClickEdit = true;
        this.atsGridOptions.enableColResize = true;
        this.atsGridOptions.suppressCellSelection=true;
        this.atsGridOptions.domLayout = 'forPrint'  

        //Project resource travel subsistence gridoptions
        this.rtsGridOptions.context = {};
        this.rtsGridOptions.onCellValueChanged = ($event: any) => {
            let _rowIndex = $event.node.rowIndex
            let _colId = $event.column.colId
            let _focusTable = 'rtsGridOptions'
            this.uiStateService.updateFocusedCell(this.utilsService.financeAppResourceData, _focusTable, _rowIndex, _colId)
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        this.rtsGridOptions.rowSelection = 'single';
        this.rtsGridOptions.singleClickEdit = true;
        this.rtsGridOptions.enableColResize = true;
        this.rtsGridOptions.suppressCellSelection=true;
        this.rtsGridOptions.domLayout = 'forPrint'  

        //Resource Travel Subsistence Totals gridoptions
        this.rtstGridOptions.context = {};
        this.rtstGridOptions.onGridReady = () => {
            //Remove Header
            this.rtstGridOptions.api.setHeaderHeight(0)
        }

        this.rtstGridOptions.singleClickEdit = true;
        this.rtstGridOptions.enableColResize = true;
        this.rtstGridOptions.suppressCellSelection=true;
        this.rtstGridOptions.domLayout = 'forPrint'  
                         
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
            } 
            
            if (this.tsGridOptions.api) {
                this.tsGridOptions.api.setRowData(data);
            }
            
            if (!this.atsGridOptions.rowData) {
                this.atsGridOptions.rowData = data;
            }
            
            if (this.atsGridOptions.api) {
                this.atsGridOptions.api.setRowData(data);
            }
            
            if (!this.rtsGridOptions.rowData) {
                this.rtsGridOptions.rowData = data;
            }
            
            if (this.rtsGridOptions.api) {
                this.rtsGridOptions.api.setRowData(data);
            }

            this.resizeTables(data.length);

            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            let focusedCellData = this.uiStateService.getFocusCellData()
            if(this[focusedCellData.gridOptions]) {
                this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
                this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
            }            

        })

        this.totalStream = this.dataContext.getTotalDataStream().subscribe(data => {

            if (!this.rtstGridOptions.rowData) {
                this.rtstGridOptions.rowData = data;
            } 
            
            if (this.rtstGridOptions.api) {
                this.rtstGridOptions.api.setRowData(data);
            }

        })

        this.resourceContextStream = this.dataContext.getResourceContextStream().subscribe(data => {
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

    ngAfterContentChecked () {
        this.tableReady = true;
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


    // addResourceRow(){
    //     this.scriptService.addDataRow(this.utilsService.financeAppResourceData, this.settingsService.year, this.settingsService.autoSave)
    //         .subscribe(this.getSubscriber());
    //     return
    // }

    // deleteResourceRow(){
    //     let selectedNode:any = this.tsGridOptions.api.getSelectedNodes();
    //     console.log(selectedNode)
        
    //     if (!Array.isArray(selectedNode)) {
    //         alert('no row selected');
    //         return
    //     }

    //     if (selectedNode.length !== 1) {
    //         alert('only 1 row must be selected to perform the delete operation')
    //         return
    //     }

    //     if (selectedNode[0].hasOwnProperty('data') && 
    //         selectedNode[0].data.hasOwnProperty('ID')) {
    //             this.scriptService.deleteDataRow(this.utilsService.financeAppResourceData,
    //             selectedNode[0].data.ID)
    //                 .subscribe(this.getSubscriber());
    //                 } else {
    //                     alert('something has gone wrong, required data values are not available to delete row')
    //                 }
    //     return
    // }    

    refreshGrid(){
        if(this.settingsService.initAppComplete) {
            this.scriptService.getAppData([this.utilsService.financeAppResourceData, 
                                        this.utilsService.financeAppTotalsData],
                                        this.settingsService.year)
                            .subscribe(data => console.log(data),
                                        err => console.log(err),
                                        ()=> this.uiStateService.updateMessage(`App Data Retrieved`, this.utilsService.completeStatus));
        }
    }

    saveUpdates(){
        this.scriptService.saveAppData()
            .subscribe(this.getSubscriber());
    }

    resizeTables(noRows: number) {
        this.tsTableHeight = (noRows * 25) + 40;
        this.atsTableHeight = (noRows * 25) + 40;
        this.rtsTableHeight = (noRows * 25) + 40;

        this.tsTableWidth = 1601;
        this.atsTableWidth = 1601;
        this.rtsTableWidth = 1901;
        //Totals
        this.rtstTableWidth = 1901;
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