import { Component, OnInit } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../../service/table.service'
import { DataContextService } from '../../../service/data-context.service'
import { UiStateService } from '../../../service/ui-state.service'
import { ScriptService } from '../../../service/scripts.service'
import { SettingsService } from '../../../service/settings.service'
import { UtilsService } from '../../../service/utils.service'
import { LogService } from '../../../service/log.service'

@Component({
    selector: 'gross-summary',
    templateUrl: './gross-summary.component.html',
    styleUrls: ['./gross-summary.component.css']
})
export class GrossSummaryComponent implements OnInit {

    public gsGridOptions:GridOptions

    gsTableHeight: number = 60;
    gsTableWidth: number = 1000;

    public _focusCell:any
    public _focusTable:string
    public _backgroundColour: string = '#99e7ff';

    constructor(private tableService: TableService, 
                private dataContextService: DataContextService,
                private uiStateService: UiStateService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private logService: LogService) {

        //initialise gridoptions objects
        this.gsGridOptions = <GridOptions>{};

        //Summary Table gridoptions
        this.gsGridOptions.context = {}
        this.gsGridOptions.onCellValueChanged = ($event: any) => {
            this._focusTable = 'gsGridOptions'
            this._focusCell = this.gsGridOptions.api.getFocusedCell()
            this.scriptService.updateTable($event).subscribe(this.getSubscriber())
        }
        this.gsGridOptions.onGridReady = () => {
            this.gsGridOptions.headerHeight = 0
        }

        this.gsGridOptions.singleClickEdit = true;
        this.gsGridOptions.enableColResize = true;
    }

    ngOnInit(){
        //ERROR WITH THIS APPROACH
        //APP NEEDS TO FINISH INIT CALL BEFORE CALLING THIS CODE

        // this.tableService.getTable('GrossSummary').subscribe(table => {
        //     this.gsGridOptions.columnDefs = table;
        // })

        // this.dataContextService.getSummaryDataStream().subscribe(data => {
        //     console.log(data);

        //     if(!this.gsGridOptions.rowData){
        //         this.gsGridOptions.rowData = data;
        //     } else if (this.gsGridOptions.api) {
        //         this.gsGridOptions.api.setRowData(data)
        //     }

        //     if(this.gsGridOptions.api) {
        //         this.applySummaryCellHighlights(data);
        //     }
        //     this.setCellFocus();  
        // })

        // this.scriptService.getAppData([this.utilsService.financeAppSummaryData],
        //                             this.settingsService.year)
        //                                 .subscribe(this.getSubscriber())
    }

    getSubscriber() {
        return {
            next(data){ console.log('next', data) },
            error(err){ console.log('error', err) },
            complete(){ console.log('completed') }
        }
     }
    
    applySummaryCellHighlights(tableData: any) {
        let bkColour = this._backgroundColour;
        let data:Array<any> = this.constructHighlightsObject(tableData);

        this.gsGridOptions.columnDefs.forEach((column:any) => {
            //highlight updated cells
            return this.applyCellStyle(column,data, bkColour);
        })
        this.gsGridOptions.api.setColumnDefs(this.gsGridOptions.columnDefs);        
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
                this.logService.log(`error tyring to set cell focus on focusTable: ${this._focusTable}` )
            }
        }       
    }

}