import { Injectable, Inject } from '@angular/core'

//models
import { IResourceModel } from '../model/resource.model'
import { ITotalModel } from '../model/total.model'
import { IMatModel } from '../model/material.model'
import { ISummaryModel } from '../model/summary.model'
import { ISettings } from '../model/settings.model'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { IItemPropertyModel,
        IUpdateItemResult,
        IDeleteItemResult } from '../model/data-validation.model'

import { CommonApiService } from './api-common.service'
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
import { newSummaryDataRow } from '../config/new-summary'

const newResourceRow:IResourceModel = newDataRow;
const newMaterialRow:IMatModel = newMaterialDataRow;
const newTotalRow: ITotalModel = newTotalDataRow
const newSummaryRow: ISummaryModel = newSummaryDataRow;


@Injectable()
export class DataContextService {
    private obs: Observable<any>
    private resourceDataStream: Subject<any> = new Subject();
    private totalDataStream: Subject<any> = new Subject();
    private materialDataStream: Subject<any> = new Subject();
    private summaryDataStream: Subject<any> = new Subject();

    private resourceContextStream: Subject<any> = new Subject();
    private totalContextStream: Subject<any> = new Subject();
    private materialContextStream: Subject<any> = new Subject();
    private summaryContextStream: Subject<any> = new Subject();

    private _ResourceData:IResourceModel[]
    private _TotalData:ITotalModel[]
    private _MaterialData: IMatModel[]
    private _SummaryData: ISummaryModel[]
    private _ResourceDataName: string
    private _MaterialDataName: string
    private _TotalDataName: string
    private _SummaryDataName: string

    constructor(private commonApiService: CommonApiService,
                private dataCalcService: DataCalcService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private logService: LogService,
                private healthReportSerivce: HealthReportService,
                private listService: ListService){
                    this.init();

                }
    
    init(){
        //get the names of the tables
        this._ResourceDataName = this.utilsService.resourceDataSetName
        this._MaterialDataName = this.utilsService.materialDataSetname
        this._TotalDataName = this.utilsService.totalDataSetName
        this._SummaryDataName = this.utilsService.summaryDataSetName

        //create data objects
        this._ResourceData = new Array();
        this._MaterialData = new Array();
        this._TotalData = new Array();
        this._SummaryData = new Array();

        //process calculated fields to make sure data is correct
        //cannot do this until data has been loaded into cache

        //if not sharepoint mode need to add dummy data
        if(!this.settingsService.sharePointMode) {
            console.log('application not running in SharePoint Mode, creating cached data')
            this.addDataToTable(this.utilsService.financeAppResourceData,
                            this.createPlaceholderObject(this.utilsService.financeAppResourceData))
            this.addDataToTable(this.utilsService.financeAppMaterialData,
                            this.createPlaceholderObject(this.utilsService.financeAppMaterialData))                            
            this.addDataToTable(this.utilsService.financeAppTotalsData,
                            this.createPlaceholderObject(this.utilsService.financeAppTotalsData))
            this.addDataToTable(this.utilsService.financeAppSummaryData,
                            this.createPlaceholderObject(this.utilsService.financeAppSummaryData))
            
            this.calcResourceValues()
            this.calcMaterialValues()
            this.calcSummaryValues()            
            this.calcTotalValues()
        }

    }

    getResourceDataStream(): Observable<any> {
        let filteredResourceDataStream = this.resourceDataStream.asObservable().map((data, index) => {
            return data.filter((row:any)=> row.State !== this.utilsService.deleteState && row.Year === this.settingsService.year)
        })
        return filteredResourceDataStream
    }

    getTotalDataStream(): Observable<any> {
        let filteredTotalDataStream = this.totalDataStream.asObservable().map((data, index) => {
            return data.filter((row:any) => row.State !== this.utilsService.deleteState && row.Year === this.settingsService.year)
        })
        return filteredTotalDataStream
    }

    getMaterialDataStream(): Observable<any> {
        let filteredMaterialDataStream = this.materialDataStream.asObservable().map((data,index) => {
            return data.filter((row:any) => row.State !== this.utilsService.deleteState && row.Year === this.settingsService.year)
        })
        return filteredMaterialDataStream
    }

    getSummaryDataStream(): Observable<any> {
        let filteredSummaryDataStream = this.summaryDataStream.asObservable().map((data,index) => {
            return data.filter((row:any) => row.State !== this.utilsService.deleteState && row.Year === this.settingsService.year)
        })
        return filteredSummaryDataStream
    }

    getResourceContextStream(): Observable<any> {
        return this.resourceContextStream.asObservable()
    }

    getMaterialContextStream():Observable<any> {
        return this.materialContextStream.asObservable()
    }

    getTotalContextStream():Observable<any> {
        return this.totalContextStream.asObservable()
    }

    getSummaryContextStream():Observable<any> {
        return this.summaryContextStream.asObservable()
    }


processListData(data:Array<Object>, listName: string):Observable<any> {

    this.logService.log(`Process List Data Function called for list: ${listName}`, this.utilsService.infoStatus, false);

    let listData$ = new Observable((observer:Observer<any>) => {

        //need to pull out the field names from list spec and put them into array
        let fieldNameArray = this.listService.getArrayFieldNames(listName);

        if (data.length>0) {

            data.forEach(item => {
                //set base template of item and update internal field values
                let _item = this.createPlaceholderObject(listName)

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

                //process ID value, This value is not stored as part of the list definition so it
                //needs to be handled seperately
                if(item.hasOwnProperty('ID')) {
                        Object.defineProperty(_item, 'ID', {
                            value: item['ID'],
                            writable: true
                        })
                } else {
                    this.logService.log(`processListData error: unable to update ID for item, cannot find property on list: ${listName}`, this.utilsService.errorStatus, false)
                }

                //process State value, this needs to be updated to inert as its an existing item
                console.log(`updating state for item on list: ${listName}`)
                Object.defineProperty(_item, 'State', {
                    value: this.utilsService.inertState,
                    writable: true
                })
                
                // add item array to correct table
                this.addDataToTable(listName, _item)
            })

            observer.next({
                functionCall: 'processListData',
                result: true,
                listName: listName
            })

            observer.next({
                reportHeading: 'processListData',
                result: this.utilsService.successStatus,
                listName: listName,
                numberItems: data.length
            })

        } else {


            let _msg = `no data found for listName ${listName}, need to create placeholder data`
            this.logService.log(_msg, this.utilsService.infoStatus, false)
            observer.next({
                functionCall: 'processListData',
                listName: listName,
                message: _msg
            })            
            
            observer.next({
                functionCall: 'processListData',
                result: false,
                listName: listName,
                resultLength: 0,
            })
        }

        observer.complete()
    })

    return listData$

}

