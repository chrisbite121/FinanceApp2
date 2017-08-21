import { Injectable } from '@angular/core'

import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

// import { HistoryService } from './history.service'
//import { IUiState } from '../model/ui-state.model'
import { LogService } from './log.service'
import { UtilsService } from './utils.service'

export interface IFocusColumn {
    columnId: string,
    gridOptions: string
}

const summaryFocusedCells:IFocusColumn[] = [
    {columnId: 'CostBaseline', gridOptions: 'csGridOptions' },
    {columnId: 'GrossBenefitBaseline', gridOptions: 'gsGridOptions' },
    {columnId: 'GrossBenefitLbe', gridOptions: 'gsGridOptions' },
    {columnId: 'GrossBenefitYtd', gridOptions: 'gsGridOptions' }
]

const resourceFocusedCells:IFocusColumn[] = [
    {columnId: 'Name', gridOptions: 'puGridOptions' },
    {columnId: 'Role', gridOptions: 'puGridOptions' },
    {columnId: 'PUJan', gridOptions: 'puGridOptions' },
    {columnId: 'PUFeb', gridOptions: 'puGridOptions' },
    {columnId: 'PUMar', gridOptions: 'puGridOptions' },
    {columnId: 'PUApr', gridOptions: 'puGridOptions' },
    {columnId: 'PUMay', gridOptions: 'puGridOptions' },
    {columnId: 'PUJun', gridOptions: 'puGridOptions' },
    {columnId: 'PUJul', gridOptions: 'puGridOptions' },
    {columnId: 'PUAug', gridOptions: 'puGridOptions' },
    {columnId: 'PUSep', gridOptions: 'puGridOptions' },
    {columnId: 'PUOct', gridOptions: 'puGridOptions' },
    {columnId: 'PUNov', gridOptions: 'puGridOptions' },
    {columnId: 'PUDec', gridOptions: 'puGridOptions' },
    {columnId: 'ContractedDayHours', gridOptions: 'ahGridOptions' },
    {columnId: 'AHJan', gridOptions: 'ahGridOptions' },
    {columnId: 'AHFeb', gridOptions: 'ahGridOptions' },
    {columnId: 'AHMar', gridOptions: 'ahGridOptions' },
    {columnId: 'AHApr', gridOptions: 'ahGridOptions' },
    {columnId: 'AHMay', gridOptions: 'ahGridOptions' },
    {columnId: 'AHJun', gridOptions: 'ahGridOptions' },
    {columnId: 'AHJul', gridOptions: 'ahGridOptions' },
    {columnId: 'AHAug', gridOptions: 'ahGridOptions' },
    {columnId: 'AHSep', gridOptions: 'ahGridOptions' },
    {columnId: 'AHOct', gridOptions: 'ahGridOptions' },
    {columnId: 'AHNov', gridOptions: 'ahGridOptions' },
    {columnId: 'AHDec', gridOptions: 'ahGridOptions' },
    {columnId: 'AHOverHours', gridOptions: 'ahGridOptions' },
    {columnId: 'PRDayRate', gridOptions: 'prGridOptions' },
    {columnId: 'PRBudget', gridOptions: 'prGridOptions' },
    {columnId: 'TSDayRate', gridOptions: 'tsGridOptions' },
    {columnId: 'ATSJan', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSFeb', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSMar', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSApr', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSMay', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSJun', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSJul', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSAug', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSSep', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSOct', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSNov', gridOptions: 'atsGridOptions' },
    {columnId: 'ATSDec', gridOptions: 'atsGridOptions' },
    {columnId: 'RTSBudget', gridOptions: 'rtsGridOptions' }
]

