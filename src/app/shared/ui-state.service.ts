import { Injectable } from '@angular/core'

import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import { HistoryService } from './history.service'
import { IUiState } from '../model/ui-state.model'
import { LogService } from './log.service'

@Injectable()
export class UiStateService {
    private _uiState: IUiState;
    private _stateStream: Subject<any> = new Subject();
    // add settings 
    // auto save, highlight colour picker, debug mode

    constructor(private historyService: HistoryService,
                private logService: LogService){
        this.init()
    }

    init(){
        this._uiState = {
            redo: false,
            undo: false,
            autoSave: false,
            highlightCss: {},
            debugMode: false,
            appProcessing: false,
            permissionStatusChecked: false,
            manageList: true,
            manageWeb: true,
            viewList: true,
            addListItems: true,
            message: '',
            state: ''
        }
        this.getHistoryStream();
    }

    uiState():Observable<any> {
        return this._stateStream.asObservable()
    }

    getHistoryStream(){
        this.historyService.getHistoryStream().subscribe(data => {
           try { 
                //set undo property
                if (data.hasOwnProperty('canUndo') && data.canUndo !== null) {
                    if (this._uiState.autoSave == true) {
                        //disable undo if autosave enabled
                        this._uiState.undo == false    
                    } else {
                        this._uiState.undo = data['canUndo']
                    }
                    
                }
           
                //set redo property
                if (data.hasOwnProperty('canRedo') && data.canRedo !== null) {
                    if (this._uiState.autoSave == true) {
                        //disable redo if autosave enabled
                        this._uiState.redo == false
                    } else {
                        this._uiState.redo = data['canRedo']
                    }
                }
            }
            catch (e){
                let result = `unable to update uiState Service with History Service values`
                this.logService.log(result, 'error', false)
                console.log(e);
                this.logService.log(e, 'error', false)
                return               
            }
            this.updateState();
        });
    }

    updateState(){
        this._stateStream.next(this._uiState);
    }

    updateUiState(key: string, value: any){
        if(this._uiState.hasOwnProperty(key)){
            try { 
                this._uiState[key] = value;
                return 
            }
            catch (e) {
                let result = `unable to update uiState Service with key: ${key} and vlaue: ${value}`
                this.logService.log(result, 'error', false)
                console.log(e);
                this.logService.log(e, 'error', false)
                return
            }

        }
    }

    getUiState(key: string) {
        if(this._uiState.hasOwnProperty(key)) {
            let prop = this._uiState[key];
            this.logService.log(`retreiving uiSate property: ${key} with value: ${prop}`, 'info', true);
            return prop;
        } else {
            this.logService.log(`unable to retreive uiState property: ${key}`, 'error', false);
            return
        }
    }

    get uiStateValues(){
        return this._uiState
    }    
}

