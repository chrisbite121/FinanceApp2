import { Injectable, Inject } from '@angular/core'

import { IDataModel } from '../model/data.model'
import { ITotalModel } from '../model/total.model'

import { Observable } from 'rxjs/RX';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

//import { JQUERY_TOKEN } from './jquery.service'
import { DataApiService } from './data-api.service'
import { HistoryService } from './history.service'
import { DataCalcService } from './data-calc.service'

import { SettingsService } from './settings.service'

import { newDataRow } from '../config/new-row'
import { newTotalDataRow } from '../config/new-total'
import { initData } from '../config/data'
import { initTotalData } from '../config/totaldata'
//const PercentageUtilisedData:IDataModel[] = initData;
const newRow:IDataModel = newDataRow;
const newTotalRow: ITotalModel = newTotalDataRow
const totalData: Array<ITotalModel> = initTotalData
const Data:IDataModel[] = initData;

@Injectable()
export class DataContextService {
    private obs: Observable<any>
    private dataStream: Subject<any> = new Subject();
    private totalDataStream: Subject<any> = new Subject();
    // private ctxStream: Subject<any> = new Subject();
    // private ctxObject: any[] = new Array;
    private stateChange: boolean = false;
    private _year: number = 2017;
    private _FinanceData:IDataModel[]
    private _TotalData:ITotalModel[]

    constructor( // @Inject(JQUERY_TOKEN) private jQuery: any,
                private dataService: DataApiService,
                private historyService: HistoryService,
                private dataCalcService: DataCalcService,
                private settingsService: SettingsService){
                    this.init();

                }
    
