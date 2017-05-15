import { Injectable, Inject } from '@angular/core'

//models
import { IResourceModel } from '../model/resource.model'
import { ITotalModel } from '../model/total.model'
import { IMatModel } from '../model/material.model'
import { ISettings } from '../model/settings.model'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { IItemPropertyModel,
        IUpdateItemResult,
        IDeleteItemResult } from '../model/data-validation.model'

//import { JQUERY_TOKEN } from './jquery.service'
import { CommonApiService } from './api-common.service'
import { HistoryService } from './history.service'
import { DataCalcService } from './data-calc.service'
import { UtilsService } from './utils.service'
import { LogService } from './log.service'
import { SettingsService } from './settings.service'
import { HealthReportService } from './health-report.service'
import { ListService } from './list.service'

//application data
import { newDataRow } from '../config/new-row'
import { newTotalDataRow } from '../config/new-total'
import { newMaterialDataRow } from '../config/new-mat'
import { initData } from '../config/data'
import { initTotalData } from '../config/totaldata'
import { initMaterialData } from '../config/materialdata'

//const PercentageUtilisedData:IResourceModel[] = initData;
const newResourceRow:IResourceModel = newDataRow;
const newMaterialRow:IMatModel = newMaterialDataRow;
const newTotalRow: ITotalModel = newTotalDataRow
const totalData: Array<ITotalModel> = initTotalData
const resourceData:IResourceModel[] = initData;
const matData: Array<IMatModel> = initMaterialData;


@Injectable()
export class DataContextService {
    private obs: Observable<any>
    private resourceDataStream: Subject<any> = new Subject();
    private totalDataStream: Subject<any> = new Subject();
    private materialDataStream: Subject<any> = new Subject();
    // private ctxStream: Subject<any> = new Subject();
    // private ctxObject: any[] = new Array;
    private stateChange: boolean = false;
    private _year: number = 2017;
    private _sharepointMode: Boolean = false;
    private _ResourceData:IResourceModel[]
    private _TotalData:ITotalModel[]
    private _MaterialData: IMatModel[]

    // private _initComplete: boolean = false;

    constructor( // @Inject(JQUERY_TOKEN) private jQuery: any,
                private commonApiService: CommonApiService,
                private historyService: HistoryService,
                private dataCalcService: DataCalcService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private logService: LogService,
                private healthReportSerivce: HealthReportService,
                private listService: ListService){
                    this.init();

                }
    
    init(){
        this.settingsService.getSettingsStream().subscribe((settings:ISettings) => {
            this._year = settings.year;
            this._sharepointMode = settings.sharePointMode
        })
        //CHECK SETTINGS TO SEE IF SHOULD USE LOCAL MODE OR SHAREPOINT MODE
        //IF HTTP CALL RETURNS NO DATA USE PLACEHOLDER DATA
        this._ResourceData = resourceData;
        this._TotalData = totalData;
        this._MaterialData = matData;

        //process calculated fields to make sure data is correct
        this.calcTotalValues()
        this.calcResourceValues()
        this.calcMaterialValues()

        //ONLY USING UNDO REDO WHEN AUTOSAVE DISABLED
        if (!this.settingsService.autoSave) {
            this.addToHistory();
        }
    }
    

    // getApiData(Resource:boolean,Material:boolean,Total:boolean):Observable<any>{
    //     let _observableArray = []

    //     if (Resource) _observableArray.push(this.commonApiService.getItems(this.utilsService.financeAppResourceData, this.utilsService.hostWeb))

    //     if (Material) _observableArray.push(this.commonApiService.getItems(this.utilsService.financeAppMaterialData, this.utilsService.hostWeb))

    //     if (Total) _observableArray.push(this.commonApiService.getItems(this.utilsService.financeAppTotalsData, this.utilsService.hostWeb))

    //     let getData$ = 
    //         Observable.of(true)
    //         .mergeMap(data => 
    //             data
    //             ? Observable.from(_observableArray)
    //             : Observable.of(data)
    //         )
    //         .mergeMap(data =>
    //             // process list data
    //             (typeof(data) === 'object' &&
    //             data.hasOwnProperty('listName') &&
    //             data.hasOwnProperty('apiCall') &&
    //             data.hasOwnProperty('result') &&        
    //             data['apiCall'] == this.utilsService.apiCallGetItems && 
    //             data['result'] == true)
    //             ? this.processListData(data['data'], data['listName'])
    //             : Observable.of(data)
    //         )

    //     return getData$
    // }

processListData(data:Array<Object>, listName: string):Observable<any> {

    this.logService.log(`Process List Data Function called for list: ${listName}`, this.utilsService.infoStatus, false);

   let listData$ = new Observable((observer:Observer<any>) => {

        let _resultsArray = new Array()
        
        //need to pull out the field names from list spec and put them into array
        let fieldNameArray = this.listService.getArrayFieldNames(listName);

        if (data.length>0) {

            data.forEach(item => {
                console.log(item)
                let _item = new Object();
                //set base template of item and update internal field values
                switch (listName) {
                    case this.utilsService.financeAppMaterialData:
                        _item = JSON.parse(JSON.stringify(newMaterialDataRow))
                        _item['State'] = 'inert'
                        _item['Highlights'] = [];
                        _item['ListName'] = listName;
                    break;
                    case this.utilsService.financeAppResourceData:
                        _item = JSON.parse(JSON.stringify(newDataRow))
                        _item['State'] = 'inert'
                        _item['Highlights'] = [];
                        _item['ListName'] = listName;
                    break;
                    case this.utilsService.financeAppTotalsData:
                        _item = JSON.parse(JSON.stringify(newTotalDataRow))
                        _item['Placeholder1'] = 'TOTAL (Incl Resource Costs)'
                        _item['Placeholder4'] = 'Resource Totals'
                        _item['Placeholder5'] = 'Resource T&S Totals'
                        _item['Placeholder6'] = 'Material Totals'
                        _item['State'] = 'inert'
                        _item['Highlights'] = [];
                        _item['ListName'] = listName;
                    break
                    default:
                        this.logService.log(`process list data error: unable to determine listName`, this.utilsService.errorStatus, false)
                    break;
                }   

                //filter out superlous item data and create an object of just the required fields
                for (let key in item) {
                    let indexValue = fieldNameArray.findIndex((element) => {
                        return element == key
                    })
                    if (indexValue >= 0){
                        
                        Object.defineProperty(_item, key, {
                            value: item[key],
                            writable: true
                        }) 
                    }
                }
                console.log(item['Role']);
                console.log(_item['Role']);

                _resultsArray.push(JSON.parse(JSON.stringify(_item)));

                console.log(_resultsArray);
            })

            switch (listName) {
                case this.utilsService.financeAppResourceData:
                    this._ResourceData = _resultsArray;
                break;
                case this.utilsService.financeAppMaterialData:
                    this._MaterialData = _resultsArray
                break;
                case this.utilsService.financeAppTotalsData:
                    this._TotalData = _resultsArray
                break
                default:
                    this.logService.log(`process list data error: unable to determine which dataset to update`, this.utilsService.errorStatus, false)
                break;
            }

            observer.next({
                functionCall: 'processListData',
                result: 'success'
            })

        }
        observer.complete()
    })

    return listData$

}    

