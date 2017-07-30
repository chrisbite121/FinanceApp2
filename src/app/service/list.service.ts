import { Injectable } from '@angular/core'
import { LogService } from './log.service'
import { UtilsService } from './utils.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

import { IFieldSpecModel } from '../model/data-validation.model'

@Injectable()
export class ListService {
    private FinanceAppResourceData: Array<IFieldSpecModel>
    private FinanceAppMaterialData:  Array<IFieldSpecModel>
    private FinanceAppTotalsData: Array<IFieldSpecModel>
    private FinanceAppSettingsData: Array<IFieldSpecModel>
    private FinanceAppLogsData: Array<IFieldSpecModel>
    private FinanceAppWorkingDaysData: Array<IFieldSpecModel>
    private FinanceAppSummaryData: Array<IFieldSpecModel>
    private listContextType: object
    private _false = "FALSE"
    private _true = "TRUE"
    private _number = "Number"
    private _text = "Text"
    private _currency = "Currency"
    private _note = "Note"
    private _boolean = "Boolean"
    private _error = 'error'
    private _info = 'info'
    private _datetime = 'DateTime'

    constructor(private logService: LogService,
                private utilsService: UtilsService){
        this.init();
    }

    init(){
        this.FinanceAppResourceData = [
            { Id: 1, Name: "ItemId", Type: this._text, Required: this._false },
            { Id: 2, Name: "Year", Type: this._number, Required: this._false },
            { Id: 3, Name: "Role", Type: this._text, Required: this._false },
            { Id: 4, Name: "Name", Type: this._text, Required: this._false },
            { Id: 5, Name: "ContractedDayHours", Type: this._number, Required: this._false },
            { Id: 6, Name: "PUJan", Type: this._currency, Required: this._false },
            { Id: 7, Name: "PUFeb", Type: this._currency, Required: this._false },
            { Id: 8, Name: "PUMar", Type: this._currency, Required: this._false },
            { Id: 9, Name: "PUApr", Type: this._currency, Required: this._false },
            { Id: 10, Name: "PUMay", Type: this._currency, Required: this._false },
            { Id: 11, Name: "PUJun", Type: this._currency, Required: this._false },
            { Id: 12, Name: "PUJul", Type: this._currency, Required: this._false },
            { Id: 13, Name: "PUAug", Type: this._currency, Required: this._false },
            { Id: 14, Name: "PUSep", Type: this._currency, Required: this._false },
            { Id: 15, Name: "PUOct", Type: this._currency, Required: this._false },
            { Id: 16, Name: "PUNov", Type: this._currency, Required: this._false },
            { Id: 17, Name: "PUDec", Type: this._currency, Required: this._false },
            { Id: 18, Name: "PUForecast", Type: this._currency, Required: this._false },
            { Id: 19, Name: "AHJan", Type: this._currency, Required: this._false },
            { Id: 20, Name: "AHFeb", Type: this._currency, Required: this._false },
            { Id: 21, Name: "AHMar", Type: this._currency, Required: this._false },
            { Id: 22, Name: "AHApr", Type: this._currency, Required: this._false },
            { Id: 23, Name: "AHMay", Type: this._currency, Required: this._false },
            { Id: 24, Name: "AHJun", Type: this._currency, Required: this._false },
            { Id: 25, Name: "AHJul", Type: this._currency, Required: this._false },
            { Id: 26, Name: "AHAug", Type: this._currency, Required: this._false },
            { Id: 27, Name: "AHSep", Type: this._currency, Required: this._false },
            { Id: 28, Name: "AHOct", Type: this._currency, Required: this._false },
            { Id: 29, Name: "AHNov", Type: this._currency, Required: this._false },
            { Id: 30, Name: "AHDec", Type: this._currency, Required: this._false },
            { Id: 32, Name: "AHTotalHours", Type: this._number, Required: this._false },
            { Id: 33, Name: "AHOverHours", Type: this._number, Required: this._false },
            { Id: 34, Name: "PRDayRate", Type: this._currency, Required: this._false },
            { Id: 35, Name: "PRBudget", Type: this._currency, Required: this._false },
            { Id: 36, Name: "PRJan", Type: this._currency, Required: this._false },
            { Id: 37, Name: "PRFeb", Type: this._currency, Required: this._false },
            { Id: 38, Name: "PRMar", Type: this._currency, Required: this._false },
            { Id: 39, Name: "PRApr", Type: this._currency, Required: this._false },
            { Id: 40, Name: "PRMay", Type: this._currency, Required: this._false },
            { Id: 41, Name: "PRJun", Type: this._currency, Required: this._false },
            { Id: 42, Name: "PRJul", Type: this._currency, Required: this._false },
            { Id: 43, Name: "PRAug", Type: this._currency, Required: this._false },
            { Id: 44, Name: "PRSep", Type: this._currency, Required: this._false },
            { Id: 45, Name: "PROct", Type: this._currency, Required: this._false },
            { Id: 46, Name: "PRNov", Type: this._currency, Required: this._false },
            { Id: 47, Name: "PRDec", Type: this._currency, Required: this._false },
            { Id: 48, Name: "PRYtdTotal", Type: this._currency, Required: this._false },
            { Id: 49, Name: "PRLbe", Type: this._currency, Required: this._false },
            { Id: 50, Name: "PRYtdVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 51, Name: "PRForecastVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 52, Name: "TSDayRate", Type: this._currency, Required: this._false },
            { Id: 53, Name: "TSJan", Type: this._currency, Required: this._false },
            { Id: 54, Name: "TSFeb", Type: this._currency, Required: this._false },
            { Id: 55, Name: "TSMar", Type: this._currency, Required: this._false },
            { Id: 56, Name: "TSApr", Type: this._currency, Required: this._false },
            { Id: 57, Name: "TSMay", Type: this._currency, Required: this._false },
            { Id: 58, Name: "TSJun", Type: this._currency, Required: this._false },
            { Id: 59, Name: "TSJul", Type: this._currency, Required: this._false },
            { Id: 60, Name: "TSAug", Type: this._currency, Required: this._false },
            { Id: 61, Name: "TSSep", Type: this._currency, Required: this._false },
            { Id: 62, Name: "TSOct", Type: this._currency, Required: this._false },
            { Id: 63, Name: "TSNov", Type: this._currency, Required: this._false },
            { Id: 64, Name: "TSDec", Type: this._currency, Required: this._false },
            { Id: 65, Name: "TSForecast", Type: this._currency, Required: this._false },
            { Id: 66, Name: "ATSJan", Type: this._currency, Required: this._false },
            { Id: 67, Name: "ATSFeb", Type: this._currency, Required: this._false },
            { Id: 68, Name: "ATSMar", Type: this._currency, Required: this._false },
            { Id: 69, Name: "ATSApr", Type: this._currency, Required: this._false },
            { Id: 70, Name: "ATSMay", Type: this._currency, Required: this._false },
            { Id: 71, Name: "ATSJun", Type: this._currency, Required: this._false },
            { Id: 72, Name: "ATSJul", Type: this._currency, Required: this._false },
            { Id: 73, Name: "ATSAug", Type: this._currency, Required: this._false },
            { Id: 74, Name: "ATSSep", Type: this._currency, Required: this._false },
            { Id: 75, Name: "ATSOct", Type: this._currency, Required: this._false },
            { Id: 76, Name: "ATSNov", Type: this._currency, Required: this._false },
            { Id: 77, Name: "ATSDec", Type: this._currency, Required: this._false },
            { Id: 78, Name: "ATSYtdTotal", Type: this._currency, Required: this._false },
            { Id: 79, Name: "RTSBudget", Type: this._currency, Required: this._false },
            { Id: 80, Name: "RTSJan", Type: this._currency, Required: this._false },
            { Id: 81, Name: "RTSFeb", Type: this._currency, Required: this._false },
            { Id: 82, Name: "RTSMar", Type: this._currency, Required: this._false },
            { Id: 83, Name: "RTSApr", Type: this._currency, Required: this._false },
            { Id: 84, Name: "RTSMay", Type: this._currency, Required: this._false },
            { Id: 85, Name: "RTSJun", Type: this._currency, Required: this._false },
            { Id: 86, Name: "RTSJul", Type: this._currency, Required: this._false },
            { Id: 87, Name: "RTSAug", Type: this._currency, Required: this._false },
            { Id: 88, Name: "RTSSep", Type: this._currency, Required: this._false },
            { Id: 89, Name: "RTSOct", Type: this._currency, Required: this._false },
            { Id: 90, Name: "RTSNov", Type: this._currency, Required: this._false },
            { Id: 91, Name: "RTSDec", Type: this._currency, Required: this._false },
            { Id: 92, Name: "RTSYtdTotal", Type: this._currency, Required: this._false },
            { Id: 93, Name: "RTSLbe", Type: this._currency, Required: this._false },
            { Id: 94, Name: "RTSYtdVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 94, Name: "RTSVarianceToBudget", Type: this._currency, Required: this._false },
            
        ]

        this.FinanceAppTotalsData = [
            { Id: 1, Name: "ItemId", Type: this._text, Required: this._false },
            { Id: 2, Name: "Year", Type: this._number, Required: this._false },
            { Id: 3, Name: "PRBudget", Type: this._currency, Required: this._false },
            { Id: 4, Name: "PRJan", Type: this._currency, Required: this._false },
            { Id: 5, Name: "PRFeb", Type: this._currency, Required: this._false },
            { Id: 6, Name: "PRMar", Type: this._currency, Required: this._false },
            { Id: 7, Name: "PRApr", Type: this._currency, Required: this._false },
            { Id: 8, Name: "PRMay", Type: this._currency, Required: this._false },
            { Id: 9, Name: "PRJun", Type: this._currency, Required: this._false },
            { Id: 10, Name: "PRJul", Type: this._currency, Required: this._false },
            { Id: 11, Name: "PRAug", Type: this._currency, Required: this._false },
            { Id: 12, Name: "PRSep", Type: this._currency, Required: this._false },
            { Id: 13, Name: "PROct", Type: this._currency, Required: this._false },
            { Id: 14, Name: "PRNov", Type: this._currency, Required: this._false },
            { Id: 15, Name: "PRDec", Type: this._currency, Required: this._false },
            { Id: 16, Name: "PRYtdTotal", Type: this._currency, Required: this._false },
            { Id: 17, Name: "PRLbe", Type: this._currency, Required: this._false },
            { Id: 18, Name: "PRYtdVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 19, Name: "PRForecastVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 20, Name: "RTSBudget", Type: this._currency, Required: this._false },
            { Id: 21, Name: "RTSJan", Type: this._currency, Required: this._false },
            { Id: 22, Name: "RTSFeb", Type: this._currency, Required: this._false },
            { Id: 23, Name: "RTSMar", Type: this._currency, Required: this._false },
            { Id: 24, Name: "RTSApr", Type: this._currency, Required: this._false },
            { Id: 25, Name: "RTSMay", Type: this._currency, Required: this._false },
            { Id: 26, Name: "RTSJun", Type: this._currency, Required: this._false },
            { Id: 27, Name: "RTSJul", Type: this._currency, Required: this._false },
            { Id: 28, Name: "RTSAug", Type: this._currency, Required: this._false },
            { Id: 29, Name: "RTSSep", Type: this._currency, Required: this._false },
            { Id: 30, Name: "RTSOct", Type: this._currency, Required: this._false },
            { Id: 31, Name: "RTSNov", Type: this._currency, Required: this._false },
            { Id: 32, Name: "RTSDec", Type: this._currency, Required: this._false },
            { Id: 33, Name: "RTSYtdTotal", Type: this._currency, Required: this._false },
            { Id: 34, Name: "RTSLbe", Type: this._currency, Required: this._false },
            { Id: 35, Name: "RTSYtdVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 36, Name: "RTSVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 37, Name: "MatBudget", Type: this._currency, Required: this._false },
            { Id: 38, Name: "MatJan", Type: this._currency, Required: this._false },
            { Id: 39, Name: "MatFeb", Type: this._currency, Required: this._false },
            { Id: 40, Name: "MatMar", Type: this._currency, Required: this._false },
            { Id: 41, Name: "MatApr", Type: this._currency, Required: this._false },
            { Id: 44, Name: "MatMay", Type: this._currency, Required: this._false },
            { Id: 45, Name: "MatJun", Type: this._currency, Required: this._false },
            { Id: 46, Name: "MatJul", Type: this._currency, Required: this._false },
            { Id: 47, Name: "MatAug", Type: this._currency, Required: this._false },
            { Id: 48, Name: "MatSep", Type: this._currency, Required: this._false },
            { Id: 49, Name: "MatOct", Type: this._currency, Required: this._false },
            { Id: 50, Name: "MatNov", Type: this._currency, Required: this._false },
            { Id: 51, Name: "MatDec", Type: this._currency, Required: this._false },
            { Id: 52, Name: "MatYtdTotal", Type: this._currency, Required: this._false },
            { Id: 53, Name: "MatLbe", Type: this._currency, Required: this._false },
            { Id: 54, Name: "MatYtdVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 55, Name: "MatForecastVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 56, Name: "TProjectBudget", Type: this._currency, Required: this._false },
            { Id: 57, Name: "TJan", Type: this._currency, Required: this._false },
            { Id: 58, Name: "TFeb", Type: this._currency, Required: this._false },
            { Id: 59, Name: "TMar", Type: this._currency, Required: this._false },
            { Id: 60, Name: "TApr", Type: this._currency, Required: this._false },
            { Id: 61, Name: "TMay", Type: this._currency, Required: this._false },
            { Id: 62, Name: "TJun", Type: this._currency, Required: this._false },
            { Id: 63, Name: "TJul", Type: this._currency, Required: this._false },
            { Id: 64, Name: "TAug", Type: this._currency, Required: this._false },
            { Id: 65, Name: "TSep", Type: this._currency, Required: this._false },
            { Id: 66, Name: "TOct", Type: this._currency, Required: this._false },
            { Id: 67, Name: "TNov", Type: this._currency, Required: this._false },
            { Id: 68, Name: "TDec", Type: this._currency, Required: this._false },
            { Id: 69, Name: "TYtdTotal", Type: this._currency, Required: this._false },
            { Id: 70, Name: "TLbe", Type: this._currency, Required: this._false },
            { Id: 70, Name: "TYtdVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 71, Name: "TVarianceToBudget", Type: this._currency, Required: this._false },
        ]

        this.FinanceAppMaterialData = [
            { Id: 1, Name: "ItemId", Type: this._text, Required: this._false },
            { Id: 2, Name: "Year", Type: this._number, Required: this._false },
            { Id: 3, Name: "Mat", Type: this._text, Required: this._false },
            { Id: 4, Name: "MatBudget", Type: this._currency, Required: this._false },
            { Id: 5, Name: "MatJan", Type: this._currency, Required: this._false },
            { Id: 6, Name: "MatFeb", Type: this._currency, Required: this._false },
            { Id: 7, Name: "MatMar", Type: this._currency, Required: this._false },
            { Id: 8, Name: "MatApr", Type: this._currency, Required: this._false },
            { Id: 9, Name: "MatMay", Type: this._currency, Required: this._false },
            { Id: 10, Name: "MatJun", Type: this._currency, Required: this._false },
            { Id: 11, Name: "MatJul", Type: this._currency, Required: this._false },
            { Id: 12, Name: "MatAug", Type: this._currency, Required: this._false },
            { Id: 13, Name: "MatSep", Type: this._currency, Required: this._false },
            { Id: 14, Name: "MatOct", Type: this._currency, Required: this._false },
            { Id: 15, Name: "MatNov", Type: this._currency, Required: this._false },
            { Id: 16, Name: "MatDec", Type: this._currency, Required: this._false },
            { Id: 17, Name: "MatYtdTotal", Type: this._currency, Required: this._false },
            { Id: 18, Name: "MatLbe", Type: this._currency, Required: this._false },
            { Id: 19, Name: "MatYtdVarianceToBudget", Type: this._currency, Required: this._false },
            { Id: 20, Name: "MatVarianceToBudget", Type: this._currency, Required: this._false },
        ]

        this.FinanceAppSettingsData = [
            { Id: 1, Name: "ItemId", Type: this._text, Required: this._false },
            { Id: 2, Name: "Years", Type: this._note, Required: this._false },
            { Id: 3, Name: "Year", Type: this._number, Required: this._false },
            { Id: 4, Name: "AutoSave", Type: this._boolean, Required: this._false },
            { Id: 5, Name: "HighlightColour", Type: this._text, Required: this._false },
            { Id: 6, Name: "ListAutoCheck", Type: this._boolean, Required: this._false },
            { Id: 7, Name: "SharePointMode", Type: this._boolean, Required: this._false },
            { Id: 8, Name: "WorkingHoursInDay", Type: this._number, Required: this._false },
            { Id: 9, Name: "TsWeighting", Type: this._number, Required: this._false },
            { Id: 10, Name: "Persist", Type: this._boolean, Required: this._false },
            { Id: 11, Name: "Verbose", Type: this._boolean, Required: this._false },
            { Id: 12, Name: "HeaderColour", Type: this._text, Required: this._false },
            { Id: 13, Name: "HeaderFontColour", Type: this._text, Required: this._false }
        ]

        this.FinanceAppLogsData = [
            { Id: 1, Name: "ItemId", Type: this._text, Required: this._false },
            { Id: 2, Name: "Type", Type: this._text, Required: this._false },
            { Id: 3, Name: "Description", Type: this._text, Required: this._false },
            { Id: 4, Name: "Timestamp", Type: this._datetime, Required: this._false },
            { Id: 5, Name: "Verbose", Type: this._boolean, Required: this._false }
        ]

        this.FinanceAppWorkingDaysData = [
            { Id: 1, Name: "Year", Type: this._number, Required: this._false },
            { Id: 2, Name: "Placeholder", Type: this._text, Required: this._false },
            { Id: 3, Name: "January", Type: this._number, Required: this._false },
            { Id: 4, Name: "Febuary", Type: this._number, Required: this._false },
            { Id: 5, Name: "March", Type: this._number, Required: this._false },
            { Id: 6, Name: "April", Type: this._number, Required: this._false },
            { Id: 7, Name: "May", Type: this._number, Required: this._false },
            { Id: 8, Name: "June", Type: this._number, Required: this._false },
            { Id: 9, Name: "July", Type: this._number, Required: this._false },
            { Id: 10, Name: "August", Type: this._number, Required: this._false },
            { Id: 11, Name: "September", Type: this._number, Required: this._false },
            { Id: 12, Name: "October", Type: this._number, Required: this._false },
            { Id: 13, Name: "November", Type: this._number, Required: this._false },
            { Id: 14, Name: "December", Type: this._number, Required: this._false },
        ]

        this.FinanceAppSummaryData = [
            { Id: 1, Name: "ItemId", Type: this._text, Required: this._false },
            { Id: 2, Name: "Year", Type: this._number, Required: this._false },
            { Id: 3, Name: "CostBaseline", Type: this._currency, Required: this._false },
            { Id: 4, Name: "CostLbe", Type: this._currency, Required: this._false },
            { Id: 5, Name: "CostYtd", Type: this._currency, Required: this._false },
            { Id: 6, Name: "CostVariance", Type: this._currency, Required: this._false },
            { Id: 7, Name: "CostVairancePercentage", Type: this._currency, Required: this._false },
            { Id: 8, Name: "CostRag", Type: this._text, Required: this._false },
            { Id: 9, Name: "GrossBenefitBaseline", Type: this._currency, Required: this._false },
            { Id: 10, Name: "GrossBenefitLbe", Type: this._currency, Required: this._false },
            { Id: 11, Name: "GrossBenefitYtd", Type: this._currency, Required: this._false },
            { Id: 12, Name: "GrossBenefitVariance", Type: this._currency, Required: this._false },
            { Id: 13, Name: "GrossBenefitVariancePercentage", Type: this._currency, Required: this._false },
            { Id: 14, Name: "GrossRag", Type: this._text, Required: this._false },
            { Id: 15, Name: "NetBenefitBaseline", Type: this._currency, Required: this._false },
            { Id: 16, Name: "NetBenefitLbe", Type: this._currency, Required: this._false },
            { Id: 17, Name: "NetBenefitYtd", Type: this._currency, Required: this._false },
            { Id: 18, Name: "NetBenefitVariance", Type: this._currency, Required: this._false },
            { Id: 19, Name: "NetBenefitVariancePercentage", Type: this._currency, Required: this._false },
            { Id: 20, Name: "NetRag", Type: this._text, Required: this._false },
            
        ]

        this.listContextType = {}

        this.listContextType[this.utilsService.financeAppResourceData] = this.utilsService.hostWeb,
        this.listContextType[this.utilsService.financeAppMaterialData] = this.utilsService.hostWeb
        this.listContextType[this.utilsService.financeAppTotalsData] = this.utilsService.hostWeb
        this.listContextType[this.utilsService.financeAppSummaryData] = this.utilsService.hostWeb
        this.listContextType[this.utilsService.financeAppSettingsData] = this.utilsService.appWeb
        this.listContextType[this.utilsService.financeAppLogsData] = this.utilsService.appWeb
        this.listContextType[this.utilsService.financeAppWorkingDaysData] = this.utilsService.appWeb
        //end init
    }

    getFieldSpec(listNameSpec, fieldName) {
        let _index = this[listNameSpec].findIndex(element => {
            element.Name = fieldName;
        })

        return this[listNameSpec][_index]

    }

    getArrayFieldNames(listSpecName: string): Array<string> {
        console.log('getArrayFieldNames function Call')
        console.log(listSpecName)

        let _array: Array<string> = [];
        if (this[listSpecName] && Array.isArray(this[listSpecName])) {
            this[listSpecName].forEach(element => {
                _array.push(element.Name);
            });
        } else {
            this.logService.log(`unable to locate list definition for list: ${listSpecName} at function getArrayFieldNames`, this._error, false);
        }
        this.logService.log('returned array from getArrayFieldNames call', this._info, true);
        return _array;
    }

    getFields(listSpecName: string): Array<string> {
        let _array: Array<string> = [];
        if (this[listSpecName] && Array.isArray(this[listSpecName])) {
            this[listSpecName].forEach(element => {
                _array.push(this.generateFieldXml(element));
            });
        } else {
            this.logService.log(`unable to locate list definition for list: ${listSpecName} at function getFields`, this._error, false);
        }
        this.logService.log('returned array from getFields call', this._info, true);
        this.logService.log(_array, this._info, true);
        return _array;
    }
    generateFieldXml(fieldSpec: IFieldSpecModel): string{
        let fieldXml: string;
        switch(fieldSpec.Type) {
            case this._text:
                fieldXml = `<Field DisplayName="${fieldSpec.Name}" Name="${fieldSpec.Name}" Title="${fieldSpec.Name}" Type="${fieldSpec.Type}" Required="${fieldSpec.Required}"  />`
                break;
            case this._note:
                fieldXml = `<Field DisplayName="${fieldSpec.Name}" Name="${fieldSpec.Name}" Title="${fieldSpec.Name}" Type="${fieldSpec.Type}" Required="${fieldSpec.Required}"  />`
                break;
            case this._number:
                fieldXml = `<Field DisplayName="${fieldSpec.Name}" Name="${fieldSpec.Name}" Title="${fieldSpec.Name}" Type="${fieldSpec.Type}" Required="${fieldSpec.Required}" Decimal="FALSE"  />`
                break;
            case this._currency:
                fieldXml = `<Field DisplayName="${fieldSpec.Name}" Name="${fieldSpec.Name}" Title="${fieldSpec.Name}" Type="${fieldSpec.Type}" Required="${fieldSpec.Required}" LCID="1033" Decimal="TRUE"  />`
                break;
            case this._boolean:
                fieldXml = `<Field DisplayName="${fieldSpec.Name}" Name="${fieldSpec.Name}" Title="${fieldSpec.Name}" Type="${fieldSpec.Type}" Required="${fieldSpec.Required}"  />`
                break;
            case this._datetime:
                fieldXml = `<Field DisplayName="${fieldSpec.Name}" Name="${fieldSpec.Name}" Title="${fieldSpec.Name}" Type="${fieldSpec.Type}" Format="DateTime" Required="${fieldSpec.Required}"  />`
                break;                  
            default:
                this.logService.log('error unable to identify field type with field id: ' + String(fieldSpec.Id), 'error', false);
                throw new Error('error unable to identify field type with field id: ' + String(fieldSpec.Id))
        }
        this.logService.log(`Adding fieldXml: ${fieldXml}`, this._info, true);
        return fieldXml
    }

    get MaterialDataSpec() {
        return this.FinanceAppMaterialData
    }

    get ResourceDataSpec() {
        return this.FinanceAppResourceData
    }

    get TotalDataSpec() {
        return this.FinanceAppTotalsData
    }

    get SettingDataSpec() {
        return this.FinanceAppSettingsData
    }

    get SummaryDataSpec() {
        return this.FinanceAppSummaryData
    }

    getListSpec (listName:string) {
        switch (listName) {
            case this.utilsService.financeAppMaterialData:
                return this.FinanceAppMaterialData
            case this.utilsService.financeAppResourceData:
                return this.FinanceAppResourceData
            case this.utilsService.financeAppTotalsData:
                return this.FinanceAppTotalsData
            case this.utilsService.financeAppSettingsData:
                return this.FinanceAppSettingsData
            case this.utilsService.financeAppSummaryData:
                return this.FinanceAppSummaryData
            default:
                this.logService.log(`unable to determine which list spec to return based on listName ${listName}`, this._error, false);
                return
        }
    }

    getFieldXml (listName:string, fieldName:string) {
        let _listSpec = this.getListSpec(listName);

        let _index = _listSpec.findIndex(element => {
            return element.Name == fieldName;
        })
        try {
            return this.generateFieldXml(_listSpec[_index])
        } catch (e) {
            this.logService.log(e, this._error, false);
        }
    }

    getListContext(listName){
        let contextType = ''
        if (this.listContextType.hasOwnProperty(listName)) {
            return this.listContextType[listName]
        } else {
            this.logService.log(`Error: unable to identify context type for list ${listName}. defaulting to hostWeb`, this.utilsService.errorStatus, false)
            return this.utilsService.hostWeb
        }
    }

}