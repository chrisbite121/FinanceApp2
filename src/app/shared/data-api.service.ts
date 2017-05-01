import { Injectable } from '@angular/core'
import { CommonApiService } from './api-common.service'
import { UtilsService } from './utils.service'
import { LogService } from './log.service'

import { IItemPropertyModel,
        IUpdateItemResult,
        IDeleteItemResult } from '../model/data-validation.model'
import { IProcessDataReport } from '../model/health-report.model'

import { Observable } from 'rxjs/Rx'
import { Observer } from 'rxjs/Observer';
import { mergeAll } from 'rxjs/operator/mergeAll'
import { _do } from 'rxjs/operator/do'
import { max } from 'rxjs/operator/max'


@Injectable()
export class DataApiService {
    private _processDataReport:IProcessDataReport

    constructor(private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private logService: LogService){

    }

    public processFinanceData(data, listName) {
        //data Arry
        let _observableArrary = []

        if (typeof(data) == 'object') {
            data.foreach(element=>{
                let _result;
                if(element.state==this.utilsService.createState) {
                    let fieldArray = this.createFieldArray(element);
                    
                    _observableArrary.push(this.commonApiService.addItem(listName, this.utilsService.hostWeb, fieldArray))
                    
                    //_result = this.addItem(fieldArry, listName);
                    
                    // this._processDataReport.createResults.push({
                    //     fieldName: element.Name,
                    //     operation: this.utilsService.createState,
                    //     result: _result
                    // })

                } else if (element.state == this.utilsService.deleteState) {
                    // _result = this.deleteItem(listName, element['ItemId'])

                    // this._processDataReport.deleteResults.push({
                    //     fieldName: element.Name,
                    //     operation: this.utilsService.deleteState,
                    //     result: _result
                    // })
                    _observableArrary.push(this.commonApiService.deleteItem(listName, element['itemId'], this.utilsService.hostWeb))
                } else if (element.state == this.utilsService.updateState) {
                    let fieldsArray = this.createFieldArray(element);
                    // _result = this.updateItem(fieldArry, listName, element['itemId'])
                    // this._processDataReport.updateResults.push({
                    //     fieldName: element.Name,
                    //     operation: this.utilsService.updateState,
                    //     result: _result
                    // })
                    _observableArrary.push(this.commonApiService.updateItem(listName, this.utilsService.hostWeb, element['itemId'], fieldsArray))
                    
                } else if (element.state == this.utilsService.inertState) {
                    this.logService.log(`not processing element of state inert`, this.utilsService.infoStatus, true);
                    // _result = {
                    //     fieldName: element.Name,
                    //     operation: this.utilsService.inertState,
                    //     result: true
                    // }
                    // this._processDataReport.inertResults.push(_result);
                }
            })

            return _observableArrary;

        }
    }

    private addItem(fieldsArry, listName) {
        this.commonApiService.addItem(listName, this.utilsService.hostWeb, fieldsArry)
            .subscribe(
                data => {
                    if (typeof(data) === 'object' &&
                        data.listName &&
                        data.result) {
                            if (data.result === true) {
                                return true
                            } else {
                                return false
                            }
                    }
                },
                err => {
                    return false
                },
                () => {
                    return
                }
            )
    }

    private deleteItem(listName, itemId){
        this.commonApiService.deleteItem(listName, itemId, this.utilsService.hostWeb)
            .subscribe(
                data => {
                    if (typeof(data) === 'object' &&
                        data.listName &&
                        data.result) {
                            if (data.result === true) {
                                return true
                            } else {
                                return false
                            }
                    }
                },
                err => {
                    return false
                },
                () => {
                    return
                }
            )            
    }

    private updateItem(fieldsArry, listName, itemId){
        this.commonApiService.updateItem(listName, this.utilsService.hostWeb, itemId, fieldsArry)
            .subscribe(
                data => {
                    if (typeof(data) === 'object' &&
                        data.listName &&
                        data.result &&
                        data.itemId) {
                            if (data.result === true) {
                                return true
                            } else {
                                return false
                            }
                    }
                },
                err => {
                    return false
                },
                () => {
                    return
                }
            )            
    }

    public getResourceData(){
        this.logService.log('starting getResourceData function', this.utilsService.infoStatus, true);
        this.commonApiService.getItems(this.utilsService.financeAppResourceData, this.utilsService.hostWeb)
            .subscribe(
                data => {
                    if (typeof(data) === 'object' &&
                        data.listName &&
                        data.result &&
                        data.fieldValues) {
                            if (data.result == true) {
                                return data.fieldValues
                            } else {
                                return false
                            }
                    }
                },
                err => {
                    return false
                },
                () => {
                    this.logService.log('exiting getResourceData function', this.utilsService.infoStatus, true);
                }
            )
    }

    public getMaterialData(){
        this.logService.log('starting getMaterialData function', this.utilsService.infoStatus, true);
        this.commonApiService.getItems(this.utilsService.financeAppMaterialData, this.utilsService.hostWeb)
            .subscribe(
                data => {
                    if (typeof(data) == 'object' &&
                        data.listName &&
                        data.result &&
                        data.fieldValues) {
                            if (data.result == true) {
                                //NEED TO PROCESS DATA
                                return data.fieldValues
                            } else {
                                return false
                            }
                    }
                },
                err => {
                    return false
                },
                () => {
                    this.logService.log('exiting getMaterialData function', this.utilsService.infoStatus, true);
                }
            )
    }

    public getTotalData() {
        this.logService.log('starting getTotalData function', this.utilsService.infoStatus, true);
        this.commonApiService.getItems(this.utilsService.financeAppTotalsData, this.utilsService.hostWeb)
            .subscribe(
                data => {
                    if (typeof(data) == 'object' &&
                        data.listName &&
                        data.result &&
                        data.fieldValues) {
                            if (data.result == true) {
                                return data.fieldValues
                            } else {
                                return false
                            }
                    }
                },
                err => {
                    return false
                },
                () => {
                    this.logService.log('exiting getTotalData function', this.utilsService.infoStatus, true);
                }
            )
    }


createFieldArray(item){
    //create fields array
    let _fieldArray:Array<IItemPropertyModel> = []
    for (let property in item) {
        if (item.hasOwnProperty(property) &&
            property !== 'FieldValue' &&
            property !== 'ItemId') {
            _fieldArray.push({
                fieldName: property,
                fieldValue: item[property]
            })
        }

    }
    return _fieldArray   
}

resetProcessDataReport() {
    this._processDataReport = {
        createResults: [],
        updateResults: [],
        deleteResults: [],
        inertResults: []
    }

}
crap () {
let poo = new Observable((observer:Observer<any>) => {
    observer.next(1)
    observer.next(2)
    observer.complete()
})
let pee = new Observable().do(res => { return res })
let pooArry = [poo, pee]
let crap = new Observable().merge(pooArry).subscribe()

let hot =  Observable.from([1,2,3,4]).mergeAll()

let r = Observable.from([1,3]).merge()




}





}