    // getApiData(){
    //     let _getDataReport: Array<any>
    //     _getDataReport = [];

    //     let _observableArray = [
    //         this.commonApiService.getItems(this.utilsService.financeAppResourceData, this.utilsService.hostWeb),
    //         this.commonApiService.getItems(this.utilsService.financeAppMaterialData, this.utilsService.hostWeb),
    //         this.commonApiService.getItems(this.utilsService.financeAppTotalsData, this.utilsService.hostWeb)
    //     ]

    //     let getData$ = Observable.from(_observableArray).mergeAll();

    //     getData$.subscribe(
    //         data => {
    //             if (typeof(data) === 'object' &&
    //                 data.hasOwnProperty('listName') &&
    //                 data.hasOwnProperty('result') &&
    //                 data.hasOwnProperty('fieldValues')) {
    //                     _getDataReport.push(data)
    //                     if (data.result === true && data.listName === this.utilsService.financeAppResourceData) {
    //                         this._ResourceData = data.fieldValues
    //                     } else if (data.result === false && data.listName === this.utilsService.financeAppResourceData) {
    //                         //Failed to get Resource Data
    //                         this.logService.log('failed to get Finance App Resource Data', this.utilsService.errorStatus, false);
    //                     }

    //                     if (data.result == true && data.listName == this.utilsService.financeAppMaterialData) {
    //                         this._MaterialData = data.fieldValues
    //                     } else if (data.result == false && data.listName == this.utilsService.financeAppMaterialData) {
    //                         //Failed to get Material Data
    //                         this.logService.log('failed to get Finance App Material Data', this.utilsService.errorStatus, false);
    //                     }

    //                     if (data.result == true && data.listName == this.utilsService.financeAppTotalsData) {
    //                         this._TotalData = data.fieldValues
    //                     } else if (data.result == false && data.listName == this.utilsService.financeAppTotalsData) {
    //                         //Failed to get Totals Data
    //                         this.logService.log('failed to get Finance App Total Data', this.utilsService.errorStatus, false);                            
    //                     }
    //             }
    //         },
    //         err => {
    //             this.logService.log(`error calling api service to get data`, this.utilsService.errorStatus, false);
    //             this.logService.log(err, this.utilsService.errorStatus, false);
    //         },
    //         () => {
    //             this.logService.log('exiting getResourceData function', this.utilsService.infoStatus, true);
    //             this.healthReportSerivce.getDataReport = _getDataReport
    //         }            
    //     )        
    // }

    get resourceData(){
        return this._ResourceData
    }   

    get materialData(){
        return this._MaterialData
    }

    get totalsData() {
        return this._TotalData
    }

    // submitApiData(){
    //     this.logService.log('submit data to api function called', this.utilsService.infoStatus, false);
        // let submit$ = new Observable((observer:Observer<any>) => {
        //     let _submitDataReport: Array<any>
        //     _submitDataReport = [];

        //     let _resourceObservableArray: Array<any>
        //     let _materialObservableArray: Array<any>
        //     let _totalObservableArray: Array<any>
        //     let _observableArray: Array<any>
            
        //     _resourceObservableArray = this.prepDataForApi(this._ResourceData, this.utilsService.financeAppResourceData)
        //     _materialObservableArray = this.prepDataForApi(this._MaterialData, this.utilsService.financeAppMaterialData)
        //     _totalObservableArray = this.prepDataForApi(this._TotalData, this.utilsService.financeAppTotalsData)

        //     _observableArray = _resourceObservableArray.concat(_materialObservableArray).concat(_totalObservableArray)

        //     let submitData$ = Observable
        //             .from(_observableArray).mergeAll()
        //             .mergeMap(data =>
        //             (
        //             (typeof(data) === 'object' &&
        //             data.hasOwnProperty('listName') &&
        //             data.hasOwnProperty('result') &&
        //             data.hasOwnProperty('apiCall') &&
        //             data['apiCall'] === 'addItem' &&
        //             data['result'] == true)

        //             ||

        //             (typeof(data) === 'object' &&
        //             data.hasOwnProperty('listName') &&
        //             data.hasOwnProperty('result') &&
        //             data.hasOwnProperty('apiCall') &&
        //             data['apiCall'] === 'deleteItem' &&
        //             data['result'] === true)
                    
        //             ||

        //             (typeof(data) === 'object' &&
        //             data.hasOwnProperty('listName') &&
        //             data.hasOwnProperty('result') &&
        //             data.hasOwnProperty('apiCall') &&
        //             data['apiCall'] === 'updateItem' &&
        //             data['result'] == true)
        //             )
                    
        //             ? this.updateStateAfterApiCall(data['listName'], data['itemId'], data['apiCall'])
        //             : Observable.of(data)


