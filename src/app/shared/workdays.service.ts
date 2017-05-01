import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import { SettingsService } from './settings.service'

import { IYear } from '../model/year.model'

const _placeholderWd = {
        Year: 0,
        Placeholder: 'Working Days',
        January: 0,
        Febuary: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0,
        July: 0,
        August: 0,
        September: 0,
        October: 0,
        November: 0,
        December: 0
}

@Injectable()
export class WorkdayService {
    private Year:IYear
    private _workingDays: Array<IYear>
    private _workdayStream: Subject<Array<IYear>> = new Subject();
    
    constructor(private settingsService:SettingsService) {
        this._workingDays = [{
            Year: 2017,
            Placeholder: 'Working Days (2017)',
            January: 21,
            Febuary: 21,
            March: 23,
            April: 24,
            May: 22,
            June: 22,
            July: 21,
            August: 23,
            September: 22,
            October: 21,
            November: 23,
            December: 22
        }]

    }

    get workingDays(){
        let _year = this.settingsService.getYear();
        let _index = this.findIndex(_year)
        //if cannot find year, use placeholder
        if(_index < 0) {
            this.createWdEntry(_year);
        }
        console.log(this._workingDays);
        return this._workingDays[_index];
    }

    getWorkdayStream():Observable<Array<IYear>>{
        let _year = this.settingsService.getYear();
        let filteredDataStream = this._workdayStream.asObservable().map((data, index) => {
            return data.filter((wrkdys:any)=> wrkdys.Year == _year)
        })
        return filteredDataStream;
    }

    getWorkdayData(){
        //check if entry exists
        let _year = this.settingsService.getYear();
        let _index = this.findIndex(_year)
        if(_index < 0) {
            //year does not exist yet so add placeholder to array
            this.createWdEntry(_year);
        }
        //send observable 
        this._workdayStream.next(this._workingDays);
    }

    updateWorkingDays($event: any){
        let _year = $event.data.Year;
        //convert No days to number
        let _value = +$event.newValue;
        let _month = $event.colDef.field;
        let _index = this.findIndex(_year);
        if(_index < 0) {
            //year does not exist yet so add placeholder to array
            let obj = JSON.parse(JSON.stringify(_placeholderWd));
            obj.Year = _year;
            obj[_month] = _value;
            obj.Placeholder = 'Working Days (' + _year.toString() + ')';
            this._workingDays.push(obj);
        } else {
            //update working days
            this._workingDays[_index][_month] = _value
        }

        this.getWorkdayData();
    }

    getWorkDaysYear(year: number): IYear {
       
       let Months = [
         'January', 
         'Febuary', 
         'March', 
         'April', 
         'May', 
         'June', 
         'July', 
         'August', 
         'September', 
         'October', 
         'November', 
         'December']

         Months.forEach((item, index, array) => {
            let NoWorkingDays: number = this.getNoWorkDaysMonth(year, index);
            this.Year[item] = NoWorkingDays;
        });
        return this.Year;
    }

    isLeapYear(year: number): boolean {
        if (year % 4 === 0) {
            return true
        } else { 
            return false
        }
    }
 
    getNoDaysMonth(year: number, month: number): number {
        let monthStart = new Date(year, month, 1);
        let monthEnd = new Date(year, month + 1, 1);
        let daysInMonth: number = (+monthEnd - +monthStart) / (1000 * 60 * 60 * 24)
        return daysInMonth
    }

    getNoWorkDaysMonth(year: number, month: number): number {
        let workingDays: number;
        let dateValue = new Date(year, month, 1);
        let monthValue = dateValue.getMonth();
        while(dateValue.getMonth() == monthValue) {
            let day: number = dateValue.getDay();
            workingDays += (day == 0 || day == 6)? 0 : 1;
            let tomorrow: number = dateValue.getDate() + 1;
            dateValue.setDate(tomorrow);
        }
        return workingDays
    }

    findIndex(_year: number) {
       return this._workingDays.findIndex((element:any):any => {
                    return element.Year == _year
                })       
    }

    createWdEntry(_year:number){
            let obj = JSON.parse(JSON.stringify(_placeholderWd));
            obj.Year = +_year;
            obj.Placeholder = 'Working Days (' + _year.toString() + ')';
            this._workingDays.push(obj);
    }        


}