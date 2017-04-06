import { Injectable } from '@angular/core'

import { Observable } from 'rxjs/RX';
import { Subject } from 'rxjs/Subject';

import { HistoryService } from './history.service'
import { IUiState } from '../model/ui-state.model'

@Injectable()
export class UiStateService {
    private _uiState: IUiState;
    private _stateStream: Subject<any> = new Subject();
    // add settings 
    // auto save, highlight colour picker, debug mode

    constructor(private historyService: HistoryService){
        this.init()
    }

    init(){
        this._uiState = {
            redo: false,
            undo: false,
            autoSave: false,
            highlightCss: {},
            debugMode: false,
            apicall: true,
        }
        this.getHistoryStream();
    }

    uiState():Observable<any> {
        return this._stateStream.asObservable()
    }

    getHistoryStream(){
        this.historyService.getHistoryStream().subscribe(data => {
            if (data['canUndo'] !== null) {
                this._uiState.undo = data['canUndo']
            }
            if (data['canRedo'] !== null) {
                this._uiState.redo = data['canRedo']
            }
            this.updateState();
        });
    }

    updateState(){
        this._stateStream.next(this._uiState);
    }


}