        //             )


//             submitData$.subscribe(
//                 data => {
//                     //replace these tests with report 
//                     if (typeof(data) === 'object' &&
//                         data.hasOwnProperty('listName') &&
//                         data.hasOwnProperty('result') &&
//                         data.hasOwnProperty('apiCall') &&
//                         data.apiCall === 'addItem') {
//                             _submitDataReport.push(data)
//                             if (data.result === true) {
//                             this.logService.log(`item added to list`, this.utilsService.infoStatus, true); 
//                             } else {
//                                 this.logService.log(`failed to add item added to list`, this.utilsService.errorStatus, true);
//                             }
//                     }
//                     else if (typeof(data) === 'object' &&
//                         data.hasOwnProperty('listName') &&
//                         data.hasOwnProperty('result') &&
//                         data.hasOwnProperty('apiCall') &&
//                         data.apiCall === 'deleteItem') {
//                             _submitDataReport.push(data)
//                             if (data.result === true) {
//                             this.logService.log(`item deleted`, this.utilsService.infoStatus, true); 
//                             } else {
//                                 this.logService.log(`failed to delete item added to list`, this.utilsService.errorStatus, true);
//                             }
//                     }
//                     else if (typeof(data) === 'object' &&
//                         data.hasOwnProperty('listName') &&
//                         data.hasOwnProperty('result') &&
//                         data.hasOwnProperty('apiCall') &&
//                         data.apiCall === 'updateItem') {
//                             _submitDataReport.push(data)
//                             if (data.result === true) {
//                                 this.logService.log(`item updated`, this.utilsService.infoStatus, true); 
//                             } else {
//                                 this.logService.log(`failed to update item`, this.utilsService.errorStatus, true);
//                             }
//                     }
                                                
//                 },
//                 err => {
//                     this.logService.log(`error calling api`, this.utilsService.infoStatus, true);
//                     this.logService.log(err, this.utilsService.infoStatus, true);
//                     //need to notify user that save data failed!!!!

//                     observer.complete()
//                 },
//                 () => {
//                     this.logService.log('ending submit data function', this.utilsService.infoStatus, true);
//                     this.healthReportSerivce.submitDataReport = _submitDataReport;
                    
//                     //commint updated results to history
//                     this.addToHistory();
//                     observer.complete()
//                 }
//             )
//         })
//         return submit$
// }

    // public prepDataForApi(data:Array<Object>, listName) {
    //     //data Arry
    //     console.log('PREP DATA FOR API')
    //     let _observableArrary = []
    //     if (Array.isArray(data)) {
            
    //         for (let i in data) {
    //             if(data[i].hasOwnProperty('State') && data[i]['State']==this.utilsService.createState) {
    //                 let fieldArray = this.createFieldArray(data[i]);
    //                 _observableArrary.push(this.commonApiService.addItem(listName, this.utilsService.hostWeb, fieldArray))
    //             } else if (data[i].hasOwnProperty('State') && data[i]['State'] == this.utilsService.deleteState) {
    //                 _observableArrary.push(this.commonApiService.deleteItem(listName, data[i]['ItemId'], this.utilsService.hostWeb))
    //             } else if (data[i].hasOwnProperty('State') && data[i]['State'] == this.utilsService.updateState) {
    //                 let fieldsArray = this.createFieldArray(data[i]);
    //                 _observableArrary.push(this.commonApiService.updateItem(listName, this.utilsService.hostWeb, data[i]['ItemId'], fieldsArray))
    //             } else if (data[i].hasOwnProperty('State') && data[i]['State'] == this.utilsService.inertState) {
    //                 this.logService.log(`item flagged as intert, saving item not required`, this.utilsService.infoStatus, true)
    //             }
    //         }
    //         return _observableArrary;
    //     }
    // }

    updateStateAfterApiCall(listName, itemId, apiCall):Observable<any> {
        let updateState$ = new Observable((observer:Observer<any>) => {
            let _listName:string = '' 
            
            switch(listName) {
                case this.utilsService.financeAppResourceData:
                    _listName = '_ResourceData'
                break;
                case this.utilsService.financeAppMaterialData:
                    _listName = '_MaterialData'
                break;
                case this.utilsService.financeAppTotalsData:
                    _listName = '_TotalData'
                break;
            }

            try {
                let indexValue = this[_listName].findIndex(element => {
                    return element['ItemId'] == itemId
                })

                this[_listName][indexValue]['State'] = 'inert'

                observer.next({
                    functionCall:'updateStateAfterApiCall',
                    result: 'complete'
                })
            } catch (e) {
                this.logService.log(`failed to update state of listitem in list ${listName} with id ${itemId}`, 
                            this.utilsService.errorStatus, 
                            false)
            }

            ///need to handle the scenario where an element has been created and deleted and user attempts to select 'undo' how do we track this.
            try {
                switch(apiCall) {
                    case this.utilsService.apiCallAddItem:
                        this.historyService.addCreatedEntry(itemId)
                    break;
                    case this.utilsService.apiCallDeleteItem:
                        this.historyService.addDeletedEntry(itemId)
                    break;
                    case this.utilsService.apiCallUpdateItem:
                        //do nothing
                    break;
                }
            } catch (e) {
                this.logService.log(`failed to the history array of listitem in list ${listName} with id ${itemId}`, 
                            this.utilsService.errorStatus, 
                            false)
            }

            observer.complete()
            })

            return updateState$

        
    }

    // createFieldArray(item){
    //     //create fields array
    //     let _fieldArray:Array<IItemPropertyModel> = []
    //     for (let property in item) {
    //         if (item.hasOwnProperty(property) &&
    //             property !== 'FieldValue' &&
    //             property !== 'ItemId') {
    //             _fieldArray.push({
    //                 fieldName: property,
    //                 fieldValue: item[property]
    //             })
    //         }

    //     }
    //     return _fieldArray   
    // } 


    getResourceDataStream(): Observable<any> {
        let filteredResourceDataStream = this.resourceDataStream.asObservable().map((data, index) => {
            return data.filter((row:any)=> row.State !== 'delete' && row.Year === this._year)
        })
        return filteredResourceDataStream
    }

    getTotalDataStream(): Observable<any> {
        let filteredTotalDataStream = this.totalDataStream.asObservable().map((data, index) => {
            return data.filter((row:any) => row.State !== 'delete' && row.Year === this._year)
        })
        return filteredTotalDataStream
    }

