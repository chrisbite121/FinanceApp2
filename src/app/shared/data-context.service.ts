import { Injectable, Inject } from '@angular/core'

//models
import { IDataModel } from '../model/data.model'
import { ITotalModel } from '../model/total.model'
import { IMatModel } from '../model/material.model'

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

//application data
import { newDataRow } from '../config/new-row'
import { newTotalDataRow } from '../config/new-total'
import { initData } from '../config/data'
import { initTotalData } from '../config/totaldata'
import { initMaterialData } from '../config/materialdata'

//const PercentageUtilisedData:IDataModel[] = initData;
const newRow:IDataModel = newDataRow;
const newTotalRow: ITotalModel = newTotalDataRow
const totalData: Array<ITotalModel> = initTotalData
const Data:IDataModel[] = initData;
const matData: Array<IMatModel> = initMaterialData;


@Injectable()
export class DataContextService {
    private obs: Observable<any>
    private dataStream: Subject<any> = new Subject();
    private totalDataStream: Subject<any> = new Subject();
    private materialDataStream: Subject<any> = new Subject();
    // private ctxStream: Subject<any> = new Subject();
    // private ctxObject: any[] = new Array;
    private stateChange: boolean = false;
    private _year: number = 2017;
    private _FinanceData:IDataModel[]
    private _TotalData:ITotalModel[]
    private _MaterialData: IMatModel[]

    constructor( // @Inject(JQUERY_TOKEN) private jQuery: any,
                private commonApiService: CommonApiService,
                private historyService: HistoryService,
                private dataCalcService: DataCalcService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private logService: LogService,
                private healthReportSerivce: HealthReportService){
                    this.init();

                }
    
    init(){
        this.settingsService.getYearStream().subscribe((year:number) => {
            this._year = year;
        })
        //IF HTTP CALL RETURNS NO DATA USE PLACEHOLDER DATA
        this._FinanceData = Data;
        this._TotalData = totalData;
        this._MaterialData = matData;
        this.addToHistory();
    }

    getApiData() {
        let _getDataReport: Array<any>
        _getDataReport = [];

        let _observableArray = [
            this.commonApiService.getItems(this.utilsService.financeAppResourceData, this.utilsService.hostWeb),
            this.commonApiService.getItems(this.utilsService.financeAppMaterialData, this.utilsService.hostWeb),
            this.commonApiService.getItems(this.utilsService.financeAppTotalsData, this.utilsService.hostWeb)
        ]

        let getData$ = Observable.from(_observableArray).mergeAll();

        getData$.subscribe(
            data => {
                if (typeof(data) === 'object' &&
                    data.listName &&
                    data.result &&
                    data.fieldValues) {
                        _getDataReport.push(data)
                        if (data.result == true && data.listName == this.utilsService.financeAppResourceData) {
                            this._FinanceData = data.fieldValues
                            console.log(this._FinanceData)
                        } else if (data.result == false && data.listName == this.utilsService.financeAppResourceData) {
                            //Failed to get Resource Data
                        }

                        if (data.result == true && data.listName == this.utilsService.financeAppMaterialData) {
                            this._MaterialData = data.fieldValues
                            console.log(this._MaterialData)
                        } else if (data.result == false && data.listName == this.utilsService.financeAppMaterialData) {
                            //Failed to get Material Data
                        }

                        if (data.result == true && data.listName == this.utilsService.financeAppTotalsData) {
                            this._TotalData = data.fieldValues
                            console.log(this._TotalData)
                        } else if (data.result == false && data.listName == this.utilsService.financeAppTotalsData) {
                            //Failed to get Totals Data
                        }
                }
            },
            err => {
                this.logService.log(`error calling api service to get data`, this.utilsService.errorStatus, false);
                this.logService.log(err, this.utilsService.errorStatus, false);
            },
            () => {
                this.logService.log('exiting getResourceData function', this.utilsService.infoStatus, true);
                this.healthReportSerivce.getDataReport = _getDataReport
            }            
        )
    }