    createPlaceholderObject(listName) {
        let _item = new Object();
        let _itemId = this.utilsService.generateItemId()
        switch (listName) {
            case this.utilsService.financeAppMaterialData:
                _item = JSON.parse(JSON.stringify(newMaterialRow))
                _item['State'] = 'create'
                _item['Highlights'] = [];
                _item['ListName'] = listName;
                _item['Year'] = this.settingsService.year;
                _item['ItemId'] = _itemId;
                //temporarily assign itemid as ID until object is saved
                _item['ID'] = _itemId;
            break;
            case this.utilsService.financeAppResourceData:
                _item = JSON.parse(JSON.stringify(newResourceRow))
                _item['State'] = 'create'
                _item['Highlights'] = [];
                _item['ListName'] = listName;
                _item['Year'] = this.settingsService.year;
                _item['ItemId'] = _itemId;
                //temporarily assign itemid as ID until object is saved
                _item['ID'] = _itemId;
            break;
            case this.utilsService.financeAppTotalsData:
                _item = JSON.parse(JSON.stringify(newTotalRow))
                _item['Placeholder1'] = 'TOTAL (Incl Resource Costs)'
                _item['Placeholder4'] = 'Resource Totals'
                _item['Placeholder5'] = 'Resource T&S Totals'
                _item['Placeholder6'] = 'Material Totals'
                _item['State'] = 'create'
                _item['Highlights'] = [];
                _item['ListName'] = listName;
                _item['Year'] = this.settingsService.year;
                _item['ItemId'] = _itemId;
                //temporarily assign itemid as ID until object is saved
                _item['ID'] = _itemId;
            break
            case this.utilsService.financeAppSummaryData:
                _item = JSON.parse(JSON.stringify(newSummaryRow))
                _item['State'] = 'create';
                _item['ListName'] = listName;
                _item['Year'] = this.settingsService.year;
                _item['ItemId'] = _itemId;
                //temporarily assign itemid as ID until object is saved
                _item['ID'] = _itemId;
                //fixed header columns
                _item['CostTitle'] = 'Cost'
                _item['BaselineCostHeader'] = 'Baseline Cost'
                _item['LbeCostHeader'] = 'LBE Cost'
                _item['YtdCostHeader'] = 'YTD - Cost'
                _item['VarianceCostHeader'] = 'Variance'
                _item['GrossTitle'] = 'Finance Benefit (Gross)'
                _item['BaselineGrossHeader'] = 'Baseline Benefit'
                _item['LbeGrossHeader'] = 'LBE Benefit'
                _item['YtdGrossHeader'] = 'YTD - Benefit'
                _item['VarianceGrossHeader'] = 'Variance'
                _item['NetTitle'] = 'Financial Benefit (Net)'
                _item['BaselineNetHeader'] = 'Baseline Benefit'
                _item['LbeNetHeader'] = 'LBE Benefit'
                _item['YtdNetHeader'] = 'YTD - Net Benefit'
                _item['VarianceNetHeader'] = 'Variance'
            break;
            default:
                this.logService.log(`process list data error: unable to determine listName ${listName}, reverting to blank object palceholder`, this.utilsService.errorStatus, false)
            break;
        }

        return _item
    }

emitContextValues(listArray:Array<string>):Observable<any>{
    let emit$ = new Observable((observer:Observer<any>) => {
        if(Array.isArray(listArray)){
        //emit values
        listArray.forEach(listName => {
            try {
                switch (listName) {
                    case this.utilsService.financeAppResourceData:
                        this.resourceContextStream.next(this._ResourceData);
                    break;
                    case this.utilsService.financeAppMaterialData:
                        this.materialContextStream.next(this._MaterialData);
                    break;
                    case this.utilsService.financeAppTotalsData:
                        this.totalContextStream.next(this._TotalData);
                    break;
                    case this.utilsService.financeAppSummaryData:
                        this.summaryContextStream.next(this._SummaryData)
                    break;
                    default:
                        let _msg = `emitContextValues Error: unable to determine which data set to refresh`
                        this.logService.log(_msg, this.utilsService.errorStatus, false);
                        observer.next({
                            reportHeading: 'emitContextValues',
                            reportResult: this.utilsService.failStatus,
                            listName: listName,
                            message: _msg
                        })
                        observer.complete()
                    break;
                }
            } catch (e) {
                let _msg ='Error: error emitting context data stream'
                this.logService.log(_msg, this.utilsService.errorStatus, false)
                observer.next({
                    reportHeading: 'emitContextValues',
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    message: _msg,
                    error: e
                })
                observer.complete()
            }
        })
        


        observer.next({
            functionCall: 'emitContextValues',
            listArray: listArray,
            result: true
        })
        observer.next({
            reportHeading: 'emitContextValues',
            reportResult: this.utilsService.successStatus,
            listArray: listArray,
        })
    } else {
        observer.next({
            reportheading: 'emitContextValues',
            reportResult: this.utilsService.errorStatus,
            message: 'error status: listArray is not of type Array'
        })
    }
    observer.complete()
    })
        
    return emit$

}


    // CreateDummyDataItem(listName:string):Observable<any>{
    //     let dummy$ = new Observable((observer:Observer<any>) => {
            
    //         try {
    //             //no data found for for list, create placeholder data
    //             //set base template of item and update internal field values
    //             let _item = this.createPlaceholderObject(listName)

    //             if (_item && typeof(_item) == 'object') {
    //                 observer.next({
    //                     functionCall: 'CreateDummyDataItem',
    //                     result: true,
    //                     listName: listName,
    //                     item: _item
    //                 })
    //             } else {
    //                 let _msg = `error creating placeholder data for listName ${listName} at function call: addDummyDataItem`
    //                 this.logService.log(_msg, this.utilsService.errorStatus, false)
    //                 observer.next({
    //                     reportHeading: 'CreateDummyDataItem',
    //                     reportResult: this.utilsService.errorStatus,
    //                     message: _msg
    //                 })
    //             }
    //         } catch (e) {
    //             let _msg = `error creating placeholder data for listName ${listName} at function call: addDummyDataItem`
    //             this.logService.log(_msg, this.utilsService.errorStatus, false)
    //             observer.next({
    //                 reportHeading: 'CreateDummyDataItem',
    //                 reportResult: this.utilsService.errorStatus,
    //                 message: _msg
    //             })
    //         }
            


    //         observer.complete()
    //     })
    //     return dummy$
    // }

addDataItemToTable(listName:string, item):Observable<any> {
    let add$ = new Observable((observer:Observer<any>) => {
        try {
            this.addDataToTable(listName, item)

            observer.next({
                functionCall: 'addDataItemToTable',
                result: true,
                listName: listName,
                item: item
            })

            observer.next({
                reportHeading: 'addDataItemToTable',
                reportResult: this.utilsService.successStatus,
                listName: listName,
                item: item
            })
        } catch (e) {
            observer.next({
                reportHeading: 'addDataItemToTable',
                reportResult: this.utilsService.errorStatus,
                message: `error trying to call function addDataToTable from within function addDataItemToTable with listName: ${listName}`,
                error: e
            })
        }

        observer.complete()
        
    })
    return add$
}

