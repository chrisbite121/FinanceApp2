import { Injectable } from '@angular/core';
import { Observer } from 'rxjs/Observer';

import { WorkdayService } from './workdays.service'
import { SettingsService } from './settings.service'


import { IResourceModel } from '../model/resource.model';
import { IMatModel } from '../model/material.model';
import { IDataModel } from '../model/data.model'
import { IYear } from '../model/year.model'
import { ITotalModel } from '../model/total.model'

@Injectable()
export class DataCalcService {
    private _workingHoursInDay: number
    private _TSWeighting: number

    constructor(private workdayService:WorkdayService,
                private settingsService:SettingsService) {
        this.init();
    }

    init(){
        this._workingHoursInDay = this.settingsService.workingHoursInDay
        this._TSWeighting = this.settingsService.tsWeighting
    };

    puForecast(row: IResourceModel): number{
        let result = 0;
        let _workingdays:IYear = this.workdayService.workingDays
        if (_workingdays) {
            result = ((row.PUJan * _workingdays.January) +
                        (row.PUFeb * _workingdays.Febuary) +
                        (row.PUMar * _workingdays.March) +
                        (row.PUApr * _workingdays.April) +
                        (row.PUMay * _workingdays.May) +
                        (row.PUJun * _workingdays.June) +
                        (row.PUJul * _workingdays.July) +
                        (row.PUAug * _workingdays.August) +
                        (row.PUSep * _workingdays.September) +
                        (row.PUOct * _workingdays.October) +
                        (row.PUNov * _workingdays.November) +
                        (row.PUDec * _workingdays.December)) *
                        row.PRDayRate
        }
        return result
    }

    ahTotalHours(row: IResourceModel): number{
        let result = 0;

            result =    Number(row.AHJan) +
                        Number(row.AHFeb) +
                        Number(row.AHMar) +
                        Number(row.AHApr) +
                        Number(row.AHMay) +
                        Number(row.AHJun) +
                        Number(row.AHJul) +
                        Number(row.AHAug) +
                        Number(row.AHSep) +
                        Number(row.AHOct) +
                        Number(row.AHNov) +
                        Number(row.AHDec) 

        return result
    }

    prMonth(row: IResourceModel, monthLong: string): number{
        let _workingdays:IYear = this.workdayService.workingDays
        let monthShort:string = this.getShortMonth(monthLong);

        if (monthShort === undefined) return 0;
        
        let result:number = 0;
        
        if (_workingdays){
            let AHMonthValue = Number(row['AH' + monthShort])
            if (AHMonthValue !== 0){
                let value1:number = 0

                Number(AHMonthValue) > (Number(row.ContractedDayHours)*Number(_workingdays[monthLong])) ?
                value1 = Number(row.ContractedDayHours) * Number(_workingdays[monthLong]) :
                value1 = Number(AHMonthValue);

                result =  value1 * (Number(row.ContractedDayHours)/Number(this._workingHoursInDay));

            } else {
                result = Number(row.ContractedDayHours) * Number(_workingdays[monthLong]) * Number(row['PU'+monthShort]);
            }
        }

        return result;
    }

    prYtdTotal(row: IResourceModel): number {
        let result = 0;
        result = (row.AHTotalHours/this._workingHoursInDay) * row.PRDayRate;
        return result;
    }

    prLbe(row:IResourceModel): number {
        let result = 0;
        result =    Number(row.PRJan) +
                    Number(row.PRFeb) +
                    Number(row.PRMar) +
                    Number(row.PRApr) +
                    Number(row.PRMay) +
                    Number(row.PRJun) +
                    Number(row.PRJul) +
                    Number(row.PRAug) +
                    Number(row.PRSep) +
                    Number(row.PROct) +
                    Number(row.PRNov) +
                    Number(row.PRDec)
        return result;
    }

    prYtdVarianceToBudget(row: IResourceModel):number {
        let result = 0
        result = row.PRYtdTotal - row.PRBudget
        return result
    }
    prForecastVarianceToBudget(row: IResourceModel):number {
        let result = 0
        result = row.PRLbe - row.PRBudget
        return result
    }

    tsMonth(row: IResourceModel, monthLong: string): number {
        let result = 0;
        let monthShort = this.getShortMonth(monthLong);
        let _workingdays:IYear = this.workdayService.workingDays

        if (monthShort === undefined) return 0;

        let PUMonthValue = Number(row['PU'+monthShort])

        if (PUMonthValue !== 0) {
            result = row.TSDayRate * _workingdays[monthLong] * PUMonthValue * this._TSWeighting;
        } else {
            result = 0;
        }

        return result;
    }

    tsForecast(row: IResourceModel): number {
        let result = 0;
        result =    Number(row.TSJan) +
                    Number(row.TSFeb) +
                    Number(row.TSMar) +
                    Number(row.TSApr) +
                    Number(row.TSMay) +
                    Number(row.TSJun) +
                    Number(row.TSJul) +
                    Number(row.TSAug) +
                    Number(row.TSSep) +
                    Number(row.TSOct) +
                    Number(row.TSNov) +
                    Number(row.TSDec)

        return result
    }

