import { Injectable } from '@angular/core'

import { GridOptions } from 'ag-grid'
import { ScriptService } from '../service/scripts.service'
import { UiStateService } from '../service/ui-state.service'
import { UtilsService } from '../service/utils.service'

@Injectable()
export class GridOptionsService {
    private _wresGridOptions: GridOptions

    constructor(private scriptService: ScriptService,
                private uiStateService: UiStateService,
                private utilsService: UtilsService){
        this.defineResGridOptions()
    }

    defineResGridOptions() {
        this._wresGridOptions = {}

        //percentage utilised gridoptions
        this._wresGridOptions.singleClickEdit = true;
        this._wresGridOptions.enableCellExpressions = true;
        this._wresGridOptions.suppressCellSelection=true;
        this._wresGridOptions.domLayout = 'forPrint'
       

        this._wresGridOptions.onCellValueChanged = ($event: any) => {
            if(+$event.newValue !== +$event.oldValue) {
                this.scriptService.updateTable($event)
                .subscribe(
                    data => console.log(data),
                    err => console.log(err),
                    () => { 
                        console.error('COMPLETED RES');                            
                        this.uiStateService.updateMessage('update completed', this.utilsService.completeStatus).subscribe(this.getSubscriber())
                });
            } else {
                this.updateFocusedCell()
            }
            
        };
        this._wresGridOptions.context = {};
        this._wresGridOptions.rowSelection = 'single';
        this._wresGridOptions.enableColResize = true;    

        this._wresGridOptions.tabToNextCell = (params: any) => {
            let _focusTable = 'puGridOptions'
            this.handleTab(params, _focusTable, this.utilsService.financeAppResourceData)
            return null;
        }
        this._wresGridOptions.navigateToNextCell = (params: any) => {
            let _focusTable = 'puGridOptions'
            this.handleNavigate(params, _focusTable, this.utilsService.financeAppResourceData)
            return null;
        }

        this._wresGridOptions.onCellClicked = (event: any) => {
            let _focusTable = 'puGridOptions'
            this.handleClick(event, _focusTable, this.utilsService.financeAppResourceData)
        }        
    }

    get wresGridOptions() {
        return this._wresGridOptions
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