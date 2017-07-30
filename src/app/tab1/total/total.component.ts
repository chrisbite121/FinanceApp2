import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'

import { IYear } from '../../model/year.model'
@Component({
    selector: 'total',
    templateUrl: './total.component.html',
    styleUrls: ['./total.component.css']
})
export class TotalComponent implements OnInit, AfterViewInit {
    //totals
    public tGridOptions: GridOptions    
    
    //totals
    public tTableHeight: number = 30;

    //totals
    public tTableWidth: number = 2100;

    public uiState: any;

    public _backgroundColour: string = '#99e7ff';
    
    //used to track cell focus
    public _focusCell:any
    public _focusTable:string

    constructor(private tableService: TableService, 
                private dataContext: DataContextService,
                private uiStateService: UiStateService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private el: ElementRef) {
        
        //initialise gridoptions objects
        this.tGridOptions = <GridOptions>{};

        //Total cost gridoptions
        this.tGridOptions.context = {};
        this.tGridOptions.onCellValueChanged = ($event: any) => {
            this._focusTable = 'tGridOptions'
            this._focusCell = this.tGridOptions.api.getFocusedCell()
            this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        };
        this.tGridOptions.onGridReady = () => {
            //Remove Header
            this.tGridOptions.headerHeight = 0
        }

        this.tGridOptions.singleClickEdit = true;
        this.tGridOptions.enableColResize = true;
    }

    ngOnInit() {
        this.tableService.getTable('Totals').subscribe(table => {
            this.tGridOptions.columnDefs = table;
        });

        this.dataContext.getTotalDataStream().subscribe(data => {
            console.error('TOTAL DATA RECEIVED')
            console.log(data)


            if (!this.tGridOptions.rowData) {
                this.tGridOptions.rowData = data;
            } else if (this.tGridOptions.api) {
                this.tGridOptions.api.setRowData(data);
            }

            if(this.tGridOptions.api){
                this.applyTotalCellHighlights(data);
            }
           
        })

        this.uiStateService.uiState().subscribe(data => {
            this.uiState = data;
            
        })
        this.scriptService.getAppData([this.utilsService.financeAppTotalsData],
                                        this.settingsService.year)
                                            .subscribe(this.getSubscriber());
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


    applyTotalCellHighlights(tableData: any){
        let bkColour = this._backgroundColour;
        let data:Array<any> = this.constructHighlightsObject(tableData);

        this.tGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })
        this.tGridOptions.api.setColumnDefs(this.tGridOptions.columnDefs);

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
        //Totals
        this.tTableWidth = 2100;
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
            let cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].backgroundColor = value;
            }
        }
    }

    changeHeaderFontColour(value) {
        if (value) {
            let cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].fontColor = value;
            }
        }
    }


}