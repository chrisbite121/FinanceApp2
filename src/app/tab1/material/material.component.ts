import { Component, OnInit, OnDestroy, ElementRef, AfterContentChecked, ViewChild } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'

import { Subscription } from 'rxjs/subscription'
import { fadeInAnimation } from '../../animations/fade-in.animation'
import { slideInOutAnimation } from '../../animations/slide-in-out.animation'
import { FabricIconPanelWrapperComponent } from '../../office-fabric/panel/fabric.panel.wrapper.component'

import { IYear } from '../../model/year.model'
@Component({
    selector: 'material',
    templateUrl: './material.component.html',
    styleUrls: ['./material.component.css'],
    // make fade in animation available to this component
    animations: [fadeInAnimation, slideInOutAnimation],    
})
export class MaterialComponent implements OnInit, OnDestroy, AfterContentChecked {
    public tableReady: boolean = false;
    
    public title:string = 'Materials';
    public headerStyle = 'ag-header-cell';
    public collapsed: boolean = false;

    public cmGridOptions: GridOptions
    //totals
    public mattGridOptions: GridOptions
    
    public uiState: any;

    public cmTableHeight: number = 100;
    public mattTableHeight: number = 30;

    public cmTableWidth: number = 1901;
    public mattTableWidth: number = 1901;

    // public _backgroundColour: string = '#99e7ff';

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

        };

        this.cmGridOptions.tabToNextCell = (params: any) => {
            let _focusTable = 'cmGridOptions'
            this.handleTab(params, _focusTable, this.utilsService.financeAppMaterialData)
            return null;
        }
        this.cmGridOptions.navigateToNextCell = (params: any) => {
            let _focusTable = 'cmGridOptions'
            this.handleNavigate(params, _focusTable, this.utilsService.financeAppMaterialData)
            return null;
        }

        this.cmGridOptions.onCellClicked = (event: any) => {
            let _focusTable = 'cmGridOptions'
            this.handleClick(event, _focusTable, this.utilsService.financeAppMaterialData)
        }

        this.cmGridOptions.singleClickEdit = true;
        this.cmGridOptions.enableColResize = true;
        this.cmGridOptions.rowSelection = 'single';
        this.cmGridOptions.suppressCellSelection=true;
        this.cmGridOptions.domLayout = 'forPrint'           

        //Project Materials Totals gridoptions
        this.mattGridOptions.context = {};
        this.mattGridOptions.onGridReady = () => {
            //Remove Header
            if(this.mattGridOptions.api){
                this.mattGridOptions.api.setHeaderHeight(0)                
            }

        }
        this.mattGridOptions.singleClickEdit = true;
        this.mattGridOptions.enableColResize = true;
        this.mattGridOptions.suppressCellSelection=true;
        this.mattGridOptions.domLayout = 'forPrint'                                                        
    }

    ngOnInit() {
        this.tableService.getTable('ProjectCostsMaterials').subscribe(table => {
            this.cmGridOptions.columnDefs = table;
        }); 
        this.tableService.getTable('MatTotals').subscribe(table => {
            this.mattGridOptions.columnDefs = table;
        });


        this.materialStream = this.dataContext.getMaterialDataStream().subscribe(data=>{
            if (!this.cmGridOptions.rowData) {
                this.cmGridOptions.rowData = data;

            } 
            
            if (this.cmGridOptions.api) {
                this.cmGridOptions.api.setRowData(data);
             
            }
            this.resizeMaterialTable(data.length);

            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            this.updateFocusedCell()
        })

        this.totalStream = this.dataContext.getTotalDataStream().subscribe(data => {
            if (!this.mattGridOptions.rowData) {
                this.mattGridOptions.rowData = data;
            } 
            
            if (this.mattGridOptions.api) {
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
        this.refreshGrid()
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
        this.materialStream.unsubscribe()
        this.totalStream.unsubscribe()
        this.materialContextStream.unsubscribe()
        this.totalContextStream.unsubscribe()
    }

    addMaterialRow(){
        this.scriptService.addDataRow(this.utilsService.financeAppMaterialData, this.settingsService.year, this.settingsService.autoSave)
        .subscribe(
            data => console.log(data),
            err => console.log(err),
            () => {
                this.uiStateService.updateMessage(`row created`, this.utilsService.completeStatus).subscribe()
            }
        );
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
                            .subscribe(data => console.log(data),
                                        err => console.log(err),
                                        ()=> this.uiStateService.updateMessage(`App Data Retrieved`, this.utilsService.completeStatus)
                                            .subscribe(this.getSubscriber()));
        } else {
            console.log('waiting for application to complete before loading data')
        }
    }

    saveUpdates(){
        this.scriptService.saveAppData()
            .subscribe(this.getSubscriber())
    }

    resizeTables(noRows: number) {
        this.mattTableWidth = 1901;
    }

    resizeMaterialTable(noRows: number) {
        this.cmTableHeight = (noRows * 25) + 40;
        this.cmTableWidth = 1901;
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