    getMaterialDataStream(): Observable<any> {
        let filteredMaterialDataStream = this.materialDataStream.asObservable().map((data,index) => {
            return data.filter((row:any) => row.State !== 'delete' && row.Year === this._year)
        })
        return filteredMaterialDataStream
    }

    getData(): void  {
        this.calcResourceValues()
        this.calcMaterialValues()
        this.calcTotalValues()
        this.resourceDataStream.next(this._ResourceData);
        this.totalDataStream.next(this._TotalData);
        this.materialDataStream.next(this._MaterialData);
    }

    updateTable(event: any): Observable<any> {
        let updateTable$ = new Observable((observer: Observer<any>) => {
            console.log(event);
            let objectId, columnName, newValue, oldValue, indexValue, listName, tableName;
            
            if (event.data
                && event.hasOwnProperty('colDef')
                && event.hasOwnProperty('newValue')
                && event.hasOwnProperty('oldValue')
                && event.data.hasOwnProperty('ItemId')
                && event.colDef.hasOwnProperty('field')
                && event.data.hasOwnProperty('ListName')
                ) {
                    //get data
                    objectId = event.data.ItemId;
                    columnName = event.colDef.field;
                    newValue = event.newValue;
                    listName = event.data.ListName;
                    oldValue = event.oldValue
            } else {
                this.logService.log('updateTable Error: required data items in updated row not found', this.utilsService.errorStatus, false)
                ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                observer.complete()
                return
            }

            if (!Number(newValue)) {
                this.logService.log(`updateTable Error: Type error cannot convert newValue to number`, this.utilsService.errorStatus, false);
                ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                observer.complete();
                return
            } else {
                newValue = +newValue
            }

            if (newValue == oldValue) {
                this.logService.log('new value equals old value', this.utilsService.infoStatus, true);
                observer.complete()
                return
            }

            switch(listName) {
                case this.utilsService.financeAppResourceData:
                    tableName = '_ResourceData'
                    try {
                        //find index Value in Data Object
                        indexValue = this.findResourceIndex(objectId);
                    } catch (e) {
                        this.logService.log(e, this.utilsService.errorStatus, false);
                        ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                        this.logService.log(`updateTable Error: unable to determine the ItemId 
                                            of the affected object, update table failed`, this.utilsService.errorStatus, false);
                        observer.complete();
                        return
                    }                    
                break;
                case this.utilsService.financeAppMaterialData:
                    tableName = '_MaterialData'
                    try {
                        //find index Value in Data Object
                        indexValue = this.findMaterialIndex(objectId);
                    } catch (e) {
                        this.logService.log(e, this.utilsService.errorStatus, false);
                        ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                        this.logService.log(`updateTable Error: unable to determine the ItemId 
                                            of the affected object, update table failed`, this.utilsService.errorStatus, false);
                        observer.complete();
                        return
                    }
                break;
                default:
                    observer.complete()
                    return
            }

            if (indexValue < 0) {
                this.logService.log(`updateTable Error: can't find indexValue`, this.utilsService.errorStatus, false);
                ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                observer.complete();
                return
            }   

            if (this[tableName] &&
                this[tableName].hasOwnProperty(indexValue) &&
                this[tableName][indexValue].hasOwnProperty(columnName)) {
                    //convert number strings to numbers
                    //update Data object
                    try {
                        this[tableName][indexValue][columnName] = newValue;
                    } catch (e) {
                        this.logService.log(e, this.utilsService.errorStatus, false)
                        observer.complete();
                        return
                    }
                }
            
            try {
                //update values
                this.updateState(indexValue, 'update', tableName);
                switch (listName) {
                    case this.utilsService.financeAppResourceData:
                        this.calcResourceValues();
                    break;
                    case this.utilsService.financeAppMaterialData:
                        this.calcMaterialValues()
                    break;
                    default:
                        this.logService.log(`UpdateTable Error: unable to determine which data set to refresh`, this.utilsService.errorStatus, false);
                    break;
                }
                
                this.calcTotalValues();

            } catch (e) {
                this.logService.log(e, this.utilsService.errorStatus, false)
                ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                observer.complete()
                return
            }

            try {
                //emit values
                switch (listName) {
                    case this.utilsService.financeAppResourceData:
                        this.resourceDataStream.next(this._ResourceData);
                    break;
                    case this.utilsService.financeAppMaterialData:
                        this.materialDataStream.next(this._MaterialData);
                    break;
                    default:
                        this.logService.log(`UpdateTable Error: unable to determine which data set to refresh`, this.utilsService.errorStatus, false);
                    break;
                }

                this.totalDataStream.next(this._TotalData);
                
            } catch (e) {
                this.logService.log('updateTable Error: error emitting data stream', this.utilsService.errorStatus, false)
                ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            }
            
            try {
                if (this.stateChange && !this.settingsService.autoSave) this.addToHistory()
            } catch (e) {
                this.logService.log('updateTable Error: error updating history stream', this.utilsService.errorStatus, false)
                ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            }
            
            //reset statechange
            this.stateChange = false;

            observer.complete()
        })
        return updateTable$
    }

    addResourceRow(){
        console.log('ADD ROW')
        let _year:number = this._year;
        let _Id:number = this._ResourceData.length + 1;
        let _newRow:IResourceModel = JSON.parse(JSON.stringify(newResourceRow));
        _newRow.Year = _year
        _newRow.ItemId = _Id

        this._ResourceData.push(_newRow)

        //emit values
        this.resourceDataStream.next(this._ResourceData);

        //ONLY USING UNDO REDO WHEN AUTOSAVE DISABLED
        if (!this.settingsService.autoSave) {
            this.addToHistory();
        }
        
        //reset statechange
        this.stateChange = false;        
    }

