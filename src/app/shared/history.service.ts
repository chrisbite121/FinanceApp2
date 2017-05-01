import { Injectable } from '@angular/core'

import { LogService } from './log.service'

import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class HistoryService {
    private _historicalData: Array<any>
    private _index: number
    private _canRedo: boolean
    private _canUndo: boolean
    private _historyStateStream:Subject<any> = new Subject();

    constructor(private logService: LogService){
        this._historicalData = [];
        this._index = -1;
        this._canRedo = false;
        this._canUndo = false;
    }
    
    get historicalData():Array<any>{
        return this._historicalData
    }

    get canRedo(){
        return this._canRedo;
    }

    get canUndo(){
        return this._canUndo;
    }

    getHistoryStream():Observable<any>{
        return this._historyStateStream.asObservable()
    }

    updateHistoryStream(){
        let obj = {
            canUndo: this._canUndo,
            canRedo: this._canRedo
        }
        this._historyStateStream.next(obj);
    }

    addEntry(data:Array<any>){
        let arry1:Array<any> = []
        arry1 = JSON.parse(JSON.stringify(data));
        
        this._historicalData.push(arry1);

        this.updateState('add');
    }

    get historyIndex():number{
        return this._index;
    }

    undo(){
        if (this._canUndo) {
            let undoData = this._historicalData[this._index - 1]
            this.updateState('undo');
            return undoData;
        } else {
            this.logService.log('failed to Undo - data not found')
            return
        }
    }

    redo(){
        if(this._canRedo) {
         
            let redoData = this._historicalData[this._index + 1];
            this.updateState('redo');
            return redoData
        } else {
            this.logService.log('failed to Redo - data not found')
            return
        }

    }

    updateState(action: string){
        switch (action) {
            case 'undo':
                this._index--
                console.log('undo called');
                break;
            case 'redo':
                this._index++
                console.log('redo called');
                break;
            case 'add':
                //when calling add go to latest item
                console.log('add called');
                this._index = this._historicalData.length -1;
                break;
            default:
                break;
        }
        // console.log(this._index);
        // console.log(this._historicalData.length)

        //check can undo
        switch (true){
            case (this._index > 0):
                this._canUndo = true
            break;
            case (this._index <= 0):
                this._canUndo = false;
            break;
            default:
            //something has gone wrong disabling can undo
                this._canUndo = false;
                this._index = - 1
            break;
        }

        //check can redo
        switch(true) {
            case (this._index < this._historicalData.length - 1):
                // console.log('true');
                this._canRedo = true
            break;
            case (this._index === this._historicalData.length - 1):
                // console.log('equals the same false')
                this._canRedo = false
            break;
            default:
                // something has gone wrong. disabling redo
                this._canRedo = false
                this._index = this._historicalData.length - 1
            break;
        }        

        this.updateHistoryStream();
    }





}