    addDataToTable(listName:string, item:any){
        switch (listName) {
            case this.utilsService.financeAppResourceData:
                if(Array.isArray(this._ResourceData)){
                    this._ResourceData.push(item)
                } else {
                    this._ResourceData = new Array();
                    this._ResourceData.push(item)
                }
            break;
            case this.utilsService.financeAppMaterialData:
                if(Array.isArray(this._MaterialData)) {
                    this._MaterialData.push(item)    
                } else {
                    this._MaterialData = new Array();
                    this._MaterialData.push(item)
                }
            break;
            case this.utilsService.financeAppTotalsData:
                if(Array.isArray(this._TotalData)){
                    this._TotalData.push(item)
                } else {
                    this._TotalData = new Array();
                    this._TotalData.push(item)
                }
            break
            case this.utilsService.financeAppSummaryData:
                if(Array.isArray(this._SummaryData)) {
                    this._SummaryData.push(item)
                } else {
                    console.error('ADDING SUMMARY DATA')
                    this._SummaryData = new Array();
                    this._SummaryData.push(item)
                }
            break
            default:
                this.logService.log(`process list data error: unable to determine which dataset to update`, this.utilsService.errorStatus, false)
            break;
        }
    }

    checkForCachedData(listArray: Array<string>, year: number):Observable<any> {
        let check$ = new Observable((observer:any) => {
            if(typeof(year) !== 'number') {
                this.logService.log(`error with year value in functionCall: checkForCachedData; year value captured as: ${year}`, this.utilsService.errorStatus, false)
                observer.complete()
            }

            if(listArray.length > 0) {
                listArray.forEach(listName => {
                    let _tableName:string = null;
                    _tableName = this.getTableName(listName)
                    if(_tableName && this[_tableName] && Array.isArray(this[_tableName])) {
                         let _index:number = null;
                        _index = this[_tableName].findIndex(element => {
                            return element.Year == year
                        })
                        if(_index >= 0){
                            observer.next({
                                functionCall: 'checkForCachedData',
                                listName: listName,
                                result: true,
                                dataExists: true,
                            })
                        } else {
                            observer.next({
                                functionCall:'checkForCachedData',
                                listName: listName,
                                result: true,
                                dataExists: false
                            })

                            observer.next({
                                reportHeading:'checkForCachedData',
                                reportResult: this.utilsService.failStatus,
                                listName: listName,
                                tableName: _tableName,
                                result: false,
                                dataExists: false,
                                message: `failed to find data for ${listName} in functionCall: checkForCachedData`
                            })                            
                        }
                    } else {
                        observer.next({
                            reportHeading:'checkForCachedData',
                            reportResult: this.utilsService.errorStatus,
                            listName: listName,
                            result: false,
                            dataExists: false,
                            message: `failed to find listName ${listName} in functionCall: checkForCachedData`
                        })
                    }
                })
            }

            observer.complete()
        })
        return check$
    }

    clearCache(listArray:Array<string>):Observable<any> {
        let clear$ = new Observable((observer:Observer<any>) => {
            if(Array.isArray(listArray)) {
                listArray.forEach(listName => {
                    let _tableName = this.getTableName(listName)

                    if(_tableName && Array.isArray(this[_tableName])) {
                        this[_tableName] = []

                        observer.next({
                            functionCall: 'clearCache',
                            result: true,
                            listName: listName
                        })

                        observer.next({
                            reportHeading: 'clearCache',
                            result: this.utilsService.successStatus,
                            listName: listName,
                            tableName: _tableName,
                        })
                    } else {
                        this.logService.log(`failed to find tablename for list ${listName}`, this.utilsService.errorStatus, false)
                        observer.next({
                            functionCall: 'clearCache',
                            result: false,
                            listName: listName
                        })

                        observer.next({
                            reportHeading: 'clearCache',
                            result: this.utilsService.failStatus,
                            listName: listName,
                            tableName: _tableName,
                        })                        
                    }
                })
            }

            observer.complete()
        })

        return clear$
    }

    get resourceData(){
        return this._ResourceData
    }   

    get materialData(){
        return this._MaterialData
    }

    get totalsData() {
        return this._TotalData
    }

    get summaryData()  {
        return this._SummaryData
    }

    // updateStateAfterApiCall(listName, ID, apiCall):Observable<any> {
    //     console.log('update state after api call function called')
    //     console.log(listName, ID, apiCall)
    //     let updateState$ = new Observable((observer:Observer<any>) => {
    //         let _tableName:string = this.getTableName(listName) 

    //         try {
    //             let indexValue = this.getItemIndex(ID, _tableName)

    //             this[_tableName][indexValue]['State'] = this.utilsService.inertState

    //             observer.next({
    //                 functionCall:'updateStateAfterApiCall',
    //                 result: 'complete'
    //             })

    //             observer.next({
    //                 reportHeading: 'updateStateAfterApiCall',
    //                 reportResult: this.utilsService.successStatus,
    //                 listName: listName,
    //                 apiCall: apiCall,
    //                 id: ID
    //             })
    //         } catch (e) {
    //             this.logService.log(`failed to update state of listitem in list ${listName} with id ${ID}`, 
    //                         this.utilsService.errorStatus, 
    //                         false)
    //         }

    //         observer.complete()
    //         })

    //         return updateState$
    // }



    // getTab1Data(): void  {
    //     this.calcResourceValues()
    //     this.calcMaterialValues()
    //     this.calcTotalValues()
    //     if(this._ResourceData) {
    //         this.resourceDataStream.next(this._ResourceData);
    //     }

    //     if(this._TotalData) {
    //         this.totalDataStream.next(this._TotalData);
    //     }
        
    //     if(this._MaterialData) {
    //         this.materialDataStream.next(this._MaterialData);
    //     }
    // }

