import { Component, OnInit, ElementRef, AfterContentChecked, OnDestroy } from '@angular/core'

import { GridOptionsService } from '../../service/grid-options.service'
import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { SettingsService } from '../../service/settings.service'
import { ScriptService } from '../../service/scripts.service'
import { UtilsService } from '../../service/utils.service'

import { GridOptions } from 'ag-grid'

import { fadeInAnimation } from '../../animations/fade-in.animation'
import { slideInOutAnimation } from '../../animations/slide-in-out.animation'

import { Subscription } from 'rxjs/subscription'

@Component({
    selector: 'work-resource',
    templateUrl: './work-resource.component.html',
    styleUrls: ['./work-resource.component.css'],
    animations: [fadeInAnimation, slideInOutAnimation]
})
export class WorkResourceComponent implements OnInit, AfterContentChecked, OnDestroy {
    public title: string = 'Work Resources'
    public wresGridOptions: GridOptions;
    public wresTableWidth: number;
    public wresTableHeight: number;
    public tableReady: boolean = false;
    public collapsed: boolean = false;
    public resourceContextStream: Subscription;
    public resouceStream: Subscription;
    public resourceArray:Array<string>
    public tableInFocus: string;


    constructor(private gridOptionsService: GridOptionsService,
                private tableService: TableService,
                private dataContextService: DataContextService,
                private uiStateService: UiStateService,
                private el: ElementRef,
                private settingsService: SettingsService,
                private scriptService: ScriptService,
                private utilsService: UtilsService){
        this.initGrid()
        this.setTableFocus('PercentageUtilised')
    }

    initGrid(){
        this.wresGridOptions = this.gridOptionsService.wresGridOptions
    }

    setTableFocus(value:string){
        this.tableInFocus = value;
        // this.wresGridOptions.columnApi.setColumnsVisible(, false)
        // this.wresGridOptions.columnApi.setColumnsVisible(, true)
    }

    ngOnInit(){
        this.tableService.getTable('resourceTable').subscribe(table => {
            this.wresGridOptions.columnDefs = table
        })

        this.resouceStream = this.dataContextService.getResourceDataStream().subscribe(data => {
            if(!this.wresGridOptions.rowData) {
                this.wresGridOptions.rowData = data
            }

            if(this.wresGridOptions.api) {
                this.wresGridOptions.api.setRowData(data)
            }

            this.resizeTables(data.length);
            
            //redrawing the grid causing the table to lose focus, we need to check focused cell data and re enter edit mode
            this.updateFocusedCell()            
        })

        this.resourceContextStream = this.dataContextService.getResourceContextStream().subscribe(data => {
            let _resourceDataName = 'resourceData'    
            if(typeof(data)=='object'){
                if(this.wresGridOptions){
                    this.wresGridOptions.context.resourceData = JSON.parse(JSON.stringify(this.dataContextService[_resourceDataName]))
                    this.wresGridOptions.context.arrayName = _resourceDataName
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
        this.resourceContextStream.unsubscribe()
    }

    refreshGrid(){
        if(this.settingsService.initAppComplete){
            this.scriptService.getAppData([this.utilsService.financeAppResourceData, 
                                            this.utilsService.financeAppTotalsData],
                                            this.settingsService.year)
                    .subscribe(data => console.log(data),
                                err => console.log(err),
                                ()=> this.uiStateService.updateMessage(`App Data Retrieved`, this.utilsService.completeStatus)
                                        .subscribe(this.getSubscriber()))
                    
        } else {
            console.log('waiting for application to complete before loading data')
        }
    }    

    addWorkResourceRow(){
        this.scriptService.addDataRow(this.utilsService.financeAppResourceData, this.settingsService.year, this.settingsService.autoSave)
            .subscribe(
                data => console.log(data),
                err => console.log(err),
                () => {
                    this.uiStateService.updateMessage(`row created`, this.utilsService.completeStatus).subscribe()
                }
            );
        return
    }

    deleteWorkResourceRow(){
        let selectedNode:any = this.wresGridOptions.api.getSelectedNodes();
        
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

    public isCollapsed(): boolean {
        return this.collapsed;
    }
    
    public toggleMenu(): void {
        this.collapsed = !this.collapsed;
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

    resizeTables(noRows: number) {
        this.wresTableHeight = (noRows * 25) + 30;
        this.wresTableWidth = 4000;
    }

    updateFocusedCell(){
        let focusedCellData = this.uiStateService.getFocusCellData()
        console.log(focusedCellData)
        if(this[focusedCellData.gridOptions]) {
            this[focusedCellData.gridOptions].api.setFocusedCell(focusedCellData.rowIndex, focusedCellData.colId)
            this[focusedCellData.gridOptions].api.startEditingCell({colKey: focusedCellData.colId,rowIndex: focusedCellData.rowIndex})
        }
    }

    getSubscriber() {
        return {
            next(data){ console.log('next', data) },
            error(err){ console.log('error', err) },
            complete(){ console.log('completed') }
        }
     }    


}