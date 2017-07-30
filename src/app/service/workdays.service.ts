import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import { SettingsService } from './settings.service'

import { IYear } from '../model/year.model'
import { IItemPropertyModel } from '../model/data-validation.model'

const _placeholderWd = {
        Year: 20,
        Placeholder: 'Working Days',
        January: 20,
        Febuary: 20,
        March: 20,
        April: 20,
        May: 20,
        June: 20,
        July: 20,
        August: 20,
        September: 20,
        October: 20,
        November: 20,
        December: 20
}
const years = [
        2017,
        2018,
        2019,
        2020,
        2021,
        2022,
        2023,
        2024,
        2025,
        2026,
        2027,
        2028
    ]
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
            December: 22,
            ID: 'undefined'
        }]

    }

    get workdayData():Array<IYear> {
        console.log(this._workingDays)
        return this._workingDays
    }

    set workdayData(data) {
        this._workingDays = data;
    }

    processItems(data){
        let processItems$ = new Observable((observer:Observer<any>) => {
            //dont want to write properties up the inheritance chain
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    //if property of object exists in settings object, update the value
                    if (this._workingDays.hasOwnProperty(key)) {
                        let newValue;
                        //check to see if data is a JSON string
                        try {
                            newValue = JSON.parse(data[key])
                        } catch(e) {
                            newValue = data[key]
                        }                    
                        this._workingDays[key] = newValue
                    }
                }
            }

            observer.next({
                functionCall: 'processWorkingDays',
                result: true                
            })
            observer.complete()
        })
        return processItems$
        
    }    

    get workingDays(){
        let _year = this.settingsService.year;
        let _index = this.findIndex(_year)
        //if cannot find year, use placeholder
        if(_index < 0) {
            this.createWdEntry(_year);
            console.error(`working days data for year: ${_year} does not exist`)
            //send notification instead
        }
        return this._workingDays[_index];
    }

    getWorkdayStream():Observable<Array<IYear>>{
        let _year = this.settingsService.year;
        let filteredDataStream = this._workdayStream.asObservable().map((data, index) => {
            return data.filter((wrkdys:any)=> wrkdys.Year == _year)
        })
        return filteredDataStream;
    }

    getWorkdayData(){
        //check if entry exists
        let _year = this.settingsService.year;
        let _index = this.findIndex(_year)
        if(_index < 0) {
            //send notification to notification service instead
            
            //year does not exist yet so add placeholder to array
            console.error(`workday data for year ${_year} does not exist. creating placeholder workday data`)
            this.createWdEntry(_year);
        }
        //send observable 
        this._workdayStream.next(this._workingDays);
    }

    updateWorkingDays($event: any){
        let _year, _value, _month, _index;
        
        if ($event.hasOwnProperty('data') &&
        $event.data.hasOwnProperty('Year')){
            _year = $event.data.Year;
        } else {
            console.error(`missing property on event object. 
            failed to assign propery to _year for function updateworkingdays`)
        }

        if ($event.hasOwnProperty('newValue')) {
            //convert No days to number
            _value = +$event.newValue;
        } else {
            console.error(`missing property on event object. 
            failed to assign propery to _value for function updateworkingdays`)            
        }

        if ($event.hasOwnProperty('colDef') &&
            $event.colDef.hasOwnProperty('field')){
                _month = $event.colDef.field;
            } else {
                console.error(`missing property on event object. 
                failed to assign propery to _value for function updateworkingdays`)                 
            }

        //commenting this out as this is badly handles
        // if(_index < 0) {
        //     //year does not exist yet so add placeholder to array
        //     let obj = JSON.parse(JSON.stringify(_placeholderWd));
        //     obj.Year = _year;
        //     obj[_month] = _value;
        //     obj.Placeholder = 'Working Days (' + _year.toString() + ')';
        // //     this._workingDays.push(obj);
        // } else {
        //     update working days
        //     this._workingDays[_index][_month] = _value
        // }

        _index = this.findIndex(_year);

        if (_index !== -1) {
            this._workingDays[_index][_month] = _value                
            this.getWorkdayData();    
        } else {
            console.error(`cannot find workday data for year ${_year} to update`)
        } 
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

    //send notification to notification service instead
    createWdEntry(_year:number){
            let obj = JSON.parse(JSON.stringify(_placeholderWd));
            obj.Year = +_year;
            obj.Placeholder = 'Working Days (' + _year.toString() + ')';
            this._workingDays.push(obj);
    }


   generatePlaceholderWorkdays(): Array<Array<IItemPropertyModel>> {
        // let _wdPlaceholderArray:Array<Array<IItemPropertyModel>> = []
        // years.forEach(year => {
        //     let _WDYear = []
        //     for (let key in _placeholderWd) {
        //         let _fieldProperty:IItemPropertyModel = {
        //             fieldName: '',
        //             fieldValue: '',
        //         }
        //         _fieldProperty.fieldName = key;
        //         if (key == 'Year'){
        //              _fieldProperty.fieldValue = year
        //         } else if (key == 'Placeholder') {
        //             _fieldProperty.fieldValue = _placeholderWd[key] + ' (' + year + ')'
        //         } else {
        //             _fieldProperty.fieldValue = _placeholderWd[key]
        //         }
                
        //         _WDYear.push(_fieldProperty)

        //     }
        //     _wdPlaceholderArray.push(_WDYear)
        // })
        // return _wdPlaceholderArray

        return years.map(year => {
            let _WDYear = []
            for (let key in _placeholderWd) {
                let _fieldProperty:IItemPropertyModel = {
                    fieldName: '',
                    fieldValue: 0,
                }
                _fieldProperty.fieldName = key;
                if (key == 'Year'){
                     _fieldProperty.fieldValue = year
                } else if (key == 'Placeholder') {
                    _fieldProperty.fieldValue = _placeholderWd[key] + ' (' + year + ')'
                } else {
                    _fieldProperty.fieldValue = _placeholderWd[key]
                }
                _WDYear.push(_fieldProperty)
            }
            return _WDYear
        })
    }

//generate dummy workdays data array, used in workday settings page to generate dummy data when app is running offline
    generateDummyData() {
      return years.map(value => {
                    let wdYear = JSON.parse(JSON.stringify(_placeholderWd))
                    wdYear.Year = value;
                    wdYear.Placeholder = _placeholderWd.Placeholder + '( ' + value + ')'
                    return wdYear
                })

    }

    

}