    getSummaryData(): void {
        this.calcTotalValues()
        this.calcSummaryValues()

        if(this._SummaryData) {
            this.summaryDataStream.next(this._SummaryData);
        }
        
        
    }

///////////// Update Table functions

extractProperties(event): Observable<any>{
    let validate$ = new Observable((observer:Observer<any>) => {
        let ID, columnName, newValue, oldValue, indexValue, listName, tableName;
        if (event.data
            && event.hasOwnProperty('colDef')
            && event.hasOwnProperty('newValue')
            && event.hasOwnProperty('oldValue')
            && event.data.hasOwnProperty('ID')
            && event.colDef.hasOwnProperty('field')
            && event.data.hasOwnProperty('ListName')
            ) {
                //get data
                ID = event.data.ID;
                columnName = event.colDef.field;
                newValue = event.newValue;
                listName = event.data.ListName;
                oldValue = event.oldValue

                observer.next({
                    functionCall: 'extractProperties',
                    result: true,
                    data: {
                        ID: ID,
                        columnName: columnName,
                        newValue: newValue,
                        oldvalue: oldValue,
                        listName: listName,
                        tableName: '',
                        indexValue: null,
                    }
                })

                observer.next({
                    reportHeading: 'extractProperties',
                    reportResult: this.utilsService.successStatus,
                    listName: listName
                })
        } else {
            let _msg = 'updateTable Error: required data items in updated row not found'
            this.logService.log(_msg, this.utilsService.errorStatus, false)
            ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            observer.next({
                reportHeading: 'extractProperties',
                reportResult: this.utilsService.failStatus,
                message: _msg
            })
        }

        observer.complete()
    })


    return validate$          

}

preProcessData(data): Observable<any>{
    let process$ = new Observable((observer:Observer<any>) => {
        if (!Number(data.newValue)) {
            let _msg = `updateTable Error: Type error cannot convert newValue to number - ${data.newValue}`
            this.logService.log(_msg, this.utilsService.errorStatus, false);
            ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            observer.next({
                reportHeading: 'preProcessData',
                reportResult: this.utilsService.failStatus,
                message: _msg
            })
        } else {
            data.newValue = +data.newValue
        }

        if (data.newValue == data.oldValue) {
            let _msg = 'new value equals old value: update not required'
            this.logService.log(_msg, this.utilsService.infoStatus, true);
            observer.next({
                reportHeading: 'preProcessData',
                reportResult: this.utilsService.failStatus,
                message: _msg
            })
        } else {
            observer.next({
                functionCall: 'preProcessData',
                listName: data.listName,
                data: data,
                result: true
            })
            observer.next({
                reportHeading: 'preProcesData',
                reportResult: this.utilsService.successStatus,
                listName: data.listName,
                data: data
            })
        }
        observer.complete()

    })

    return process$

}

getTableDetails(listName: string, data: object): Observable<any> {
    let table$ = new Observable((observer:Observer<any>) => {
         let _tableName:string = this.getTableName(listName)
        
        if(_tableName) {
            data['tableName'] = _tableName;
            observer.next({
                functionCall: 'getTableDetails',
                data: data,
                result: true
            })
        } else {
            observer.next({
                functionCall: 'getTableDetails',
                data: data,
                result: false,
                msg: `unable to identify table name for list ${listName}`
            })
        }

        observer.complete()
    })
    return table$    
}

getTableName(listName){
    let tableName = null;
        switch(listName) {
            case this.utilsService.financeAppResourceData:
                tableName = this._ResourceDataName;
            break;
            case this.utilsService.financeAppMaterialData:
                tableName = this._MaterialDataName;
            break;
            case this.utilsService.financeAppSummaryData:
                tableName = this._SummaryDataName;
            break;
            case this.utilsService.financeAppTotalsData:
                tableName = this._TotalDataName;
            break;
            default:
                this.logService.log(`unable to identify tableName if functionCall: getTableDetails for listName: ${listName}`, 
                        this.utilsService.errorStatus, 
                        false)
            break;
        }

        return tableName
}


getIndexValue(listName:string, ID:number, data:any): Observable<any>{
    let index$ = new Observable((observer:Observer<any>) => {
        let tableName:string
            try {
                tableName = this.getTableName(listName);
                data['tableName'] = tableName
            } catch(e) {
                let _msg = `error getting tableName from listName ${listName} in function call getIndexValue`
                this.logService.log(_msg, this.utilsService.errorStatus, false)
                this.logService.log(e, this.utilsService.errorStatus, false)
                observer.next({
                    reportHeading: 'getIndexValue',
                    reportResult: this.utilsService.failStatus,
                    message: _msg,
                    error: e
                })
                observer.complete()
            }
            let indexValue
            try {

                 indexValue = this.getItemIndex(ID, tableName);
                 data['indexValue'] = indexValue
            } catch (e){
                let _msg = `error getting itemIndex from listName: ${listName} and tableName: ${tableName} in function call getIndexValue`
                this.logService.log(_msg, this.utilsService.errorStatus, false)
                this.logService.log(e, this.utilsService.errorStatus, false)
                observer.next({
                    reportHeading: 'getIndexValue',
                    reportResult: this.utilsService.failStatus,
                    message: _msg,
                    error: e
                })
                observer.complete()
            }                

            
        // switch(tableName) {
        //     case this._ResourceDataName:
        //         try {
        //             //find index Value in Data Object
        //             // data['indexValue'] = this.findResourceIndex(ID);
        //             data['indexValue'] = this.getItemIndex(ID, this._ResourceDataName);
        //         } catch (e) {
        //             this.logService.log(e, this.utilsService.errorStatus, false);
        //             ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
        //             let _msg = `updateTable Error: unable to determine the ItemId of the affected object, update table failed for tableName: ${tableName}`
        //             this.logService.log(_msg, this.utilsService.errorStatus, false);
        //             observer.next({
        //                 reportHeading: 'getIndexValue',
        //                 reportResult: this.utilsService.errorStatus,
        //                 message: _msg
        //             })
        //             observer.complete()
        //         }                    
        //     break;
        //     case this._MaterialDataName:
        //         try {
        //             //find index Value in Data Object
        //             // data['indexValue'] = this.findMaterialIndex(ID);
        //             data['indexValue'] = this.getItemIndex(ID, this._MaterialDataName);
        //         } catch (e) {
        //             this.logService.log(e, this.utilsService.errorStatus, false);
        //             ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
        //             let _msg = `updateTable Error: unable to determine the ID of the affected object, update table failed for tableName: ${tableName}`
        //             this.logService.log(_msg, this.utilsService.errorStatus, false);
        //             observer.next({
        //                 reportHeading: 'getIndexValue',
        //                 reportResult: this.utilsService.errorStatus,
        //                 message: _msg
        //             })
        //             observer.complete()
        //         }
        //     break;
        //     case this._SummaryDataName:
        //         try {
        //             //find index Value in Data Object
        //             // data['indexValue'] = this.findSummaryIndex(ID);
        //             data['indexValue'] = this.getItemIndex(ID, this._SummaryDataName);
        //         } catch (e) {
        //             this.logService.log(e, this.utilsService.errorStatus, false);
        //             ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
        //             let _msg = `updateTable Error: unable to determine the ID of the affected object, update table failed for tableName: ${tableName}`
        //             this.logService.log(_msg, this.utilsService.errorStatus, false);
        //             observer.next({
        //                 reportHeading: 'getIndexValue',
        //                 reportResult: this.utilsService.errorStatus,
        //                 message: _msg
        //             })
        //             observer.complete()
        //         }
        //     break;
        //     case this._TotalDataName:
        //         try {
        //             if(data.ID) {
        //                 //find index Value in Data Object
        //                 // data['indexValue'] = this.findTotalsIndex(data.ID);
        //                 data['indexValue'] = this.getItemIndex(data.ID, this._TotalDataName);
        //             } else {
        //                 let _msg = `error unable to locate ID value from data object, functionCall: getIndexValue, tableName: ${tableName}, Year Value: ${data.year}`
        //                 this.logService.log(_msg, this.utilsService.errorStatus, false)
        //                 observer.next({
        //                     reportHeading: 'getIndexValue',
        //                     reportValue: this.utilsService.errorStatus,
        //                     message: _msg
        //                 })
        //                 observer.complete()
        //             }
                    
        //         } catch (e) {
        //             this.logService.log(e, this.utilsService.errorStatus, false);
        //             let _msg = `updateTable Error: unable to determine the ID of the affected object, update table failed for tableName: ${tableName}`
        //             this.logService.log(_msg, this.utilsService.errorStatus, false);
        //             observer.next({
        //                 reportHeading: 'getIndexValue',
        //                 reportResult: this.utilsService.errorStatus,
        //                 message: _msg
        //             })
        //             observer.complete()
        //         }
        //     break;
        //     default:
        //         let _msg = `unable to locate listName to use with tableName: ${tableName}`
        //         observer.next({
        //                 reportHeading: 'getIndexValue',
        //                 reportResult: this.utilsService.errorStatus,
        //                 message: _msg
        //         })
        //         this.logService.log(_msg, this.utilsService.errorStatus, false)
        //         observer.complete()
        //     break;
        // }
        if (!data.hasOwnProperty('indexValue') || data.indexValue < 0) {
            let _msg = `updateTable Error: can't find indexValue`
            this.logService.log(_msg, this.utilsService.errorStatus, false);
            observer.next({
                reportHeading: 'getIndexValue',
                reportResult: this.utilsService.errorStatus,
                message: _msg
            }) 
        } else {
            observer.next({
                functionCall: 'getIndexValue',
                result: true,
                data: data,
                listName: listName,
                indexValue: indexValue,
                tableName: tableName
            })

            observer.next({
                reportHeading: 'getIndexValue',
                reportResult: this.utilsService.successStatus,
                listName: listName,
                data: data
            })
        }

        observer.complete()  
    })

    return index$

}

UTUpdateData(data):Observable<any>{

    let update$ = new Observable((observer:Observer<any>) => {
        if (this[data.tableName] &&
            this[data.tableName].hasOwnProperty(data.indexValue) &&
            this[data.tableName][data.indexValue].hasOwnProperty(data.columnName)) {
                //convert number strings to numbers
                //update Data object
                try {
                    this[data.tableName][data.indexValue][data.columnName] = data.newValue;
                    observer.next({
                        functionCall: 'UTUpdateData',
                        result: true,
                        data: data
                    })

                    observer.next({
                        reportHeading: 'UTUpdateData',
                        reportResult: this.utilsService.successStatus,
                        listName: data.listName
                    })
                } catch (e) {
                    this.logService.log(e, this.utilsService.errorStatus, false)
                    observer.next({
                        reportHeading: 'UTUpdateData',
                        reportResult: this.utilsService.failStatus,
                        message: `failed to update table with tableName: ${data.tableName}, 
                                                                indexValue: ${data.indexValue}, 
                                                                columnName: ${data.columnName}`
                    })
                }
            }
        observer.complete();
    })
    
    return update$
    
}

updateStateValue(indexValue:number, stateValue:string, tableName:string, data:any):Observable<any>{
    console.log('updateStateValue function called')
    console.log(indexValue, stateValue, tableName, data)
    let state$ = new Observable((observer:Observer<any>) => {
        try {
            //SHOULD BE IN SEPERATE FUNCITON
            if(this[tableName] &&
                Array.isArray(this[tableName]) &&
                this[tableName][indexValue] &&
                this[tableName][indexValue]['State']) {

                    this[tableName][indexValue]['State'] = stateValue

                    observer.next({
                        functionCall: 'updateStateValue',
                        result: true,
                        data: data
                    })

                    observer.next({
                        reportHeading: 'updateStateValue',
                        reportResult: this.utilsService.successStatus,
                        listName: data.listName,
                        itemIndex: indexValue
                    })
                } else {
                    observer.next({
                        reportHeading: 'updateStateValue',
                        reportResult: this.utilsService.failStatus,
                        message: `failed to located item and state property to update`,
                        indexValue: indexValue,
                        stateValue: stateValue,
                        tableName: tableName,
                        data: data
                    })
                }
        } catch (e) {
            let _msg = `error updating state for ${tableName} with indexValue ${indexValue}`

            this.logService.log(_msg, this.utilsService.errorStatus, false)
            observer.next({
                reportHeading: 'updateStateValue',
                reportResult: this.utilsService.errorStatus,
                message: _msg,
                error: e
            })
        }   

        observer.complete()
    })
    return state$
}

processCalculatedFields(listName:string, data:any): Observable<any>{
    let calcFields$ = new Observable((observer:Observer<any>) => {
        try {
            //update values
            switch (listName) {
                case this.utilsService.financeAppResourceData:
                    this.calcResourceValues();
                    this.calcTotalValues();
                    this.calcSummaryValues();
                break;
                case this.utilsService.financeAppMaterialData:
                    this.calcMaterialValues();
                    this.calcTotalValues();
                    this.calcSummaryValues();
                break;
                case this.utilsService.financeAppTotalsData:
                    this.calcTotalValues();
                    this.calcSummaryValues();
                break;
                case this.utilsService.financeAppSummaryData:
                    this.calcSummaryValues();
                break;
                default:
                    this.logService.log(`UpdateTable Error: unable to determine which data set to refresh`, this.utilsService.errorStatus, false);
                    observer.next({
                        reportHeading: 'processCalculatedFields',
                        reportResult: this.utilsService.failStatus,
                        listName: listName,
                        message: `failed to run process calculcated fields`
                    })                    
                    observer.complete()
                break;
            }
            
            observer.next({
                functionCall: 'processCalculatedFields',
                result: true,
                data: data? data: null
            })

            observer.next({
                reportHeading: 'processCalculatedFields',
                reportResult: this.utilsService.successStatus,
                listName: listName,
                data: data? data: null
            })

        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false)
            observer.next({
                reportHeading: 'processCalculatedFields',
                reportResult: this.utilsService.failStatus,
                listName: listName,
                error: e,
                message: `failed to run process calculcated fields`
            })
        }

        observer.complete()

    })