    addMaterialRow() {
        console.log('ADD MATERIAL ROW')
        let _year: number = this._year;
        let _Id: number = this._MaterialData.length + 1;
        let _newRow:IMatModel = JSON.parse(JSON.stringify(newMaterialRow));
        _newRow.Year = _year;
        _newRow.ItemId = _Id;

        this._MaterialData.push(_newRow)

        //emit vlaues
        this.materialDataStream.next(this._MaterialData);

        //ONLY USING UNDO REDO WHEN AUTOSAVE DISABLED
        if (!this.settingsService.autoSave) {
            this.addToHistory();
        }



        //reset statechange
        this.stateChange = false
    }

    deleteMaterialRow(id: number){
        let indexValue: number
        //find Row in Mat Data Object
        indexValue = this.findMaterialIndex(id);


        if(id >= 0 && indexValue >= 0) {
            this.updateState(indexValue, 'delete', '_MaterialData');
        }

        this.calcMaterialValues()
        this.calcTotalValues()

        //emit values
        this.materialDataStream.next(this._MaterialData);
        this.totalDataStream.next(this._TotalData);

        //ONLY USING UNDO REDO WHEN AUTOSAVE DISABLED
        if (!this.settingsService.autoSave) {
            this.addToHistory();
        }

        //reset statechange
        this.stateChange = false;
    }

    deleteResourceRow(id: number){
        let indexValue: number
        //find Row in Data Object
        indexValue = this.findResourceIndex(id);

        if(id >= 0 && indexValue >= 0) {
            this.updateState(indexValue, 'delete','_ResourceData');
            //this.PercentageUtilisedData.splice(indexValue, 1);
        }   
    
        this.calcResourceValues()
        this.calcTotalValues()

        //emit values
        this.resourceDataStream.next(this._ResourceData);
        this.totalDataStream.next(this._TotalData)

        //ONLY USING UNDO REDO WHEN AUTOSAVE DISABLED
        if (!this.settingsService.autoSave) {
            this.addToHistory();
        }
        
        //reset statechange
        this.stateChange = false;
   
    }

    saveUpdates(){
        //to be replaced by commonApiService calls
        //this.coreService.saveChanges(this._ResourceData)
    }

    findResourceIndex(objectId: number) {
       return this._ResourceData.findIndex((element:any):any => {
                    return element.ItemId == +objectId
                })       
    }

    findMaterialIndex(objectId: number) {
       return this._MaterialData.findIndex((element:any):any => {
                    return element.ItemId == +objectId
                })       
    }    

    findTotalsIndex(year: number) {
        //what if this row dows not exist?
       return this._TotalData.findIndex((element:any):any => {
                    return element.Year == +year
                });
    }

    undo(){
        if (this.historyService.canUndo) {
            let _data = this.historyService.undo()
            
            this._ResourceData = JSON.parse(JSON.stringify(_data.resourceData));
            this._MaterialData = JSON.parse(JSON.stringify(_data.materialData));
            this._TotalData = JSON.parse(JSON.stringify(_data.totalData));

            //validate state of items is correct
            this.validateAppDataState('_ResourceData');
            this.validateAppDataState('_MaterialData');

            //emit
            this.resourceDataStream.next(this._ResourceData);
            this.materialDataStream.next(this._MaterialData);
            this.totalDataStream.next(this._TotalData);
        }
    }

    redo(){
        if (this.historyService.canRedo) {
            let _data = this.historyService.redo()

            //validate state of items is correct
            this.validateAppDataState('_ResourceData');
            this.validateAppDataState('_MaterialData');

            this._ResourceData = JSON.parse(JSON.stringify(_data.resourceData));
            this._MaterialData = JSON.parse(JSON.stringify(_data.materialData));
            this._TotalData = JSON.parse(JSON.stringify(_data.totalData));

            //validate state of items is correct

            //emit
            this.resourceDataStream.next(this._ResourceData);
            this.materialDataStream.next(this._MaterialData);
            this.totalDataStream.next(this._TotalData);
        }
    }

    addToHistory(){
        this.historyService.addEntry(this._ResourceData, this._MaterialData, this._TotalData);
   }