const materialFocusedCells:IFocusColumn[] = [
    {columnId: 'Mat', gridOptions: 'cmGridOptions' },
    {columnId: 'MatBudget', gridOptions: 'cmGridOptions' },
    {columnId: 'MatJan', gridOptions: 'cmGridOptions' },
    {columnId: 'MatFeb', gridOptions: 'cmGridOptions' },
    {columnId: 'MatMar', gridOptions: 'cmGridOptions' },
    {columnId: 'MatApr', gridOptions: 'cmGridOptions' },
    {columnId: 'MatMay', gridOptions: 'cmGridOptions' },
    {columnId: 'MatJun', gridOptions: 'cmGridOptions' },
    {columnId: 'MatJul', gridOptions: 'cmGridOptions' },
    {columnId: 'MatAug', gridOptions: 'cmGridOptions' },
    {columnId: 'MatSep', gridOptions: 'cmGridOptions' },
    {columnId: 'MatOct', gridOptions: 'cmGridOptions' },
    {columnId: 'MatNov', gridOptions: 'cmGridOptions' },
    {columnId: 'MatDec', gridOptions: 'cmGridOptions' }
]



@Injectable()
export class UiStateService {
    private _uiState;
    private _messageStream: Subject<any> = new Subject();
    // add settings 
    // auto save, highlight colour picker, debug mode
    // public _focusCellStream: Subject<any> = new Subject();
    public summaryFocusedCells:Array<IFocusColumn> = summaryFocusedCells;
    public resourceFocusedCells:Array<IFocusColumn> = resourceFocusedCells;
    public materialFocusedCells: Array<IFocusColumn> = materialFocusedCells;

    constructor(private logService: LogService,
                private utilsService: UtilsService){
        this.init()
    }

    init(){
        this._uiState = {
            // redo: false,
            // undo: false,
            // autoSave: false,
            // highlightCss: {},
            // debugMode: false,
            // appProcessing: false,
            // permissionStatusChecked: false,
            // manageList: true,
            // manageWeb: true,
            // viewList: true,
            // addListItems: true,
            // message: '',
            // state: ''
            focusedColumnId: '',
            focusedRowIndex: '',
            focusedList: '',
            focusedGridOptions: '',
            messageData: {
                icon: 'none',
                message: '',
                errorStatus: false
            }

        }
        // this.getHistoryStream();
    }

    resetFocusedCell(listName, gridOptions, rowIndex, columnId){
        let tableName = this.getTableName(listName)
        if(tableName.length>0) {
              this.updateFocusedCellData(listName, gridOptions, rowIndex, columnId)
        }
    }

    updateFocusedCell(listName:string, gridOptions:string, rowIndex:number, columnId:string){
        console.log('Uupdate focused cell called')
        let tableName = this.getTableName(listName)
        let indexValue = this.getNewColumnId(tableName, columnId)
        let newColumnId = this[tableName][indexValue].columnId
        let newGridOptions = this[tableName][indexValue].gridOptions
        console.log(newGridOptions)

        if(listName.length>0 &&
            newGridOptions.length>0 &&
            typeof(rowIndex)=='number' &&
            typeof(newColumnId) == 'string' &&
            newColumnId.length > 0) {

                this.updateFocusedCellData(listName, newGridOptions, rowIndex, newColumnId)
            } else {
                this.logService.log(`error in functionCall updateFocusedCell`, this.utilsService.errorStatus, false)
            }
    }

    getMessageDataStream(): Observable<any> {
        return this._messageStream.asObservable()
    }

    getFocusCellData(){
        return {
            listName: this._uiState.focusedList,
            gridOptions: this._uiState.focusedGridOptions,
            rowIndex: this._uiState.focusedRowIndex,
            colId: this._uiState.focusedColumnId
        }
    }

    updateFocusedCellData(listName, gridOptions, rowIndex, columnId){
            //update ui State
            this._uiState.focusedColumnId = columnId;
            this._uiState.focusedRowIndex = rowIndex;
            this._uiState.focusedList = listName;
            this._uiState.focusedGridOptions = gridOptions;

            console.error(gridOptions)
            console.error(columnId)
            // this._focusCellStream.next({listName, gridOptions, rowIndex, columnId })
    }

