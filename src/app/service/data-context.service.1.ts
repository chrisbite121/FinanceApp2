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

const newResourceRow:IResourceModel = newDataRow;
const newMaterialRow:IMatModel = newMaterialDataRow;
const newTotalRow: ITotalModel = newTotalDataRow


@Injectable()
export class DataContextService {
    private obs: Observable<any>
    private resourceDataStream: Subject<any> = new Subject();
    private totalDataStream: Subject<any> = new Subject();
    private materialDataStream: Subject<any> = new Subject();
    private _year: number;
    private _ResourceData:IResourceModel[]
    private _TotalData:ITotalModel[]
    private _MaterialData: IMatModel[]
    private _ResourceDataName: string = '_ResourceData'
    private _MaterialDataName: string = '_MaterialData'
    private _TotalDataName: string = '_TotalData'

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
        this.settingsService.getSettingsStream().subscribe((settings:ISettings) => {
            this._year = settings.year;
        })

        //process calculated fields to make sure data is correct
        this.calcTotalValues()
        this.calcResourceValues()
        this.calcMaterialValues()

    }

processListData(data:Array<Object>, listName: string):Observable<any> {

    this.logService.log(`Process List Data Function called for list: ${listName}`, this.utilsService.infoStatus, false);

   let listData$ = new Observable((observer:Observer<any>) => {

        let _resultsArray = new Array()
        
        //need to pull out the field names from list spec and put them into array
        let fieldNameArray = this.listService.getArrayFieldNames(listName);

        if (data.length>0) {

            data.forEach(item => {
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


                _resultsArray.push(JSON.parse(JSON.stringify(_item)));

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


    get resourceData(){
        return this._ResourceData
    }   

    get materialData(){
        return this._MaterialData
    }

    get totalsData() {
        return this._TotalData
    }

    updateStateAfterApiCall(listName, itemId, apiCall):Observable<any> {
        let updateState$ = new Observable((observer:Observer<any>) => {
            let _listName:string = '' 
            
            switch(listName) {
                case this.utilsService.financeAppResourceData:
                    _listName = this._ResourceDataName
                break;
                case this.utilsService.financeAppMaterialData:
                    _listName = this._MaterialDataName
                break;
                case this.utilsService.financeAppTotalsData:
                    _listName = this._TotalDataName
                break;
            }

            try {
                let indexValue = this[_listName].findIndex(element => {
                    return element['ItemId'] == itemId
                })

                this[_listName][indexValue]['State'] = this.utilsService.inertState

                observer.next({
                    functionCall:'updateStateAfterApiCall',
                    result: 'complete'
                })
            } catch (e) {
                this.logService.log(`failed to update state of listitem in list ${listName} with id ${itemId}`, 
                            this.utilsService.errorStatus, 
                            false)
            }

            observer.complete()
            })

            return updateState$
    }

    getResourceDataStream(): Observable<any> {
        let filteredResourceDataStream = this.resourceDataStream.asObservable().map((data, index) => {
            return data.filter((row:any)=> row.State !== this.utilsService.deleteState && row.Year === this._year)
        })
        return filteredResourceDataStream
    }

    getTotalDataStream(): Observable<any> {
        let filteredTotalDataStream = this.totalDataStream.asObservable().map((data, index) => {
            return data.filter((row:any) => row.State !== this.utilsService.deleteState && row.Year === this._year)
        })
        return filteredTotalDataStream
    }

    getMaterialDataStream(): Observable<any> {
        let filteredMaterialDataStream = this.materialDataStream.asObservable().map((data,index) => {
            return data.filter((row:any) => row.State !== this.utilsService.deleteState && row.Year === this._year)
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

///////////// Update Table functions

UTExtractProperties(event): Observable<any>{
    let objectId, columnName, newValue, oldValue, indexValue, listName, tableName;

    let validate$ = new Observable((observer:any) => {
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

                observer.next({
                    functionCall: 'UTValidateData',
                    result: true,
                    data: {
                        objectId: objectId,
                        columnName: columnName,
                        newValue: newValue,
                        oldvalue: oldValue,
                        listName: listName,
                        tableName: '',
                        indexValue: null,
                    }
                })

                observer.next({
                    functionCall: 'UTValidateData',
                    result: this.utilsService.successStatus
                })
        } else {
            let _msg = 'updateTable Error: required data items in updated row not found'
            this.logService.log(_msg, this.utilsService.errorStatus, false)
            ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            observer.next({
                functionCall: 'UTValidateData',
                result: this.utilsService.failStatus,
                message: _msg
            })
        }

        observer.complete()
    })
    return validate$          

}

UTPreProcessData(data): Observable<any>{
    let process$ = new Observable((observer:Observer<any>) => {
        if (!Number(data.newValue)) {
            let _msg = `updateTable Error: Type error cannot convert newValue to number`
            this.logService.log(_msg, this.utilsService.errorStatus, false);
            ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            observer.next({
                functionCall: 'UTPreProcessData',
                result: this.utilsService.failStatus,
                message: _msg
            })
        } else {
            data.newValue = +data.newValue
        }

        if (data.newValue == data.oldValue) {
            let _msg = 'new value equals old value'
            this.logService.log(_msg, this.utilsService.infoStatus, true);
            observer.next({
                functionCall: 'UTPreProcessData',
                result: this.utilsService.failStatus,
                message: _msg
            })
        } else {
            observer.next({
                functionCall: 'UTPreProcessData',
                data: data,
                result: true
            })
        }
        observer.complete()

    })

    return process$

}

UTGetIndexValue(data): Observable<any>{
    let index$ = new Observable((observer:Observer<any>) => {
        switch(data.listName) {
                case this.utilsService.financeAppResourceData:
                    data.tableName = this._ResourceDataName
                    try {
                        //find index Value in Data Object
                        data.indexValue = this.findResourceIndex(data.objectId);
                    } catch (e) {
                        this.logService.log(e, this.utilsService.errorStatus, false);
                        ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                        let _msg = `updateTable Error: unable to determine the ItemId of the affected object, update table failed`
                        this.logService.log(_msg, this.utilsService.errorStatus, false);
                        observer.next({
                            functionCall: 'UTGetIndexValue',
                            result: this.utilsService.failStatus,
                            message: _msg
                        })
                    }                    
                break;
                case this.utilsService.financeAppMaterialData:
                    data.tableName = this._MaterialDataName
                    try {
                        //find index Value in Data Object
                        data.indexValue = this.findMaterialIndex(data.objectId);
                    } catch (e) {
                        this.logService.log(e, this.utilsService.errorStatus, false);
                        ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                        let _msg = `updateTable Error: unable to determine the ItemId of the affected object, update table failed`
                        this.logService.log(_msg, this.utilsService.errorStatus, false);
                        observer.next({
                            functionCall: 'UTGetIndexValue',
                            result: this.utilsService.failStatus,
                            message: _msg
                        })
                    }
                break;
                default:
                    observer.next({
                        functionCall: 'UTGetIndexValue',
                        result: this.utilsService.failStatus,
                        message: `unable to locate listName to use`
                    })
            }

            if (data.indexValue < 0) {
                let _msg = `updateTable Error: can't find indexValue`
                this.logService.log(_msg, this.utilsService.errorStatus, false);
                ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
                observer.next({
                    functionCall: 'UTGetIndexValue',
                    result: this.utilsService.failStatus,
                    message: _msg
                }) 
            } else {
                observer.next({
                    functionCall: 'UTGetIndexValue',
                    result: true,
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
                } catch (e) {
                    this.logService.log(e, this.utilsService.errorStatus, false)
                    observer.next({
                        functionCall: 'UTUpdateData',
                        result: this.utilsService.failStatus,
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

UTProcessCalculatedFields(data): Observable<any>{
    let calcFields$ = new Observable((observer:Observer<any>) => {
        try {
            //update values
            this.updateState(data.indexValue, this.utilsService.updateState, data.tableName);
            switch (data.listName) {
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
            observer.next({
                functionCall: 'UTProcessCalculatedFields',
                result: true,
                data: data
            })
        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false)
            ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            observer.next({
                functionCall: 'UTProcessCalculatedFields',
                result: this.utilsService.failStatus,
                message: `failed to run process calculcated fields`
            })
        }

        observer.complete()

    })

    return calcFields$
}

emitValues(listName): Observable<any>{
    let emit$ = new Observable((observer:Observer<any>) => {
        try {
            //emit values
            switch (listName) {
                case this.utilsService.financeAppResourceData:
                    this.resourceDataStream.next(this._ResourceData);
                    this.totalDataStream.next(this._TotalData);
                    observer.next({
                        functionCall: 'emitValues',
                        result: true
                    })
                break;
                case this.utilsService.financeAppMaterialData:
                    this.materialDataStream.next(this._MaterialData);
                    this.totalDataStream.next(this._TotalData);
                    observer.next({
                        functionCall: 'emitValues',
                        result: true
                    })
                break;
                default:
                    let _msg = `UpdateTable Error: unable to determine which data set to refresh`
                    this.logService.log(_msg, this.utilsService.errorStatus, false);
                    observer.next({
                        functionCall: 'emitValues',
                        result: this.utilsService.failStatus,
                        message: _msg
                    })
                break;
            }
        } catch (e) {
            let _msg ='Error: error emitting data stream'
            this.logService.log(_msg, this.utilsService.errorStatus, false)
            ///UPDATE UI STATE SERVICE TO NOTIFIY OF ERROR
            observer.next({
                functionCall: 'UTEmitValues',
                result: this.utilsService.failStatus,
                message: _msg,
                error: e
            })
        }

        observer.complete()
    })

    return emit$

}

checkSate():Observable<any>{
    let check$ = new Observable((observer:Observer<any>) => {
        if (this.settingsService.autoSave) {
            observer.next({
                functionCall: 'checkState',
                result: true,
                type: 'AutoSave',
            })
        } else {
            observer.next({
                funcitonCall: 'checkState',
                result: false,
            })
        }

        observer.complete()
    })
    return check$
}

////////////


    addResourceRow(){
        let _year:number = this._year;
        let _Id:number = this._ResourceData.length + 1;
        let _newRow:IResourceModel = JSON.parse(JSON.stringify(newResourceRow));
        _newRow.Year = _year
        _newRow.ItemId = _Id

        this._ResourceData.push(_newRow)

        //emit values
        this.resourceDataStream.next(this._ResourceData);
    }

    addMaterialRow() {
        let _year: number = this._year;
        let _Id: number = this._MaterialData.length + 1;
        let _newRow:IMatModel = JSON.parse(JSON.stringify(newMaterialRow));
        _newRow.Year = _year;
        _newRow.ItemId = _Id;

        this._MaterialData.push(_newRow)

        //emit vlaues
        this.materialDataStream.next(this._MaterialData);
    }

    deleteMaterialRow(id: number){
        let indexValue: number
        //find Row in Mat Data Object
        indexValue = this.findMaterialIndex(id);


        if(id >= 0 && indexValue >= 0) {
            this.updateState(indexValue, this.utilsService.deleteState, this._MaterialDataName);
        }

        this.calcMaterialValues()
        this.calcTotalValues()

        //emit values
        this.materialDataStream.next(this._MaterialData);
        this.totalDataStream.next(this._TotalData);
    }

    deleteResourceRow(id: number){
        let indexValue: number
        //find Row in Data Object
        indexValue = this.findResourceIndex(id);

        if(id >= 0 && indexValue >= 0) {
            this.updateState(indexValue, this.utilsService.deleteState,this._ResourceDataName);
            //this.PercentageUtilisedData.splice(indexValue, 1);
        }   
    
        this.calcResourceValues()
        this.calcTotalValues()

        //emit values
        this.resourceDataStream.next(this._ResourceData);
        this.totalDataStream.next(this._TotalData)
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

    calcResourceValues(){

        this.resetHighlights(this._ResourceDataName);

        let filteredResourceYearData

        //filter on current year and delete
        try {
            filteredResourceYearData = this._ResourceData.filter((row)=>{
                return row.Year === this._year && row.State !== this.utilsService.deleteState;
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

        let tableName = this._MaterialDataName
        this.resetHighlights(tableName);

        let filteredMaterialYearData;

        //filter on current year and delete
        try {
            filteredMaterialYearData = this._MaterialData.filter((row)=>{
                return row.Year === this._year && row.State !== this.utilsService.deleteState;
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

        let filteredResourceYearData, 
            filteredMaterialYearData,
            filteredTotalYearData,
            indexValue,
            totalRowId,
            sumResourceArray,
            sumMaterialArray,
            sumTotalsArray;
        //Reset Highlights
        this.resetHighlights(this._TotalDataName);
        //filter on current year and delete
        try {
            filteredResourceYearData = this._ResourceData.filter((row)=>{
                return row.Year === this._year && row.State !== this.utilsService.deleteState;
            })
            filteredMaterialYearData = this._MaterialData.filter((row)=>{
                return row.Year === this._year && row.State !== this.utilsService.deleteState;
            })

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
            this.checkCalcValue(totalRowId, fieldName, calculatedValue, indexValue, this._TotalDataName);
        })
        sumMaterialArray.forEach((fieldName)=>{
            let calculatedValue = this.dataCalcService.sumResourceTotal(filteredMaterialYearData, fieldName);
            this.checkCalcValue(totalRowId, fieldName, calculatedValue, indexValue, this._TotalDataName);
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
            this.checkCalcValue(totalRowId, fieldName, calculatedValue, indexValue, this._TotalDataName);
        })


    }

    checkCalcValue(ItemId: number, 
                    field:string, 
                    updatedValue:number, 
                    indexValue:number, 
                    tableName:string){
        if (indexValue>=0 && 
            this.hasOwnProperty(tableName) &&
            this[tableName].hasOwnProperty(indexValue) &&
            this[tableName][indexValue].hasOwnProperty(field) &&
            this[tableName][indexValue][field] !== Number(updatedValue)) {
            
            // update the table with the new value
            this[tableName][indexValue][field] = Number(updatedValue)

            // update state of row
            this.updateState(indexValue, this.utilsService.updateState, tableName);

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
                this.updateState(indexValue, this.utilsService.updateState,this._ResourceDataName)
                this.markChange(indexValue, rowItem.ItemId, field, this._ResourceDataName);
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

        if (this[tableName] &&
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

    markChange(indexValue:number, objId: number, fieldName: string, tableName: string){
        let highlight:any = {
            ItemId: objId,
            fieldName: fieldName
        }
        this[tableName][indexValue]['Highlights'].push(highlight)
        return
    }
}