    return calcFields$
}

emitValues(listArray:Array<string>): Observable<any>{
    let emit$ = new Observable((observer:Observer<any>) => {
        if(Array.isArray(listArray)){
        //emit values
        listArray.forEach(listName => {
            try {
                switch (listName) {
                    case this.utilsService.financeAppResourceData:
                        this.resourceDataStream.next(this._ResourceData);
                    break;
                    case this.utilsService.financeAppMaterialData:
                        this.materialDataStream.next(this._MaterialData);
                    break;
                    case this.utilsService.financeAppTotalsData:
                        this.totalDataStream.next(this._TotalData);
                    break;
                    case this.utilsService.financeAppSummaryData:
                        this.summaryDataStream.next(this._SummaryData)
                    break;
                    default:
                        let _msg = `UpdateTable Error: unable to determine which data set to refresh`
                        this.logService.log(_msg, this.utilsService.errorStatus, false);
                        observer.next({
                            reportHeading: 'emitValues',
                            reportResult: this.utilsService.failStatus,
                            listName: listName,
                            message: _msg
                        })
                        observer.complete()
                    break;
                }
            } catch (e) {
                let _msg ='Error: error emitting data stream'
                this.logService.log(_msg, this.utilsService.errorStatus, false)
                observer.next({
                    reportHeading: 'emitValues',
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    message: _msg,
                    error: e
                })
                observer.complete()
            }
        })
        


        observer.next({
            functionCall: 'emitValues',
            listArray: listArray,
            result: true
        })
        observer.next({
            reportHeading: 'emitValues',
            reportResult: this.utilsService.successStatus,
            listArray: listArray,
        })
    } else {
        observer.next({
            reportheading: 'emitValues',
            reportResult: this.utilsService.errorStatus,
            message: 'error status: listArray is not of type Array'
        })
    }
    observer.complete()
    })
        
    return emit$

}
//(data['itemId'], data['ID'], data['listName'], this.dataContextService.getTableName(data['listName'])
updateItemIdAfterAdd(itemId:string, ID:number, listName:string, tableName:string):Observable<any>{
    let updateId$ = new Observable((observer:any) => {
        if (this[tableName] &&
            Array.isArray(this[tableName])) {
                let _index = this[tableName].findIndex(element => {
                    return +element.ID == +itemId
                })

                if (_index < 0) {
                    observer.next({
                        reportHeading: 'updateItemIdAfterAdd',
                        reportResult: this.utilsService.errorStatus,
                        message: `failed to find index: ${_index} for item with itemId: ${itemId} on table: ${tableName} and list: ${listName}`
                    })
                    observer.complete()
                }

                if(this[tableName][_index]) {
                    this[tableName][_index]['ID'] = ID
                } else {
                    observer.next({
                        reportHeading: 'updateItemIdAfterAdd',
                        reportResult: this.utilsService.errorStatus,
                        message: `failed to find item with index: ${_index} for item with itemId: ${itemId} on table: ${tableName} and list: ${listName}`
                    })
                    observer.complete()
                }
        } else {
            observer.next({
                reportHeading: 'updateItemIdAfterAdd',
                reportResult: this.utilsService.errorStatus,
                message: `failed to find table with table: ${tableName} and list: ${listName} for item with itemId ${itemId} and ID ${ID}`
            })
            observer.complete()            
        }

        observer.next({
            functionCall: 'updateItemIdAfterAdd',
            result: true,
            itemId: itemId,
            ID: ID,
            listName: listName,
            tableName: tableName,
            apiCall: this.utilsService.apiCallAddField
        })

        observer.next({
            reportHeading: 'updateItemIdAfterAdd',
            reportResult: this.utilsService.successStatus,
            listName: listName,
            ID: ID
        })
        observer.complete()
    })

    return updateId$
}