    atsYtdTotal(row:IResourceModel): number{
        let result = 0;
        result =    Number(row.ATSJan) +
                    Number(row.ATSFeb) +
                    Number(row.ATSMar) +
                    Number(row.ATSApr) +
                    Number(row.ATSMay) +
                    Number(row.ATSJun) +
                    Number(row.ATSJul) +
                    Number(row.ATSAug) +
                    Number(row.ATSSep) +
                    Number(row.ATSOct) +
                    Number(row.ATSNov) +
                    Number(row.ATSDec)
        return result
    }

    rtsMonth(row:IResourceModel, monthLong:string): number {
        let result = 0;
        let monthShort = this.getShortMonth(monthLong);
        if (monthShort === undefined) return 0;

        let ATSMonthValue = Number(row['ATS'+monthShort])
        ATSMonthValue == 0 ?
        result = Number(row['PU' + monthShort]) :
        result = ATSMonthValue

        return result
    }

    rtsYtdTotal(row:IResourceModel):number {
        return row.ATSYtdTotal;
    }

    rtsLbe(row:IResourceModel):number{
        let result = 0;
        result =    Number(row.RTSJan) +
                    Number(row.RTSFeb) +
                    Number(row.RTSMar) +
                    Number(row.RTSApr) +
                    Number(row.RTSMay) +
                    Number(row.RTSJun) +
                    Number(row.RTSJul) +
                    Number(row.RTSAug) +
                    Number(row.RTSSep) +
                    Number(row.RTSOct) +
                    Number(row.RTSNov) +
                    Number(row.RTSDec)
        return result
    }

    rtsYtdVarianceToBudget(row:IResourceModel): number {
        return row.RTSYtdTotal - row.RTSBudget;
    }

    rtsVarianceToBudget(row:IResourceModel): number {
        return row.RTSLbe - row.RTSBudget
    }

    matYtdTotal(row): number {
        let result = 0;
        result =    Number(row.MatJan) +
                    Number(row.MatFeb) +
                    Number(row.MatMar) +
                    Number(row.MatApr) +
                    Number(row.MatMay) + 
                    Number(row.MatJun) +
                    Number(row.MatJul) +
                    Number(row.MatAug) +
                    Number(row.MatSep) +
                    Number(row.MatOct) +
                    Number(row.MatNov) +
                    Number(row.MatDec)
        return result;
    }

    matLbe(row): number {
        return row.MatYtdTotal;
    }

    matYtdVarianceToBudget(row): number {
        return row.MatYtdTotal - row.MatBudget
    }

    matForecastVarianceToBudget(row): number {
        return row.MatLbe - row.MatBudget
    }

    //RESOURCE TOTALS
    sumResourceTotal(filteredResourceYearData:IResourceModel[], field:string):number{
        let result = 0
        filteredResourceYearData.forEach((row)=>{
            if (Number(row[field])){
                result += Number(row[field])
            }
        })
        return result;
    }

    //MATERIALS TOTALS
    sumMaterialTotal(filteredMaterialYearData:IMatModel[], field:string):number{
        let result = 0
        filteredMaterialYearData.forEach((row)=>{
            if (Number(row[field])){
                result += Number(row[field])
            }
        })
        return result;
    }

//SUM TOTALS
sumTotal(filteredYearData:ITotalModel, field:string):number{
    let result = 0
    //remove the T prefix
    let fieldBase:string = field.slice(1);
    
    //special fule for TProjectBudget, need to Trim Project as well
    if (fieldBase === 'ProjectBudget') fieldBase = fieldBase.slice(7)

    //each sumtoal value is the sum of 3 values PU<Value> + RTS<Value> + MAT<Value>
    let field1:string;
    let field2:string;
    let field3:string;

    // special rule for TVarianceToBudget
    if (fieldBase === 'VarianceToBudget') {
        field1 = "PRForecastVarianceToBudget"
        field2 = "RTSVarianceToBudget"
        field3 = "MatForecastVarianceToBudget"
    } else {
        field1 = "PR" + fieldBase
        field2 = "RTS" + fieldBase
        field3 = "Mat" + fieldBase
    }

    let value1: number;
    let value2: number;
    let value3: number;

    if (filteredYearData.hasOwnProperty(field1) &&
        filteredYearData.hasOwnProperty(field2) &&
        filteredYearData.hasOwnProperty(field3)
    ) {
        result = Number(filteredYearData[field1]) + Number(filteredYearData[field2]) + Number(filteredYearData[field3])
    } else {
        console.error(`unable to find values for field ${field} - in totals object to run sum total function`)
    }
    return result;
}      


    getShortMonth(monthLong: string): string {
        let monthShort:string;
        switch (monthLong) {
            case 'January':
                monthShort = 'Jan'
                break;
            case 'Febuary':
                monthShort = 'Feb'
                break;
            case 'March':
                monthShort = 'Mar'
                break; 
            case 'April':
                monthShort = 'Apr'
                break;           
            case 'May':
                monthShort = 'May'
                break;           
            case 'June':
                monthShort = 'Jun'
                break;           
            case 'July':
                monthShort = 'Jul'
                break;           
            case 'August':
                monthShort = 'Aug'
                break;
            case 'September':
                monthShort = 'Sep'
                break;
            case 'October':
                monthShort = 'Oct'
                break;
            case 'November':
                monthShort = 'Nov'
                break;
            case 'December':
                monthShort = 'Dec'
                break;                
            default:
                monthShort = undefined;
        }
        return monthShort        
    }

}