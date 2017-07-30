import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

import { IFieldUpdateResult,
        IFieldThatDoesntExist } from '../model/data-validation.model'

import {    IHealthReport,
            IActionHealthReport,
            ISettingsReport,
            IProvisionerReport } from '../model/health-report.model'

export class HealthReport {
            public date;
            public permissions;
            public listExists;
            public listXmlData;
            public fieldsExists;
            public fieldsType;
            public fieldsRequired;
            public errors;

            constructor(){
                this.date = new Date();
                this.permissions = [];
                this.listExists = [];
                this.listXmlData = [];
                this.fieldsExists = [];
                this.fieldsType = [];
                this.fieldsRequired = [];
                this.errors = [];
            }

    }

export class ActionHealthReport {
    public date;
    public permissions;
    public createList;
    public addFields;
    public updateField;
    public errors

        constructor(){
            this.date = new Date();
            this.permissions = [];
            this.createList = [];
            this.addFields = [];
            this.updateField = [];
            this.errors = [];
        }
}    

export class SettingsReport {
    public date;
    public permissions;
    public listExists;
    public listXmlData;
    public createList;
    public fieldsExists;
    public fieldsType;
    public fieldsRequired;
    public errors;

    constructor(){
        this.date = new Date();
        this.permissions = [];
        this.listExists = [];
        this.listXmlData = '';
        this.createList = [];
        this.fieldsExists = [];
        this.fieldsType = [];
        this.fieldsRequired = [];
        this.errors = [];
    }
}

export class ProvisionerReport {
    public date;
    public permissions;
    public listExists;
    public createList;
    public deleteList;
    public errors;

    constructor(){
        this.date = new Date();
        this.permissions = [];
        this.listExists = [];
        this.createList = [];
        this.deleteList = [];
        this.errors = [];
    }
}

export class ProcessDataReport {
    public createResults;
    public updateResults;
    public deleteResults;
    public inertResults;

    constructor(){
        this.createResults = [];
        this.updateResults = [];
        this.deleteResults = [];
        this.inertResults = [];
    }
}

@Injectable()
export class HealthReportService {
    private _healthReport: object
    private _actionHealthReport: object
    private _settingsReport: ISettingsReport
    private _provisionerReport: IProvisionerReport
    private _getDataReport: Array<any>
    private _submitDataReport: Array<any>

    constructor(){
        this._healthReport = {};
        this._actionHealthReport = {};
        this._settingsReport = new SettingsReport();
        this._provisionerReport = new ProvisionerReport();
        this._getDataReport = [];
        this._submitDataReport = [];
    }

    get healthReportname() {
        return '_healthReport'
    }

    get actionHealthReportName() {
        return '_actionHealthReport'
    }

    get healthReport(){
        return this._healthReport
    }

    set healthReport(data) {
        this._healthReport = data;
    }

    updateHealthReport(listName: string, healthReportName:string, attribute:string, data:any):Observable<any> {
        let update$ = new Observable((observer: Observer<any>) => {

            if(typeof(this[healthReportName])!=='object'){
                console.log(`cannot find health report with name: ${healthReportName}`)
            } else if (typeof(this[healthReportName] == 'object') &&
                       typeof(this[healthReportName][listName]) !== 'object') {
                console.log(`creating for list object: ${listName} in health report: ${healthReportName}`)
                switch (healthReportName) {
                    case this.healthReportname:
                        this[healthReportName][listName] = new HealthReport()
                    break;
                    case this.actionHealthReportName:
                        this[healthReportName][listName] = new ActionHealthReport()
                    break;
                    default:
                        console.log(`unable to locate list name ${listName} in health report: ${healthReportName}`)
                    break
                }
            } else {
                console.log(`updating healh report ${healthReportName}`)
            }

            if(this[healthReportName][listName].hasOwnProperty(attribute)) {
                try{
                    this[healthReportName][listName][attribute].push(data)
                        observer.next({
                            functionCall: 'updateHealthReport',
                            result: true
                        })
                } catch(e){
                    observer.error(e)
                }
            } else {
                observer.next({
                    functionCall: 'updateHealthReport',
                    result: false,
                    listName: listName,
                    healthReportName: healthReportName,
                    attribute: attribute,
                    data: data
                })
            }
            observer.complete()
        })
        return update$
    } 

    resetHealthReport(listArray):Observable<any>{
        let reset$ = new Observable((observer:Observer<any>) => {
            try {
                listArray.forEach(listName => {
                if (!this._healthReport.hasOwnProperty(listName)) {
                    console.log(`creating healthreport for listname ${listName}`)    
                }
                this._healthReport[listName] = new HealthReport()
                })
                observer.next({
                    functionCall: 'resetHealthReport',
                    result: true,
                    healthReport: this._healthReport
                })
                observer.complete()
            } catch(e) {
                observer.error(e)
            }
        })
        
        return reset$
    }

    resetActionHealthReport(listArray:Array<string>):Observable<any>{
        let reset$ = new Observable((observer:Observer<any>) => {
            //reset action health report results doucument
            // reset health report file
            try {
                listArray.forEach((listName:string) => {
                    if (this._actionHealthReport.hasOwnProperty(listName)) {
                        console.log('creating action health report for listName: ' + listName)
                    }
                    this._actionHealthReport[listName] = new ActionHealthReport()
                })
                observer.next({
                    functionCall: 'resetActionHealthReport',
                    result: true,
                    healthReport: this._actionHealthReport
                })
                observer.complete()
            } catch(e) {
                observer.error(e)            
            }
        })

        return reset$
    }

    get actionHealthReport() {
        return this._actionHealthReport
    }

    set actionHealthReport(data) {
        this._actionHealthReport = data
    }

    get settingsReport() {
        return this._settingsReport
    }

    set settingsReport(data) {
        this._settingsReport = data
    }

    get provisionerReport(){
        return this._provisionerReport
    }

    set provisionerReport(data) {
        this._provisionerReport = data;
    }

    get getDataReport() {
        return this._getDataReport
    }

    set getDataReport(data) {
        this._getDataReport = data;
    }

    get submitDataReport(){
        return this._submitDataReport
    }

    set submitDataReport(data) {
        this._submitDataReport = data;
    }

}