    submitApiData(){
        let _submitDataReport: Array<any>
        _submitDataReport = [];

        let _financeObservableArray: Array<any>
        let _materialObservableArray: Array<any>
        let _totalObservableArray: Array<any>
        let _observableArray: Array<any>
        
        
        _financeObservableArray = this.prepDataForApi(this._FinanceData, this.utilsService.financeAppResourceData)
        _materialObservableArray = this.prepDataForApi(this._MaterialData, this.utilsService.financeAppMaterialData)
        _totalObservableArray = this.prepDataForApi(this._TotalData, this.utilsService.financeAppTotalsData)

        _observableArray = _financeObservableArray.concat(_materialObservableArray).concat(_totalObservableArray)
        
        let submitData$ = Observable.from(_observableArray).mergeAll()

        submitData$.submit(
            data => {
                if (typeof(data) === 'object' &&
                    data.listName &&
                    data.result &&
                    data.apiCall == 'addItem') {
                        _submitDataReport.push(data)
                        if (data.result === true) {
                           this.logService.log(`item added to list`, this.utilsService.infoStatus, true); 
                        } else {
                            this.logService.log(`failed to add item added to list`, this.utilsService.errorStatus, true);
                        }
                }
                else if (typeof(data) === 'object' &&
                    data.listName &&
                    data.result &&
                    data.apiCall == 'deleteItem') {
                        _submitDataReport.push(data)
                        if (data.result === true) {
                           this.logService.log(`item deleted`, this.utilsService.infoStatus, true); 
                        } else {
                             this.logService.log(`failed to delete item added to list`, this.utilsService.errorStatus, true);
                        }
                }
                else if (typeof(data) === 'object' &&
                    data.listName &&
                    data.result &&
                    data.apiCall == 'updateItem') {
                        _submitDataReport.push(data)
                        if (data.result === true) {
                            this.logService.log(`item updated`, this.utilsService.infoStatus, true); 
                        } else {
                            this.logService.log(`failed to update item`, this.utilsService.errorStatus, true);
                        }
                }
                                            
            },
            err => {
                this.logService.log(`error calling api`, this.utilsService.infoStatus, true);
                this.logService.log(err, this.utilsService.infoStatus, true);
            },
            () => {
                this.logService.log('ending submit data function', this.utilsService.infoStatus, true);
                this.healthReportSerivce.submitDataReport = _submitDataReport;
            }
        )
    }

