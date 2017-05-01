import { Injectable } from '@angular/core';
import { Observer } from 'rxjs/Observer';

import { WorkdayService } from './workdays.service'

import { IDataModel } from '../model/data.model';
import { IYear } from '../model/year.model'


@Injectable()
export class DataCalcService {
    private _workingdays:IYear;
    private _workingHoursInDay: number = 7.5;
    private _TSWeighting = 0.2;

    constructor(private workdayService:WorkdayService) {
        this.init();
    }

    init(){
        this.workdayService.getWorkdayStream().subscribe(data => {
            this._workingdays = data[0];
        })        
    };

    puForecast(row: IDataModel): number{
        let result = 0;
        if (this._workingdays) {
            result = ((row.PUJan * this._workingdays.January) +
                        (row.PUFeb * this._workingdays.Febuary) +
                        (row.PUMar * this._workingdays.March) +
                        (row.PUApr * this._workingdays.April) +
                        (row.PUMay * this._workingdays.May) +
                        (row.PUJun * this._workingdays.June) +
                        (row.PUJul * this._workingdays.July) +
                        (row.PUAug * this._workingdays.August) +
                        (row.PUSep * this._workingdays.September) +
                        (row.PUOct * this._workingdays.October) +
                        (row.PUNov * this._workingdays.November) +
                        (row.PUDec * this._workingdays.December)) *
                        row.PRDayRate
        }
        return result
    }

    ahTotalHours(row: IDataModel): number{
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

    prMonth(row: IDataModel, monthLong: string): number{
        let monthShort:string = this.getShortMonth(monthLong);
        if (monthShort === undefined) return 0;
        let result:number = 0;
        if (this._workingdays){
            let AHMonthValue = Number(row['AH' + monthShort])
            if (AHMonthValue !== 0){
                let value1:number = 0

                Number(AHMonthValue) > (Number(row.ContractedDayHours)*Number(this._workingdays[monthLong])) ?
                value1 = Number(row.ContractedDayHours) * Number(this._workingdays[monthLong]) :
                value1 = Number(AHMonthValue);

                result =  value1 * (Number(row.ContractedDayHours)/Number(this._workingHoursInDay));

            } else {
                result = Number(row.ContractedDayHours) * Number(this._workingdays[monthLong]) * Number(row['PU'+monthShort]);
            }
        }

        return result;
    }

    prYtdTotal(row: IDataModel): number {
        let result = 0;
        result = (row.AHTotalHours/this._workingHoursInDay) * row.PRDayRate;
        return result;
    }

    prLbe(row:IDataModel): number {
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

    prYtdVarianceToBudget(row: IDataModel):number {
        let result = 0
        result = row.PRYtdTotal - row.PRBudget
        return result
    }
    prForecastVarianceToBudget(row: IDataModel):number {
        let result = 0
        result = row.PRLbe - row.PRBudget
        return result
    }

    tsMonth(row: IDataModel, monthLong: string): number {
        let result = 0;
        let monthShort = this.getShortMonth(monthLong);
        if (monthShort === undefined) return 0;

        let PUMonthValue = Number(row['PU'+monthShort])

        if (PUMonthValue !== 0) {
            result = row.TSDayRate * this._workingdays[monthLong] * PUMonthValue * this._TSWeighting;
        } else {
            result = 0;
        }

        return result;
    }

    tsForecast(row: IDataModel): number {
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

    atsYtdTotal(row:IDataModel): number{
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

    rtsMonth(row:IDataModel, monthLong:string): number {
        let result = 0;
        let monthShort = this.getShortMonth(monthLong);
        if (monthShort === undefined) return 0;

        let ATSMonthValue = Number(row['ATS'+monthShort])
        ATSMonthValue == 0 ?
        result = Number(row['PU' + monthShort]) :
        result = ATSMonthValue

        return result
    }

    rtsYtdTotal(row:IDataModel):number {
        return row.ATSYtdTotal;
    }

    rtsLbe(row:IDataModel):number{
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

    rtsYtdVarianceToBudget(row:IDataModel): number {
        return row.RTSYtdTotal - row.RTSBudget;
    }

    rtsVarianceToBudget(row:IDataModel): number {
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

    //Totals
    sumTotal(filteredYearData:IDataModel[], field:string):number{
        let result = 0
        filteredYearData.forEach((row)=>{
            console.log(Number(row[field]));
            if (Number(row[field])){
                result += Number(row[field])
            }
        })
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