    calcResourceValues(){
        console.log('CALCULATE RESOURCE VALUES')
        //reset context
        // this.resetCtxObject()
        this.resetHighlights('_ResourceData');

        let filteredResourceYearData

        //filter on current year and delete
        try {
            filteredResourceYearData = this._ResourceData.filter((row)=>{
                return row.Year === this._year && row.State !== 'delete';
            })
        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
        }


        //process calculated fields
        filteredResourceYearData.forEach((rowItem, index, array) => {
            let indexValue = this.findResourceIndex(rowItem.ItemId);
            //PUForecast
            let updatedPUForecast = this.dataCalcService.puForecast(rowItem);
            this.checkCalcValue2(rowItem, 'PUForecast',updatedPUForecast, indexValue);
            //AHTotalHours
            let updatedAHTotalHours = this.dataCalcService.ahTotalHours(rowItem);
            this.checkCalcValue2(rowItem, 'AHTotalHours',updatedAHTotalHours, indexValue);
            //UpdatedPRJan
            let updatedPRJan = this.dataCalcService.prMonth(rowItem, 'January');
            this.checkCalcValue2(rowItem, 'PRJan',updatedPRJan, indexValue);
            //UpdatedPRFeb
            let updatedPRFeb = this.dataCalcService.prMonth(rowItem, 'Febuary');
            this.checkCalcValue2(rowItem, 'PRFeb',updatedPRFeb, indexValue);
            //UpdatedPRMar
            let updatedPRMar = this.dataCalcService.prMonth(rowItem, 'March');
            this.checkCalcValue2(rowItem, 'PRMar',updatedPRMar, indexValue);
            //UpdatedPRApr
            let updatedPRApr = this.dataCalcService.prMonth(rowItem, 'April');
            this.checkCalcValue2(rowItem, 'PRApr', updatedPRApr, indexValue);
            //UpdatedPRMay
            let updatedPRMay = this.dataCalcService.prMonth(rowItem, 'May');
            this.checkCalcValue2(rowItem, 'PRMay', updatedPRMay, indexValue); 
            //UpdatedPRJun
            let updatedPRJun = this.dataCalcService.prMonth(rowItem, 'June');
            this.checkCalcValue2(rowItem, 'PRJun', updatedPRJun, indexValue);
            //UpdatedPRJul
            let updatedPRJul = this.dataCalcService.prMonth(rowItem, 'July');
            this.checkCalcValue2(rowItem, 'PRJul', updatedPRJul, indexValue);
            //UpdatedPRAug
            let updatedPRAug = this.dataCalcService.prMonth(rowItem, 'August');
            this.checkCalcValue2(rowItem, 'PRAug', updatedPRAug, indexValue); 
            //UpdatedPRSep
            let updatedPRSep = this.dataCalcService.prMonth(rowItem, 'September');
            this.checkCalcValue2(rowItem, 'PRSep', updatedPRSep, indexValue);
            //UpdatedPROct
            let updatedPROct = this.dataCalcService.prMonth(rowItem, 'October');
            this.checkCalcValue2(rowItem, 'PROct', updatedPROct, indexValue);
            //UpdatedPRNov
            let updatedPRNov = this.dataCalcService.prMonth(rowItem, 'November');
            this.checkCalcValue2(rowItem, 'PRNov', updatedPRNov, indexValue);
            //UpdatedPRDec
            let updatedPRDec = this.dataCalcService.prMonth(rowItem, 'December');
            this.checkCalcValue2(rowItem, 'PRDec', updatedPRDec, indexValue);
            //UpdatedPRDec
            let updatedPRYtdTotal = this.dataCalcService.prYtdTotal(rowItem);
            this.checkCalcValue2(rowItem, 'PRYtdTotal', updatedPRYtdTotal, indexValue);
            //Lbe Value
            let updatedPRLbe = this.dataCalcService.prLbe(rowItem);
            this.checkCalcValue2(rowItem, 'PRLbe', updatedPRLbe, indexValue);
            //Ytd Variance to Budget
            let updatedPRYtdVarianceToBudget = this.dataCalcService.prYtdVarianceToBudget(rowItem);
            this.checkCalcValue2(rowItem, 'PRYtdVarianceToBudget', updatedPRYtdVarianceToBudget, indexValue);            
            //Forecasted Ytd Variance to Budget
            let updatedPRForecastVarianceToBudget = this.dataCalcService.prForecastVarianceToBudget(rowItem);
            this.checkCalcValue2(rowItem, 'PRForecastVarianceToBudget', updatedPRForecastVarianceToBudget, indexValue);
            //TSJan
            let updatedTSJan = this.dataCalcService.tsMonth(rowItem, 'January');
            this.checkCalcValue2(rowItem, 'TSJan', updatedTSJan, indexValue);  
            //TSFeb
            let updatedTSFeb = this.dataCalcService.tsMonth(rowItem, 'Febuary');
            this.checkCalcValue2(rowItem, 'TSFeb', updatedTSFeb, indexValue);
            //TSMar
            let updatedTSMar = this.dataCalcService.tsMonth(rowItem, 'March');
            this.checkCalcValue2(rowItem, 'TSMar', updatedTSMar, indexValue);
            //TSApr
            let updatedTSApr = this.dataCalcService.tsMonth(rowItem, 'April');
            this.checkCalcValue2(rowItem, 'TSApr', updatedTSApr, indexValue);
            //TSMay
            let updatedTSMay = this.dataCalcService.tsMonth(rowItem, 'May');
            this.checkCalcValue2(rowItem, 'TSMay', updatedTSMay, indexValue);
            //TSJune
            let updatedTSJun = this.dataCalcService.tsMonth(rowItem, 'June');
            this.checkCalcValue2(rowItem, 'TSJun', updatedTSJun, indexValue);
            //TSJuly
            let updatedTSJul = this.dataCalcService.tsMonth(rowItem, 'July');
            this.checkCalcValue2(rowItem, 'TSJul', updatedTSJul, indexValue);
            //TSAugust
            let updatedTSAug = this.dataCalcService.tsMonth(rowItem, 'August');
            this.checkCalcValue2(rowItem, 'TSAug', updatedTSAug, indexValue);
            //TSSeptember
            let updatedTSSep = this.dataCalcService.tsMonth(rowItem, 'September');
            this.checkCalcValue2(rowItem, 'TSSep', updatedTSSep, indexValue);
            //TSOctober
            let updatedTSOct = this.dataCalcService.tsMonth(rowItem, 'October');
            this.checkCalcValue2(rowItem, 'TSOct', updatedTSOct, indexValue);
            //TSNovember
            let updatedTSNov = this.dataCalcService.tsMonth(rowItem, 'November');
            this.checkCalcValue2(rowItem, 'TSNov', updatedTSNov, indexValue);
            //TSDecember
            let updatedTSDec = this.dataCalcService.tsMonth(rowItem, 'December');
            this.checkCalcValue2(rowItem, 'TSDec', updatedTSDec, indexValue);                        
            //TS Forecast
            let updatedTSForecast = this.dataCalcService.tsForecast(rowItem);
            this.checkCalcValue2(rowItem, 'TSForecast', updatedTSForecast, indexValue);
            //ATS YTD Total
            let updatedATSYtdTotal = this.dataCalcService.atsYtdTotal(rowItem);
            this.checkCalcValue2(rowItem, 'ATSYtdTotal', updatedATSYtdTotal, indexValue);
            //RTS Jan
            let updatedRTSJan = this.dataCalcService.rtsMonth(rowItem, 'January');
            this.checkCalcValue2(rowItem, 'RTSJan', updatedRTSJan, indexValue); 
            //RTS Feb
            let updatedRTSFeb = this.dataCalcService.rtsMonth(rowItem, 'Febuary');
            this.checkCalcValue2(rowItem, 'RTSFeb', updatedRTSFeb, indexValue); 
            //RTS March
            let updatedRTSMar = this.dataCalcService.rtsMonth(rowItem, 'March');
            this.checkCalcValue2(rowItem, 'RTSMar', updatedRTSMar, indexValue);
            //RTS April
            let updatedRTSApr = this.dataCalcService.rtsMonth(rowItem, 'April');
            this.checkCalcValue2(rowItem, 'RTSApr', updatedRTSApr, indexValue);
            //RTS May
            let updatedRTSMay = this.dataCalcService.rtsMonth(rowItem, 'May');
            this.checkCalcValue2(rowItem, 'RTSMay', updatedRTSMay, indexValue); 
            //RTS Jun
            let updatedRTSJun = this.dataCalcService.rtsMonth(rowItem, 'June');
            this.checkCalcValue2(rowItem, 'RTSJun', updatedRTSJun, indexValue);
            //RTS July
            let updatedRTSJul = this.dataCalcService.rtsMonth(rowItem, 'July');
            this.checkCalcValue2(rowItem, 'RTSJul', updatedRTSJul, indexValue);
            //RTS August
            let updatedRTSAug = this.dataCalcService.rtsMonth(rowItem, 'August');
            this.checkCalcValue2(rowItem, 'RTSAug', updatedRTSAug, indexValue);
            //RTS September
            let updatedRTSSep = this.dataCalcService.rtsMonth(rowItem, 'September');
            this.checkCalcValue2(rowItem, 'RTSSep', updatedRTSSep, indexValue);
            //RTS October
            let updatedRTSOct = this.dataCalcService.rtsMonth(rowItem, 'October');
            this.checkCalcValue2(rowItem, 'RTSOct', updatedRTSOct, indexValue);
            //RTS November
            let updatedRTSNov = this.dataCalcService.rtsMonth(rowItem, 'November');
            this.checkCalcValue2(rowItem, 'RTSNov', updatedRTSNov, indexValue); 
            //RTS December
            let updatedRTSDec = this.dataCalcService.rtsMonth(rowItem, 'December');
            this.checkCalcValue2(rowItem, 'RTSDec', updatedRTSDec, indexValue);
            //RTS YTD Total
            let updatedRTSYtdTotal = this.dataCalcService.rtsYtdTotal(rowItem);
            this.checkCalcValue2(rowItem, 'RTSYtdTotal', updatedRTSYtdTotal, indexValue);
            //RTS Lbe
            let updatedRTSLbe = this.dataCalcService.rtsLbe(rowItem);
            this.checkCalcValue2(rowItem, 'RTSLbe', updatedRTSLbe, indexValue);
            //RTS YTD Variance to Budget
            let updatedRTSYtdVarianceToBudget = this.dataCalcService.rtsYtdVarianceToBudget(rowItem);
            this.checkCalcValue2(rowItem, 'RTSYtdVarianceToBudget', updatedRTSYtdVarianceToBudget, indexValue);
            //RTS Variance to Budget
            let updatedRTSVarianceToBudget = this.dataCalcService.rtsVarianceToBudget(rowItem);
            this.checkCalcValue2(rowItem, 'RTSVarianceToBudget', updatedRTSVarianceToBudget, indexValue);
                    
        });


    }