    public prepDataForApi(data, listName) {
        //data Arry
        let _observableArrary = []

        if (typeof(data) == 'object') {
            data.foreach(element=>{
                let _result;
                if(element.state==this.utilsService.createState) {
                    let fieldArray = this.createFieldArray(element);
                    _observableArrary.push(this.commonApiService.addItem(listName, this.utilsService.hostWeb, fieldArray))
                } else if (element.state == this.utilsService.deleteState) {
                    _observableArrary.push(this.commonApiService.deleteItem(listName, element['itemId'], this.utilsService.hostWeb))
                } else if (element.state == this.updateState) {
                    let fieldsArray = this.createFieldArray(element);
                    _observableArrary.push(this.commonApiService.updateItem(listName, this.utilsService.hostWeb, element['itemId'], fieldsArray))
                } else if (element.state == this.utilsService.inertState) {
                }
            })
            return _observableArrary;
        }
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


    getDataStream(): Observable<any> {
        let filteredDataStream = this.dataStream.asObservable().map((data, index) => {
            return data.filter((row:any)=> row.State !== 'delete' && row.Year === this._year)
        })
        return filteredDataStream
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
        this.calcFinanceValues()
        this.dataStream.next(this._FinanceData);
        this.totalDataStream.next(this._TotalData);
        this.materialDataStream.next(this._MaterialData);
    }

    updateTable(event: any): void {
        console.log(event);
        //get data
        let objectId = event.data.Id;
        let columnName = event.colDef.field;
        let newValue = event.value
        //find index Value in Data Object
        let indexValue = this.findIndex(objectId);
        //convert number strings to numbers
        if (Number(newValue)) {
            //update Data object
            this._FinanceData[indexValue][columnName] = +newValue;
        }
        //update values
        this.updateState(indexValue, 'update','_FinanceData');
        this.calcFinanceValues()
        this.calcMaterialValues()
        this.calcTotalValues()

        //emit values
        this.dataStream.next(this._FinanceData);
        this.totalDataStream.next(this._TotalData);
        
        if (this.stateChange) this.addToHistory()
        
        //reset statechange
        this.stateChange = false;

    }

    addRow(){
        let _year:number = this._year;
        let _Id:number = this._FinanceData.length + 1;
        let _newRow:IDataModel = JSON.parse(JSON.stringify(newRow));
        _newRow.Year = _year
        _newRow.Id = _Id

        this._FinanceData.push(_newRow)

        //emit values
        this.dataStream.next(this._FinanceData);
        this.addToHistory()
        
        //reset statechange
        this.stateChange = false;        
    }

    deleteRow(id: number){
        let indexValue: number
        //find Row in Data Object
        indexValue = this.findIndex(id);
        if(id >= 0) {
        this.updateState(indexValue, 'delete','_FinanceData');
        //this.PercentageUtilisedData.splice(indexValue, 1);
        }   
    
        //emit values
        this.dataStream.next(this._FinanceData);
        this.addToHistory()
        
        //reset statechange
        this.stateChange = false;
   
    }

    saveUpdates(){
        //to be replaced by commonApiService calls
        //this.coreService.saveChanges(this._FinanceData)
    }

    findIndex(objectId: number) {
       return this._FinanceData.findIndex((element:any):any => {
                    return element.Id == +objectId
                })       
    }

    findTotalsIndex(year: number) {
       return this._TotalData.findIndex((element:any):any => {
                    return element.Year == +year
                });
    }

    undo(){
        if (this.historyService.canUndo) {
            this._FinanceData = this.historyService.undo()
            //emit
            this.dataStream.next(this._FinanceData);
            
            //adding this is causing a bug
            // this.calcTotalValues();
            // this.dataStream.next(this._TotalData);
        }
    }

    redo(){
        if (this.historyService.canRedo) {
            this._FinanceData = this.historyService.redo()
            //emit 
            this.dataStream.next(this._FinanceData);
            
            //adding this is causing a bug
            // this.calcTotalValues();
            // this.dataStream.next(this._TotalData);    
        }
    }

    addToHistory(){
        this.historyService.addEntry(this._FinanceData);
    }

    calcFinanceValues(){
        //reset context
        // this.resetCtxObject()
        this.resetHighlights('_FinanceData');

        //process calculated fields
        this._FinanceData.forEach((rowItem, index, array) => {
            let indexValue = this.findIndex(rowItem.Id);

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
        //reset context
        // this.resetCtxObject()
        let tableName = '_MaterialData'
        this.resetHighlights(tableName);

        //process calculated fields
        this._MaterialData.forEach((rowItem, index, array) => {
            let indexValue = this.findIndex(rowItem.Id);
            let rowId = this._MaterialData[indexValue].Id;
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
        });
    }

    calcTotalValues(){
        //Reset Highlights
        this.resetHighlights('_TotalData');
        //filter on current year
        let filteredYearData = this._FinanceData.filter((row)=>{
            return row.Year === this._year;
        })
        let indexValue = this.findTotalsIndex(this._year);
        let totalRowId = this._TotalData[indexValue].Id;

        let sumArray = [
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

        sumArray.forEach((fieldName)=>{
            let calculatedValue = this.dataCalcService.sumTotal(filteredYearData, fieldName);
            this.checkCalcValue(totalRowId, fieldName, calculatedValue, indexValue, '_TotalData');
        })
        // //updatedPRBudgetToal
        // let updatedPRBudgetTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRBudget')
        // this.checkTotalCalcValue(totalRowId,'PRBudget', updatedPRBudgetTotal, indexValue, '_TotalData');
        // let updatedPRJanTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRJan')
        // this.checkTotalCalcValue(totalRowId,'PRJan', updatedPRJanTotal, indexValue, '_TotalData');
        // let updatedPRFebTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRFeb')
        // this.checkTotalCalcValue(totalRowId,'PRFeb', updatedPRFebTotal, indexValue, '_TotalData');
        // let updatedPRMarTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRMar')
        // this.checkTotalCalcValue(totalRowId,'PRMar', updatedPRMarTotal, indexValue, '_TotalData');
        // let updatedPRAprTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRApr')
        // this.checkTotalCalcValue(totalRowId,'PRApr', updatedPRAprTotal, indexValue, '_TotalData');
        // let updatedPRMayTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRMay')
        // this.checkTotalCalcValue(totalRowId,'PRMay', updatedPRMayTotal, indexValue, '_TotalData');
        // let updatedPRJunTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRJun')
        // this.checkTotalCalcValue(totalRowId,'PRJun', updatedPRJunTotal, indexValue, '_TotalData');
        // let updatedPRJulTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRJul')
        // this.checkTotalCalcValue(totalRowId,'PRJul', updatedPRJulTotal, indexValue, '_TotalData');
        // let updatedPRAugTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRAug')
        // this.checkTotalCalcValue(totalRowId,'PRAug', updatedPRAugTotal, indexValue, '_TotalData');
        // let updatedPRSepTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRSep')
        // this.checkTotalCalcValue(totalRowId,'PRSep', updatedPRSepTotal, indexValue, '_TotalData');
        // let updatedPROctTotal = this.dataCalcService.sumTotal(filteredYearData, 'PROct')
        // this.checkTotalCalcValue(totalRowId,'PROct', updatedPROctTotal, indexValue, '_TotalData');
        // let updatedPRNovTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRNov')
        // this.checkTotalCalcValue(totalRowId,'PRNov', updatedPRNovTotal, indexValue, '_TotalData');
        // let updatedPRDecTotal = this.dataCalcService.sumTotal(filteredYearData, 'PRDec')
        // this.checkTotalCalcValue(totalRowId,'PRDec', updatedPRDecTotal, indexValue, '_TotalData');

    }

    checkCalcValue(id: number, field:string, updatedValue:number, indexValue:number, tableName:string){
        if (this[tableName][indexValue][field] !== Number(updatedValue)) {
            this[tableName][indexValue][field] = Number(updatedValue)
            this.updateState(indexValue, 'update', tableName);
            this.markChange(indexValue, id, field, tableName)
        }
    }

    //to be replaced by above generic function
    checkCalcValue2(rowItem: any,
                   field: string, 
                   calcValue: number, 
                   indexValue: number){
            if (rowItem[field] !== calcValue) {
                rowItem[field] = calcValue
                this.updateState(indexValue, 'update','_FinanceData')
                this.markChange(indexValue, rowItem.Id, field, '_FinanceData');
            } 

    }
    resetHighlights(tableName: string){
        if (this[tableName].length > 0){
            this[tableName].forEach((rowData:any)=> {
                rowData.Highlights = [];
            })   
        }
        return        
    }

    updateState(indexId: number, state: string, tableName: string){
        this.stateChange = true;
        let currentState = this[tableName][indexId]['state'];
        //don't mark newly created items as update
        if (currentState == 'create' && state == 'update') {
            //do nothing
        } else {
            this[tableName][indexId]['State'] = state;
        }
        
        return
    }

    markChange(indexValue:number, objId: number, fieldName: string, tableName: string){
        let highlight:any = {
            Id: objId,
            fieldName: fieldName
        }
        //this._FinanceData[indexValue]['Highlights'].push(highlight)
        this[tableName][indexValue]['Highlights'].push(highlight)
        return
    }        
}