    init(){
        this.settingsService.getYearStream().subscribe((year:number) => {
            this._year = year;
        })
        this._FinanceData = Data;
        this._TotalData = totalData;
        this.addToHistory();
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

    getData(): void  {
        this.calcValues()
        this.dataStream.next(this._FinanceData);
        this.totalDataStream.next(this._TotalData);
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
        this.calcValues()
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
        this.dataService.saveChanges(this._FinanceData)
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

    calcValues(){
        //reset context
        // this.resetCtxObject()
        this.resetHighlights('_FinanceData');

        //process calculated fields
        this._FinanceData.forEach((rowItem, index, array) => {
            let indexValue = this.findIndex(rowItem.Id);

            //PUForecast
            let updatedPUForecast = this.dataCalcService.puForecast(rowItem);
            this.checkCalcValue(rowItem, 'PUForecast',updatedPUForecast, indexValue);
            //AHTotalHours
            let updatedAHTotalHours = this.dataCalcService.ahTotalHours(rowItem);
            this.checkCalcValue(rowItem, 'AHTotalHours',updatedAHTotalHours, indexValue);
            //UpdatedPRJan
            let updatedPRJan = this.dataCalcService.prMonth(rowItem, 'January');
            this.checkCalcValue(rowItem, 'PRJan',updatedPRJan, indexValue);
            //UpdatedPRFeb
            let updatedPRFeb = this.dataCalcService.prMonth(rowItem, 'Febuary');
            this.checkCalcValue(rowItem, 'PRFeb',updatedPRFeb, indexValue);
            //UpdatedPRMar
            let updatedPRMar = this.dataCalcService.prMonth(rowItem, 'March');
            this.checkCalcValue(rowItem, 'PRMar',updatedPRMar, indexValue);
            //UpdatedPRApr
            let updatedPRApr = this.dataCalcService.prMonth(rowItem, 'April');
            this.checkCalcValue(rowItem, 'PRApr', updatedPRApr, indexValue);
            //UpdatedPRMay
            let updatedPRMay = this.dataCalcService.prMonth(rowItem, 'May');
            this.checkCalcValue(rowItem, 'PRMay', updatedPRMay, indexValue); 
            //UpdatedPRJun
            let updatedPRJun = this.dataCalcService.prMonth(rowItem, 'June');
            this.checkCalcValue(rowItem, 'PRJun', updatedPRJun, indexValue);
            //UpdatedPRJul
            let updatedPRJul = this.dataCalcService.prMonth(rowItem, 'July');
            this.checkCalcValue(rowItem, 'PRJul', updatedPRJul, indexValue);
            //UpdatedPRAug
            let updatedPRAug = this.dataCalcService.prMonth(rowItem, 'August');
            this.checkCalcValue(rowItem, 'PRAug', updatedPRAug, indexValue); 
            //UpdatedPRSep
            let updatedPRSep = this.dataCalcService.prMonth(rowItem, 'September');
            this.checkCalcValue(rowItem, 'PRSep', updatedPRSep, indexValue);
            //UpdatedPROct
            let updatedPROct = this.dataCalcService.prMonth(rowItem, 'October');
            this.checkCalcValue(rowItem, 'PROct', updatedPROct, indexValue);
            //UpdatedPRNov
            let updatedPRNov = this.dataCalcService.prMonth(rowItem, 'November');
            this.checkCalcValue(rowItem, 'PRNov', updatedPRNov, indexValue);
            //UpdatedPRDec
            let updatedPRDec = this.dataCalcService.prMonth(rowItem, 'December');
            this.checkCalcValue(rowItem, 'PRDec', updatedPRDec, indexValue);
            //UpdatedPRDec
            let updatedPRYtdTotal = this.dataCalcService.prYtdTotal(rowItem);
            this.checkCalcValue(rowItem, 'PRYtdTotal', updatedPRYtdTotal, indexValue);
            //Lbe Value
            let updatedPRLbe = this.dataCalcService.prLbe(rowItem);
            this.checkCalcValue(rowItem, 'PRLbe', updatedPRLbe, indexValue);
            //Ytd Variance to Budget
            let updatedPRYtdVarianceToBudget = this.dataCalcService.prYtdVarianceToBudget(rowItem);
            this.checkCalcValue(rowItem, 'PRYtdVarianceToBudget', updatedPRYtdVarianceToBudget, indexValue);            
            //Forecasted Ytd Variance to Budget
            let updatedPRForecastVarianceToBudget = this.dataCalcService.prForecastVarianceToBudget(rowItem);
            this.checkCalcValue(rowItem, 'PRForecastVarianceToBudget', updatedPRForecastVarianceToBudget, indexValue);
            //TSJan
            let updatedTSJan = this.dataCalcService.tsMonth(rowItem, 'January');
            this.checkCalcValue(rowItem, 'TSJan', updatedTSJan, indexValue);  
            //TSFeb
            let updatedTSFeb = this.dataCalcService.tsMonth(rowItem, 'Febuary');
            this.checkCalcValue(rowItem, 'TSFeb', updatedTSFeb, indexValue);
            //TSMar
            let updatedTSMar = this.dataCalcService.tsMonth(rowItem, 'March');
            this.checkCalcValue(rowItem, 'TSMar', updatedTSMar, indexValue);
            //TSApr
            let updatedTSApr = this.dataCalcService.tsMonth(rowItem, 'April');
            this.checkCalcValue(rowItem, 'TSApr', updatedTSApr, indexValue);
            //TSMay
            let updatedTSMay = this.dataCalcService.tsMonth(rowItem, 'May');
            this.checkCalcValue(rowItem, 'TSMay', updatedTSMay, indexValue);
            //TSJune
            let updatedTSJun = this.dataCalcService.tsMonth(rowItem, 'June');
            this.checkCalcValue(rowItem, 'TSJun', updatedTSJun, indexValue);
            //TSJuly
            let updatedTSJul = this.dataCalcService.tsMonth(rowItem, 'July');
            this.checkCalcValue(rowItem, 'TSJul', updatedTSJul, indexValue);
            //TSAugust
            let updatedTSAug = this.dataCalcService.tsMonth(rowItem, 'August');
            this.checkCalcValue(rowItem, 'TSAug', updatedTSAug, indexValue);
            //TSSeptember
            let updatedTSSep = this.dataCalcService.tsMonth(rowItem, 'September');
            this.checkCalcValue(rowItem, 'TSSep', updatedTSSep, indexValue);
            //TSOctober
            let updatedTSOct = this.dataCalcService.tsMonth(rowItem, 'October');
            this.checkCalcValue(rowItem, 'TSOct', updatedTSOct, indexValue);
            //TSNovember
            let updatedTSNov = this.dataCalcService.tsMonth(rowItem, 'November');
            this.checkCalcValue(rowItem, 'TSNov', updatedTSNov, indexValue);
            //TSDecember
            let updatedTSDec = this.dataCalcService.tsMonth(rowItem, 'December');
            this.checkCalcValue(rowItem, 'TSDec', updatedTSDec, indexValue);                        
            //TS Forecast
            let updatedTSForecast = this.dataCalcService.tsForecast(rowItem);
            this.checkCalcValue(rowItem, 'TSForecast', updatedTSForecast, indexValue);
            //ATS YTD Total
            let updatedATSYtdTotal = this.dataCalcService.atsYtdTotal(rowItem);
            this.checkCalcValue(rowItem, 'ATSYtdTotal', updatedATSYtdTotal, indexValue);
            //RTS Jan
            let updatedRTSJan = this.dataCalcService.rtsMonth(rowItem, 'January');
            this.checkCalcValue(rowItem, 'RTSJan', updatedRTSJan, indexValue); 
            //RTS Feb
            let updatedRTSFeb = this.dataCalcService.rtsMonth(rowItem, 'Febuary');
            this.checkCalcValue(rowItem, 'RTSFeb', updatedRTSFeb, indexValue); 
            //RTS March
            let updatedRTSMar = this.dataCalcService.rtsMonth(rowItem, 'March');
            this.checkCalcValue(rowItem, 'RTSMar', updatedRTSMar, indexValue);
            //RTS April
            let updatedRTSApr = this.dataCalcService.rtsMonth(rowItem, 'April');
            this.checkCalcValue(rowItem, 'RTSApr', updatedRTSApr, indexValue);
            //RTS May
            let updatedRTSMay = this.dataCalcService.rtsMonth(rowItem, 'May');
            this.checkCalcValue(rowItem, 'RTSMay', updatedRTSMay, indexValue); 
            //RTS Jun
            let updatedRTSJun = this.dataCalcService.rtsMonth(rowItem, 'June');
            this.checkCalcValue(rowItem, 'RTSJun', updatedRTSJun, indexValue);
            //RTS July
            let updatedRTSJul = this.dataCalcService.rtsMonth(rowItem, 'July');
            this.checkCalcValue(rowItem, 'RTSJul', updatedRTSJul, indexValue);
            //RTS August
            let updatedRTSAug = this.dataCalcService.rtsMonth(rowItem, 'August');
            this.checkCalcValue(rowItem, 'RTSAug', updatedRTSAug, indexValue);
            //RTS September
            let updatedRTSSep = this.dataCalcService.rtsMonth(rowItem, 'September');
            this.checkCalcValue(rowItem, 'RTSSep', updatedRTSSep, indexValue);
            //RTS October
            let updatedRTSOct = this.dataCalcService.rtsMonth(rowItem, 'October');
            this.checkCalcValue(rowItem, 'RTSOct', updatedRTSOct, indexValue);
            //RTS November
            let updatedRTSNov = this.dataCalcService.rtsMonth(rowItem, 'November');
            this.checkCalcValue(rowItem, 'RTSNov', updatedRTSNov, indexValue); 
            //RTS December
            let updatedRTSDec = this.dataCalcService.rtsMonth(rowItem, 'December');
            this.checkCalcValue(rowItem, 'RTSDec', updatedRTSDec, indexValue);
            //RTS YTD Total
            let updatedRTSYtdTotal = this.dataCalcService.rtsYtdTotal(rowItem);
            this.checkCalcValue(rowItem, 'RTSYtdTotal', updatedRTSYtdTotal, indexValue);
            //RTS Lbe
            let updatedRTSLbe = this.dataCalcService.rtsLbe(rowItem);
            this.checkCalcValue(rowItem, 'RTSLbe', updatedRTSLbe, indexValue);
            //RTS YTD Variance to Budget
            let updatedRTSYtdVarianceToBudget = this.dataCalcService.rtsYtdVarianceToBudget(rowItem);
            this.checkCalcValue(rowItem, 'RTSYtdVarianceToBudget', updatedRTSYtdVarianceToBudget, indexValue);
            //RTS Variance to Budget
            let updatedRTSVarianceToBudget = this.dataCalcService.rtsVarianceToBudget(rowItem);
            this.checkCalcValue(rowItem, 'RTSVarianceToBudget', updatedRTSVarianceToBudget, indexValue);
            //Mat Ytd Total
            let updatedMatYtdTotal = this.dataCalcService.matYtdTotal(rowItem);
            this.checkCalcValue(rowItem, 'MatYtdTotal', updatedMatYtdTotal, indexValue);
            //Mat Lbe
            let updatedMatLbe = this.dataCalcService.matLbe(rowItem);
            this.checkCalcValue(rowItem, 'MatLbe', updatedMatLbe, indexValue); 
            //MatYtdVarianceToBudget
            let updatedMatYtdVarianceToBudget = this.dataCalcService.matYtdVarianceToBudget(rowItem);
            this.checkCalcValue(rowItem, 'MatYtdVarianceToBudget', updatedMatYtdVarianceToBudget, indexValue);
            //MatVarianceToBudget
            let updatedMatVarianceToBudget = this.dataCalcService.matForecastVarianceToBudget(rowItem);
            this.checkCalcValue(rowItem, 'MatVarianceToBudget', updatedMatVarianceToBudget, indexValue);

                                                
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
            this.checkTotalCalcValue(totalRowId, fieldName, calculatedValue, indexValue, '_TotalData');
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

    checkTotalCalcValue(id: number, field:string, updatedValue:number, indexValue:number, tableName:string){
        if (this[tableName][indexValue][field] !== Number(updatedValue)) {
            this[tableName][indexValue][field] = Number(updatedValue)
            this.updateState(indexValue, 'update', tableName);
            this.markChange(indexValue, id, field, tableName)
        }
    }

    checkCalcValue(rowItem: any,
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