    calcMaterialValues(){
        console.log('CALCUALTE MATERIAL VALUES')
        //reset context
        // this.resetCtxObject()
        let tableName = '_MaterialData'
        this.resetHighlights(tableName);

        let filteredMaterialYearData;

        //filter on current year and delete
        try {
            filteredMaterialYearData = this._MaterialData.filter((row)=>{
                return row.Year === this._year && row.State !== 'delete';
            })

        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
        }


        //process calculated fields
        filteredMaterialYearData.forEach((rowItem, index, array) => {
            
            let indexValue

            if (rowItem.hasOwnProperty('ItemId')) {
                indexValue = this.findMaterialIndex(rowItem.ItemId);
            } else {
                this.logService.log(`cannot locate ID property in Material 
                                    list row item, unable to process Material data`, this.utilsService.errorStatus, false)
            }

            try {
                let rowId = this._MaterialData[indexValue].ItemId;
                //Mat Ytd Total
                let updatedMatYtdTotal = this.dataCalcService.matYtdTotal(rowItem);
                this.checkCalcValue(rowId, 'MatYtdTotal', updatedMatYtdTotal, indexValue, tableName);
                //Mat Lbe
                let updatedMatLbe = this.dataCalcService.matLbe(rowItem);
                this.checkCalcValue(rowId, 'MatLbe', updatedMatLbe, indexValue, tableName); 
                //MatYtdVarianceToBudget
                let updatedMatYtdVarianceToBudget = this.dataCalcService.matYtdVarianceToBudget(rowItem);
                this.checkCalcValue(rowId, 'MatYtdVarianceToBudget', updatedMatYtdVarianceToBudget, indexValue, tableName);
                //MatVarianceToBudget
                let updatedMatVarianceToBudget = this.dataCalcService.matForecastVarianceToBudget(rowItem);
                this.checkCalcValue(rowId, 'MatVarianceToBudget', updatedMatVarianceToBudget, indexValue, tableName);
            } catch (e) {
                this.logService.log(e, this.utilsService.errorStatus, false);
            }
            
        });
    }