////////////
    createDataItem(listName: string):Observable<any>{
        let add$ = new Observable((observer:Observer<any>) => {
            try {
                let _item = this.createPlaceholderObject(listName)

                observer.next({
                    functionCall: 'addDataRow',
                    result: true,
                    listName: listName,
                    item: _item
                })

                observer.next({
                    reportHeading: 'addDataRow',
                    result: this.utilsService.successStatus,
                    listName: listName,
                    item:_item
                })
            
            } catch(e) {
                let _msg = `error getting tableName from listName ${listName} in function call addDatarow`
                this.logService.log(_msg, this.utilsService.errorStatus, false)
                this.logService.log(e, this.utilsService.errorStatus, false)
                observer.next({
                    reportHeading: 'addDataRow',
                    reportResult: this.utilsService.failStatus,
                    message: _msg
                })
                observer.complete()
            }
            // switch(tableName) {
            //     case this._ResourceDataName:
            //         this.addResourceRow()
            //         observer.next({
            //             functionCall: 'addDataRow',
            //             result: true,
            //             listName: listName,
            //             tableName: tableName
            //         })
            //     break;
            //     case this._MaterialDataName:
            //         this.addMaterialRow()
            //         observer.next({
            //             functionCall: 'addDataRow',
            //             result: true,
            //             listName: listName,
            //             tableName: tableName
            //         })
            //     break;
            //     case this._SummaryDataName:
            //         this.addSummaryRow()
            //         observer.next({
            //             runctionCall: 'addDataRow',
            //             result: true,
            //             listName: listName,
            //             tableName: tableName
            //         })
            //     default:
            //         let _msg = `unable to determine data table to update with tableName: ${tableName}`

            //         this.logService.log(_msg, this.utilsService.errorStatus, false)
            //         observer.next({
            //             functionCall: 'addDataRow',
            //             result: false,
            //             message: _msg,
            //             listName: listName,
            //             tableName: tableName
            //         })
            //     break
            // }
        })
        return add$
    }



    // deleteDataRow(type: string, id: number):Observable<any>{
    //     let delete$ = new Observable((observer:Observer<any>) => {
    //         switch(type) {
    //             case this._ResourceDataName:
    //                 this.deleteResourceRow(id)
    //                 observer.next({
    //                     functionCall: 'deleteDataRow',
    //                     result: true,                        
    //                 })
    //             break;
    //             case this._MaterialDataName:

    //             break;
    //             default:
    //                 let _msg = 'unable to determine data table to update'

    //                 this.logService.log(_msg, this.utilsService.errorStatus, false)
    //                 observer.next({
    //                     functionCall: 'deleteDataRow',
    //                     result: false,
    //                     message: _msg
    //                 })
    //             break
    //         }
    //     })
    //     return delete$
    // }

    // addResourceRow(){
    //     let _year:number = this.settingsService.year;
    //     let _Id:number = this._ResourceData.length + 1;
    //     let _newRow:IResourceModel = JSON.parse(JSON.stringify(newResourceRow));
    //     _newRow.Year = _year
    //     _newRow.ItemId = _Id

    //     this._ResourceData.push(_newRow)

    //     return
    // }

    // addMaterialRow() {
    //     let _year: number = this.settingsService.year;
    //     let _Id: number = this._MaterialData.length + 1;
    //     let _newRow:IMatModel = JSON.parse(JSON.stringify(newMaterialRow));
    //     _newRow.Year = _year;
    //     _newRow.ItemId = _Id;

    //     this._MaterialData.push(_newRow)

    //     return
    // }

    // addSummaryRow() {
    //     let _year: number = this.settingsService.year;
    //     let _Id: number = this._SummaryData.length + 1;
    //     let _newRow:ISummaryModel = JSON.parse(JSON.stringify(newSummaryRow));
    //     _newRow.Year = _year;
    //     _newRow.ItemId = _Id;

    //     this._SummaryData.push(_newRow)

    //     return        
    // }



    // deleteMaterialRow(id: number){
    //     let indexValue: number
    //     //find Row in Mat Data Object
    //     indexValue = this.findMaterialIndex(id);


    //     if(id >= 0 && indexValue >= 0) {
    //         this.updateState(indexValue, this.utilsService.deleteState, this._MaterialDataName);
    //     }

    //     this.calcMaterialValues()
    //     this.calcTotalValues()

    //     // //emit values
    //     // this.materialDataStream.next(this._MaterialData);
    //     // this.totalDataStream.next(this._TotalData);
    // }

    // deleteResourceRow(id: number){
    //     let indexValue: number
    //     //find Row in Data Object
    //     indexValue = this.findResourceIndex(id);

    //     if(id >= 0 && indexValue >= 0) {
    //         this.updateState(indexValue, this.utilsService.deleteState,this._ResourceDataName);
    //         //this.PercentageUtilisedData.splice(indexValue, 1);
    //     }   
    
    //     this.calcResourceValues()
    //     this.calcTotalValues()

    //     // //emit values
    //     // this.resourceDataStream.next(this._ResourceData);
    //     // this.totalDataStream.next(this._TotalData)
    // }

    getItemIndex(ID: number, tableName:string){
        if(Array.isArray(this[tableName]) && this[tableName]) {
            return this[tableName].findIndex((element:any):any => {
                return element.ID == ID
            })
        } else {
            return -1
        }
    }

    // findResourceIndex(ID: number) {
    //    if(Array.isArray(this._ResourceData) && this._ResourceData) {
    //         return this._ResourceData.findIndex((element:any):any => {
    //                             return element.ID == ID
    //                         })
    //    } else {
    //        return -1
    //    }
    // }

    // findMaterialIndex(ID: number) {
    //     if(Array.isArray(this._MaterialData) && this._MaterialData) {
    //         return this._MaterialData.findIndex((element:any):any => {
    //                             return element.ID == ID
    //                         })
    //     } else {
    //         return -1
    //     }
    // }

    // findTotalsIndex(ID: number) {
    //     //what if this row does not exist?
    //     if (Array.isArray(this._TotalData) && this._TotalData) {
    //         return this._TotalData.findIndex((element:any):any => {
    //                 return element.ID == ID
    //             });
    //     } else {
    //         return -1
    //     }
    // }

    // findSummaryIndex(objectId){

    // }    

    calcResourceValues(){

        this.resetHighlights(this._ResourceDataName);

        let filteredResourceYearData

        //filter on current year and delete
        try {
            filteredResourceYearData = this._ResourceData.filter((row)=>{
                return row.Year === this.settingsService.year && row.State !== this.utilsService.deleteState;
            })
        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
        }

        if (!Array.isArray(filteredResourceYearData) || filteredResourceYearData.length <= 0) {
            //cannot find any data
            this.logService.log(`cannot find cached resource data for year ${this.settingsService.year} at function calcResourceValues`, this.utilsService.errorStatus, false)
            return
        } else {
            //process calculated fields
            filteredResourceYearData.forEach((rowItem, index, array) => {
                // let indexValue = this.findResourceIndex(rowItem.ID);
                let indexValue = this.getItemIndex(rowItem.ID, this._ResourceDataName);
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
        return
    }

    calcMaterialValues(){

        let tableName = this._MaterialDataName
        this.resetHighlights(tableName);

        let filteredMaterialYearData;

        //filter on current year and delete
        try {
            filteredMaterialYearData = this._MaterialData.filter((row)=>{
                return row.Year === this.settingsService.year && row.State !== this.utilsService.deleteState;
            })

        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
        }


        if (!Array.isArray(filteredMaterialYearData) || filteredMaterialYearData.length < 0 ) {
            this.logService.log(`cannot find cached material data for year ${this.settingsService.year} at function calcMaterialValues`, this.utilsService.errorStatus, false)
            return
        } else {
            //process calculated fields
            filteredMaterialYearData.forEach((rowItem, index, array) => {
                
                let indexValue

                if (rowItem.hasOwnProperty('ID')) {
                    // indexValue = this.findMaterialIndex(rowItem.ID);
                    indexValue = this.getItemIndex(rowItem.ID, this._MaterialDataName);
                } else {
                    this.logService.log(`cannot locate ID property in Material 
                                        list row item, unable to process Material data`, this.utilsService.errorStatus, false)
                }

                try {
                    let rowId = this._MaterialData[indexValue].ID;
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
    }

    calcTotalValues(){
        /////////NEED CHECK IF TOTAL ROW DOES NOT EXIST CREATE


        let filteredResourceYearData, 
            filteredMaterialYearData,
            filteredTotalYearData,
            indexValue,
            ID,
            sumResourceArray,
            sumMaterialArray,
            sumTotalsArray;
        //Reset Highlights
        this.resetHighlights(this._TotalDataName);
        //filter on current year and delete
        try {
            filteredResourceYearData = this._ResourceData.filter((row)=>{
                return row.Year === this.settingsService.year && row.State !== this.utilsService.deleteState;
            })
            filteredMaterialYearData = this._MaterialData.filter((row)=>{
                return row.Year === this.settingsService.year && row.State !== this.utilsService.deleteState;
            })

        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
        }


        try {
            filteredTotalYearData = this._TotalData.filter((row)=>{
                return row.Year === this.settingsService.year;
            })
        } catch(e) {
            this.logService.log(e, this.utilsService.errorStatus, false)
        }

        //filteredTotalYearData should be an array of length one as there should only be 1 total row for each year
        //what if this row does not exist?
        if (filteredTotalYearData.length !== 1) {
            this.logService.log(`error looking up total year result set, 
                                unable to run calcuations for totals`, this.utilsService.errorStatus, false);
            return
        }
        
        
        ID = filteredTotalYearData[0].ID
        // indexValue = this.findTotalsIndex(ID);
        indexValue = this.getItemIndex(ID, this._TotalDataName);

        if (indexValue < 0) {
            this.logService.log(`cannot find cached totals data for year ${this.settingsService.year} at function calcTotalValues`, this.utilsService.errorStatus, false)
            return
        }

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
            this.checkCalcValue(ID, fieldName, calculatedValue, indexValue, this._TotalDataName);
        })
        sumMaterialArray.forEach((fieldName)=>{
            let calculatedValue = this.dataCalcService.sumResourceTotal(filteredMaterialYearData, fieldName);
            this.checkCalcValue(ID, fieldName, calculatedValue, indexValue, this._TotalDataName);
        })

        //After running calculations for totals calculate sum totals

        // calculate the sum totals
        sumTotalsArray.forEach((fieldName)=>{
            let calculatedValue = this.dataCalcService.sumTotal(filteredTotalYearData[0], fieldName);
            this.checkCalcValue(ID, fieldName, calculatedValue, indexValue, this._TotalDataName);
        })


    }

    calcSummaryValues(){
        let indexValue, ID;
        // let grossSummaryArray: Array<string>
        // let costSummaryArray: Array<string>
        // let netSummaryArray: Array<string>

        this.resetHighlights(this._SummaryDataName)

        indexValue = this._SummaryData.findIndex((row:ISummaryModel) => {
            return row.Year == this.settingsService.year
        })

        if (indexValue < 0 ) {
            this.logService.log(`error unable to complete calcSummaryValues, unable to find summary row for year ${this.settingsService.year}`, this.utilsService.errorStatus, false)
            return
        }

        if (this._SummaryData[indexValue] &&
            this._SummaryData[indexValue]['ID']) {
                ID = this._SummaryData[indexValue]['ID']
        } else {
                this.logService.log(`error unable to complete calcSummaryValues, unable to find ID value for row item with index ${indexValue}`, this.utilsService.errorStatus, false)
                return
        }

        // costSummaryArray = [
        //     'CostLbe',
        //     'CostYtd',
        //     'CostVariance',
        //     'CostVairancePercentage',
        //     'CostRag'
        // ]

        // grossSummaryArray = [
        //     'GrossBenefitVariance',
        //     'GrossBenefitVariancePercentage',
        //     'GrossRag'
        // ]

        // netSummaryArray = [
        //     'NetBenefitBaseline',
        //     'LbeNetHeader',
        //     'NetBenefitYtd',
        //     'NetBenefitVariance',
        //     'NetBenefitVariancePercentage',
        //     'NetRag'
        // ]

        //Cost LBE
        let costLbeFieldName = 'CostLbe'
        let calculatedCostLbeValue = this.dataCalcService.sumSummaryField(this._TotalData, 'TLbe')
        this.checkCalcValue(ID, costLbeFieldName, calculatedCostLbeValue, indexValue, this._SummaryDataName);

        // Cost Ytd
        let costYtdFieldName = 'CostYtd'
        let calculatedCostYtdValue = this.dataCalcService.sumSummaryField(this._TotalData, 'TYtdTotal')
        this.checkCalcValue(ID, costYtdFieldName, calculatedCostYtdValue, indexValue, this._SummaryDataName);

        // Cost Variance
        let costVarianceFieldName = 'CostVariance'
        let calculatedCostVarianceValue = this.dataCalcService.difference(+(this._SummaryData[indexValue]['CostBaseline']), +(this._SummaryData[indexValue]['CostLbe']))
        this.checkCalcValue(ID, costVarianceFieldName, calculatedCostVarianceValue, indexValue, this._SummaryDataName)

        // Cost Variance Percentage
        let costVariancePercentageName = 'CostVairancePercentage'
        let calculatedCostVariancePercentageValue =this.dataCalcService.percentageVariance(calculatedCostVarianceValue, +this._SummaryData[indexValue]['CostBaseline'])
        this.checkCalcValue(ID, costVariancePercentageName , calculatedCostVariancePercentageValue, indexValue, this._SummaryDataName)

        // CostRag
        let costRagName = 'CostRag'
        let calculatedCostRagValue = this.dataCalcService.ragValue(calculatedCostVariancePercentageValue)
        this.checkCalcValue(ID, costRagName, calculatedCostRagValue, indexValue, this._SummaryDataName)

        // Gross Variance
        let grossBenefitVarianceName = 'GrossBenefitVariance'
        let calculatedGrossBenefitVarianceValue = this.dataCalcService.difference(+(this._SummaryData[indexValue]['GrossBenefitBaseline']), +(this._SummaryData[indexValue]['GrossBenefitLbe']))
        this.checkCalcValue(ID, grossBenefitVarianceName, calculatedGrossBenefitVarianceValue, indexValue, this._SummaryDataName)

        // Gross Variance Percentage
        let grossBenefitVariancePercentageName = 'GrossBenefitVariancePercentage'
        let calculatedGrossBenefitVariancePercentageValue =this.dataCalcService.percentageVariance(calculatedGrossBenefitVarianceValue, +this._SummaryData[indexValue]['GrossBenefitBaseline'])
        this.checkCalcValue(ID, grossBenefitVariancePercentageName , calculatedGrossBenefitVariancePercentageValue, indexValue, this._SummaryDataName)

        // GrossRag
        let grossRagName = 'GrossRag'
        let calculatedGrossRagValue = this.dataCalcService.ragValue(calculatedGrossBenefitVariancePercentageValue)
        this.checkCalcValue(ID, grossRagName, calculatedGrossRagValue, indexValue, this._SummaryDataName)   
        
        // Net Baseline Benefit
        let netBaselineBenefitName = 'NetBenefitBaseline'
        let calculatedNetBenefitBaselineValue = this.dataCalcService.difference(+(this._SummaryData[indexValue]['GrossBenefitBaseline']),+(this._SummaryData[indexValue]['CostBaseline']))
        this.checkCalcValue(ID, netBaselineBenefitName, calculatedNetBenefitBaselineValue, indexValue, this._SummaryDataName)

        // Net Lbe Benefit
        let netBenefitLbeName = 'NetBenefitLbe'
        let calculatedNetBenefitLbeValue = this.dataCalcService.difference(+this._SummaryData[indexValue]['GrossBenefitLbe'], +(this._SummaryData[indexValue]['CostLbe']))
        this.checkCalcValue(ID, netBenefitLbeName, calculatedNetBenefitLbeValue, indexValue, this._SummaryDataName)

        // Net Ytd
        let netBenefitYtdName = 'NetBenefitYtd'
        let calculatedNetBenefitYtdValue = this.dataCalcService.difference(+this._SummaryData[indexValue]['GrossBenefitYtd'], +(this._SummaryData[indexValue]['CostYtd']))
        this.checkCalcValue(ID, netBenefitYtdName, calculatedNetBenefitYtdValue, indexValue, this._SummaryDataName)

        // Net Variance
        let netBenefitVarianceName = 'NetBenefitVariance'
        let calculatedNetBenefitVarianceValue = this.dataCalcService.difference(calculatedNetBenefitLbeValue, calculatedNetBenefitBaselineValue)
        this.checkCalcValue(ID, netBenefitVarianceName, calculatedNetBenefitVarianceValue, indexValue, this._SummaryDataName)
        
        // Net Variance Percentage
        let netBenefitVariancePercentageName = 'NetBenefitVariancePercentage'
        let netBenefitVariancePercentageValue = this.dataCalcService.percentageVariance(calculatedNetBenefitVarianceValue, calculatedNetBenefitBaselineValue)
        this.checkCalcValue(ID, netBenefitVariancePercentageName, netBenefitVariancePercentageValue, indexValue, this._SummaryDataName)

        // NetRag
        let netRagName = 'NetRag'
        let calculatedNetRagValue = this.dataCalcService.ragValue(netBenefitVariancePercentageValue)
        this.checkCalcValue(ID,netRagName, calculatedNetRagValue, indexValue, this._SummaryDataName)

    }
  
    checkCalcValue(ID: number, 
                    field:string, 
                    updatedValue:any, 
                    indexValue:number, 
                    tableName:string){
        if (indexValue>=0 && 
            this.hasOwnProperty(tableName) &&
            this[tableName].hasOwnProperty(indexValue) &&
            this[tableName][indexValue].hasOwnProperty(field) &&
            this[tableName][indexValue][field] !== updatedValue) {
            
            // update the table with the new value
            this[tableName][indexValue][field] = updatedValue

            // update state of row
            this.updateState(indexValue, this.utilsService.updateState, tableName);

            // add highlight 
            //this.markChange(indexValue, ID, field, tableName)
        }
    }

    //to be replaced by above generic function
    checkCalcValue2(rowItem: any,
                   field: string, 
                   calcValue: number, 
                   indexValue: number){
            if (indexValue>=0 && rowItem[field] !== calcValue) {
                rowItem[field] = calcValue
                this.updateState(indexValue, this.utilsService.updateState,this._ResourceDataName)
                //this.markChange(indexValue, rowItem.ID, field, this._ResourceDataName);
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

        if (this.hasOwnProperty(tableName) &&
            this[tableName][indexId]) {       
                currentState = this[tableName][indexId]['State'];
        } else {
            this.logService.log(`updateSate Error: unable to locate tableName or indexId`, this.utilsService.errorStatus, false);
        }
        //don't mark newly created items as update
        if (currentState == this.utilsService.createState && state == this.utilsService.updateState) {
            //do nothing
        } else {
             this[tableName][indexId]['State'] = state;
        }

        return
    }

    // markChange(indexValue:number, ID: number, fieldName: string, tableName: string){
    //     let highlight:any = {
    //         ID: ID,
    //         fieldName: fieldName
    //     }
    //     this[tableName][indexValue]['Highlights'].push(highlight)
    //     return
    // }
}