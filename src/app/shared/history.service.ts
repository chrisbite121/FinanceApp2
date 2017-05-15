import { Injectable } from '@angular/core'

// import { LogService } from './log.service'

import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class HistoryService {
    private _historicalData: Array<any>
    private _deletedItems: Array<number>
    private _addedItems: Array<number>
    private _index: number
    private _canRedo: boolean
    private _canUndo: boolean
    private _historyStateStream:Subject<any> = new Subject();

    constructor(
        // private logService: LogService
        ){
        this._historicalData = [];
        this._index = -1;
        this._canRedo = false;
        this._canUndo = false;

        //used to track items successfully deleted or created. in scenarios where user uses the 'undo'/'redo' feature, 
        //the current state may need to be updated to reflect the fact that an item has already been created or deleted
        //e.g. user creates item and saves, user then clicks undo, user then clicks save again. the system needs to know to delete the item.
        this._addedItems = new Array();
        this._deletedItems = new Array();

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
        console.log(obj);
        this._historyStateStream.next(obj);
    }

    addEntry(resourceData:Array<any>, materialData:Array<any>, totalData:Array<any>){
        let arry1:Array<any> = []
        let arry2:Array<any> = []
        let arry3:Array<any> = []
        arry1 = JSON.parse(JSON.stringify(resourceData));
        arry2 = JSON.parse(JSON.stringify(materialData));
        arry3 = JSON.parse(JSON.stringify(totalData));

        let objData = {
            resourceData: arry1,
            materialData: arry2,
            totalData: arry3
        }

        this._historicalData.push(objData);

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
            // this.logService.log('failed to Undo - data not found')
            return
        }
    }

    redo(){
        if(this._canRedo) {
         
            let redoData = this._historicalData[this._index + 1];
            this.updateState('redo');
            return redoData
        } else {
            // this.logService.log('failed to Redo - data not found')
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

    addDeletedEntry(ItemId:number):void{
        this._deletedItems.push(ItemId)
        //remove from created array if exists there
        let ItemAddedIndex = this._addedItems.findIndex((element:number) => {
            return element == ItemId
        })
        if (ItemAddedIndex !== -1) {
            this._addedItems.splice(ItemAddedIndex,1);
        }
        return
    }

    addCreatedEntry(ItemId: number):void{
        this._addedItems.push(ItemId)
        //remove from deleted array if exists there
        let ItemDeletedIndex:number = this._deletedItems.findIndex((element:number) => {
            return element == ItemId
        })
        if (ItemDeletedIndex !== -1) {
            this._deletedItems.splice(ItemDeletedIndex, 1);
        }
        return
    }

    checkDeletedEntry(ItemId: number):boolean{
        let ItemDeletedIndex = this._deletedItems.findIndex((element:number) => {
            return element == ItemId
        })
        if (ItemDeletedIndex == -1) {
            return false    
        } else { 
            return true
        }


    }

    checkAddedEntry(ItemId:number):boolean{
        let ItemAddedIndex = this._addedItems.findIndex((element:number) => {
            return element == ItemId
        })
        if (ItemAddedIndex == -1) {
            return false    
        } else { 
            return true
        }        
    }









}