    calcTotalValues(){
        console.log('CALCULATE TOTAL VALUES')

        let filteredResourceYearData, 
            filteredMaterialYearData,
            filteredTotalYearData,
            indexValue,
            totalRowId,
            sumResourceArray,
            sumMaterialArray,
            sumTotalsArray;
        //Reset Highlights
        this.resetHighlights('_TotalData');
        //filter on current year and delete
        try {
            filteredResourceYearData = this._ResourceData.filter((row)=>{
                return row.Year === this._year && row.State !== 'delete';
            })
            filteredMaterialYearData = this._MaterialData.filter((row)=>{
                return row.Year === this._year && row.State !== 'delete';
            })
            console.error(filteredMaterialYearData)

        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
        }

        //what if this row dows not exist?
        indexValue = this.findTotalsIndex(this._year);

        totalRowId = this._TotalData[indexValue].ItemId;

        sumResourceArray = [
            'PRBudget',
            'PRJan',
            'PRFeb',
            'PRMar',
            'PRApr',
            'PRMay',
            'PRJun',
            'PRJul',
            'PRAug',
            'PRSep',
            'PROct',
            'PRNov',
            'PRDec',
            'PRYtdTotal',
            'PRLbe',
            'PRYtdVarianceToBudget',
            'PRForecastVarianceToBudget',
            'RTSBudget',
            'RTSJan',
            'RTSFeb',
            'RTSMar',
            'RTSApr',
            'RTSMay',
            'RTSJun',
            'RTSJul',
            'RTSAug',
            'RTSSep',
            'RTSOct',
            'RTSNov',
            'RTSDec',
            'RTSYtdTotal',
            'RTSLbe',
            'RTSYtdVarianceToBudget',
            'RTSVarianceToBudget',
        ]

        sumMaterialArray =[
            'MatBudget',
            'MatJan',
            'MatFeb',
            'MatMar',
            'MatApr',
            'MatMay',
            'MatJun',
            'MatJul',
            'MatAug',
            'MatSep',
            'MatOct',
            'MatNov',
            'MatDec',
            'MatYtdTotal',
            'MatLbe',
            'MatYtdVarianceToBudget',
            'MatForecastVarianceToBudget'            
        ]

        sumTotalsArray = [
            'TProjectBudget',
            'TJan',
            'TFeb',
            'TMar',
            'TApr',
            'TMay',
            'TJun',
            'TJul',
            'TAug',
            'TSep',
            'TOct',
            'TNov',
            'TDec',
            'TYtdTotal',
            'TLbe',
            'TYtdVarianceToBudget',
            'TVarianceToBudget'
        ]

        sumResourceArray.forEach((fieldName)=>{
            let calculatedValue = this.dataCalcService.sumResourceTotal(filteredResourceYearData, fieldName);
            this.checkCalcValue(totalRowId, fieldName, calculatedValue, indexValue, '_TotalData');
        })
        sumMaterialArray.forEach((fieldName)=>{
            let calculatedValue = this.dataCalcService.sumResourceTotal(filteredMaterialYearData, fieldName);
            this.checkCalcValue(totalRowId, fieldName, calculatedValue, indexValue, '_TotalData');
        })

        //After running calculations for totals get filteredYearData to calculate sum totals

        try {
            filteredTotalYearData = this._TotalData.filter((row)=>{
                return row.Year === this._year;
            })
        } catch(e) {
            this.logService.log(e, this.utilsService.errorStatus, false)
        }

        //filteredTotalYearData should be an array of length one as there should only be 1 total row for each year
        if (filteredTotalYearData.length !== 1) {
            this.logService.log(`error looking up total year result set, 
                                unable to run calcuations for totals`, this.utilsService.errorStatus, false);
            return
        }

        // calculate the sum totals
        sumTotalsArray.forEach((fieldName)=>{
            let calculatedValue = this.dataCalcService.sumTotal(filteredTotalYearData[0], fieldName);
            this.checkCalcValue(totalRowId, fieldName, calculatedValue, indexValue, '_TotalData');
        })


    }

    checkCalcValue(ItemId: number, field:string, updatedValue:number, indexValue:number, tableName:string){
        if (indexValue>=0 && 
            this.hasOwnProperty(tableName) &&
            this[tableName].hasOwnProperty(indexValue) &&
            this[tableName][indexValue].hasOwnProperty(field) &&
            this[tableName][indexValue][field] !== Number(updatedValue)) {
            
            // update the table with the new value
            this[tableName][indexValue][field] = Number(updatedValue)

            // update state of row
            this.updateState(indexValue, 'update', tableName);

            // add highlight 
            this.markChange(indexValue, ItemId, field, tableName)
        }
    }

    //to be replaced by above generic function
    checkCalcValue2(rowItem: any,
                   field: string, 
                   calcValue: number, 
                   indexValue: number){
            if (indexValue>=0 && rowItem[field] !== calcValue) {
                rowItem[field] = calcValue
                this.updateState(indexValue, 'update','_ResourceData')
                this.markChange(indexValue, rowItem.ItemId, field, '_ResourceData');
            } 

    }
    resetHighlights(tableName: string){
        if (this.hasOwnProperty(tableName) &&
            this[tableName].length > 0){
            this[tableName].forEach((rowData:any)=> {
                rowData.Highlights = [];
            })   
        }
        return        
    }

    updateState(indexId: number, state: string, tableName: string){
        let currentState
        this.stateChange = true;

        if (this[tableName] &&
            this[tableName][indexId]) {        
                currentState = this[tableName][indexId]['State'];
        } else {
            this.logService.log(`updateSate Error: unable to locate tableName or indexId`, this.utilsService.errorStatus, false);
        }
        console.log('currentState', currentState)
        console.log('state', state)
        //don't mark newly created items as update
        if (currentState == 'create' && state == 'update') {
            //do nothing
        } else {
            console.log('UPDATING STATE TO: ', state)
             this[tableName][indexId]['State'] = state;
        }

        return
    }

    markChange(indexValue:number, objId: number, fieldName: string, tableName: string){
        let highlight:any = {
            ItemId: objId,
            fieldName: fieldName
        }
        //this._ResourceData[indexValue]['Highlights'].push(highlight)
        this[tableName][indexValue]['Highlights'].push(highlight)
        return
    }

    validateAppDataState(dataSetName) {
        /*
        this function validates the state of items after undo/redo is called.

        if state = update check that item hasn't already been deleted, if yes mark as create instead
        if state = create check that item hasn't already been created, if yes mark as update instead
        if state = delete, check that is hasn't already been deleted, if yes mark as create instead
        */
        
        if (this[dataSetName]) {
            this[dataSetName].forEach(element => {
                if (element['ItemId'] == undefined) {
                    this.logService.log('error identifiying ItemId in validateAppDataState', this.utilsService.errorStatus, false)
                }

                if (element['State'] == undefined) {
                    this.logService.log('error identifiying State in validateAppDataState', this.utilsService.errorStatus, false)
                }

                switch(element['State']) {
                    case 'update':
                        if(this.historyService.checkDeletedEntry(element['ItemId'])) {
                            element['State'] = 'create'
                        }
                    break;
                    case 'create':
                        if(this.historyService.checkAddedEntry(element['ItemId'])) {
                            element['State'] = 'update'
                        }
                    break;
                    case 'delete':
                        if(this.historyService.checkAddedEntry(element['ItemId'])) {
                            element['State'] = 'create'
                        }
                    break;
                }
            })
        }

        return
    }
}