    getNewColumnId(tableName, columnId){
        
        let oldIndexValue: number;
        if(tableName.length>0 &&
            this[tableName]) {
            oldIndexValue = this[tableName].findIndex((element:IFocusColumn) => {
                return element.columnId == columnId
            })
        } else {
            this.logService.log(`unable to find index for tableName: ${tableName}, in function getNewColumnId`, this.utilsService.errorStatus, false)
            return
        }

        let newIndexValue: number;

        console.log(this[tableName].length)
        console.log(oldIndexValue)
        if(this[tableName].length == oldIndexValue + 1) {
            //return to start of table
            newIndexValue = 0
        } else {
            newIndexValue = oldIndexValue + 1;
        }
        return newIndexValue
    }

    getTableName(listName){
        let tableName = ''
        switch(listName){
            case this.utilsService.financeAppSummaryData:
                tableName = 'summaryFocusedCells'
            break;
            case this.utilsService.financeAppResourceData:
                tableName = 'resourceFocusedCells'
            break;
            case this.utilsService.financeAppMaterialData:
                tableName = 'materialFocusedCells'
            break
            default:
                this.logService.log(`unable to find focusedCellTable Name for listName: ${listName}, in function getNewColumnId`, this.utilsService.errorStatus, false)
            break
        }

        return tableName
    }

    emitMessageData(){
        this._messageStream.next(this._uiState.messageData)
    }

    updateMessage(message:string, icon:string):Observable<any>{
        let updateMsg$ = new Observable((observer:any) => {
            this._uiState.messageData.message = message;
            this._uiState.messageData.icon = icon;
            this.emitMessageData()

            observer.next({
                functionCall: 'updateMessage',
                result: true
            })
            observer.complete()
        })
        return updateMsg$
    }

    updateErrorStatus(value: boolean): void{
        this._uiState.messageData.errorStatus = value;
        this.emitMessageData()
        return
    }

    // uiState():Observable<any> {
    //     return this._stateStream.asObservable()
    // }

    // getHistoryStream(){
    //     this.historyService.getHistoryStream().subscribe(data => {
    //        try { 
    //             //set undo property
    //             if (data.hasOwnProperty('canUndo') && data.canUndo !== null) {
    //                 if (this._uiState.autoSave == true) {
    //                     //disable undo if autosave enabled
    //                     this._uiState.undo == false    
    //                 } else {
    //                     this._uiState.undo = data['canUndo']
    //                 }
                    
    //             }
           
    //             //set redo property
    //             if (data.hasOwnProperty('canRedo') && data.canRedo !== null) {
    //                 if (this._uiState.autoSave == true) {
    //                     //disable redo if autosave enabled
    //                     this._uiState.redo == false
    //                 } else {
    //                     this._uiState.redo = data['canRedo']
    //                 }
    //             }
    //         }
    //         catch (e){
    //             let result = `unable to update uiState Service with History Service values`
    //             this.logService.log(result, 'error', false)
    //             console.log(e);
    //             this.logService.log(e, 'error', false)
    //             return               
    //         }
    //         this.updateState();
    //     });
    // }

    // updateState(){
    //     this._stateStream.next(this._uiState);
    // }

    // updateUiState(key: string, value: any){
    //     if(this._uiState.hasOwnProperty(key)){
    //         try { 
    //             this._uiState[key] = value;
    //             return 
    //         }
    //         catch (e) {
    //             let result = `unable to update uiState Service with key: ${key} and vlaue: ${value}`
    //             this.logService.log(result, 'error', false)
    //             console.log(e);
    //             this.logService.log(e, 'error', false)
    //             return
    //         }

    //     }
    // }

    // getUiState(key: string) {
    //     if(this._uiState.hasOwnProperty(key)) {
    //         let prop = this._uiState[key];
    //         this.logService.log(`retreiving uiSate property: ${key} with value: ${prop}`, 'info', true);
    //         return prop;
    //     } else {
    //         this.logService.log(`unable to retreive uiState property: ${key}`, 'error', false);
    //         return
    //     }
    // }

    // get uiStateValues(){
    //     return this._uiState
    // }    
}

