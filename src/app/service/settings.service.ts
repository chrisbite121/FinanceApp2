import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import { ISettings, ISettingsOptions, IAppSettings } from '../model/settings.model';

import { IItemPropertyModel } from '../model/data-validation.model'

const userControlledsettings: ISettings = {
    itemId: '1',
    year: new Date().getFullYear(),
    years: [
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
    ],
    //Sharepoint Mode needs to be removed from here
    //this value is set in application controlled settings
    sharePointMode: false,
    autoSave: true,
    workingHoursInDay: 7.5,
    tsWeighting: 0.2,
    listAutoCheck: false,
    persist: false,
    verbose: false,
    headerColour: 'c0cee5',
    headerFontColour: '000000',
    highlightColour: 'ccffff'
}

const ApplicationControlledSettings = {
    manageWeb: true,
    manageList: true,
    viewList: true,
    addListItems: true,

    useSettingsList: true,
    useLoggingList: true,
    useWorkDaysList: true,

    logginListReady: false,
    hostUrl: '',
    appUrl: '',


}

declare var SP;
declare var hostUrl;
declare var appUrl;

@Injectable()
export class SettingsService {
    private _settings: ISettings
    private _appSettings: IAppSettings
    // private _settingsOptions: ISettingsOptions
    private _settingsStream: Subject<ISettings> = new Subject();
    // private _settingsOptionsStream: Subject<ISettingsOptions> = new Subject();
    private _yearStream: Subject<number> = new Subject();

    //updated by the init script once logging list has been verified
    private _loggingListReady: boolean;
    private _workgDayListReady: boolean;

    constructor(){
        this._loggingListReady = false;
        this._workgDayListReady = false;
        
        //

        this._settings = userControlledsettings;
        this._appSettings = ApplicationControlledSettings


        if(this.sharePointMode) {
            try{
                this._appSettings.appUrl = appUrl
                this._appSettings.hostUrl = hostUrl
            } catch(e){
                console.log(e)
            }
        }
    }

    get hostUrl(){
        return this._appSettings.hostUrl
    }

    get appUrl(){
        return this._appSettings.appUrl
    }

    set loggingListReady(value:boolean) {
        this._loggingListReady = value;
    }

    set manageList(value:boolean) {
        this._appSettings.manageList = value
    }

    set manageWeb(value:boolean){
        this._appSettings.manageWeb = value
    }

    set viewList(value: boolean){
        this._appSettings.viewList = value
    }

    set addListItems(value:boolean){
        this._appSettings.addListItems = value
    }

    get addListItems() {
        return this._appSettings.addListItems
    }

    get viewList() {
        return this._appSettings.viewList
    }

    get manageList(){
        return this._appSettings.manageList
    }

    get manageWeb(){
        return this._appSettings.manageWeb
    }

    get loggingListReady(){
        return this._loggingListReady
    }

    get useSettingsList(){
        return this._appSettings.useSettingsList
    }

    get useLoggingList(){
        return this._appSettings.useLoggingList
    }

    get useWorkDaysList(){
        console.log('checking to see if we can are using workdays list')
        return this._appSettings.useWorkDaysList
    }


    get sharePointMode() {
        return this._settings.sharePointMode
    }       

    get autoSave(){
        return this._settings.autoSave
    }

    get tsWeighting() {
        return this._settings.tsWeighting
    }

    get workingHoursInDay() {
        return this._settings.workingHoursInDay
    }



    get persist() {
        return this._settings.persist
    }

    get verbose() {
        return this._settings.verbose
    }

    logListReady(value) {
        let logListReady$ = new Observable((observer:any) => {
            this._loggingListReady = value

            let result = {
                functionCall: 'logListReady',
                result: value
            }
            observer.next(result)
            observer.complete()
        })

        return logListReady$
        
    }

    workingDaysListReady(value) {
        let wdListReady$ = new Observable((observer:any) => {
            this._workgDayListReady = value
            console.log('workdays list created')
            let result = {
                functionCall: 'wdListReady',
                result: value
            }
            observer.next(result)
            observer.complete()
        })

        return wdListReady$
        
    }
    

    processSettingsData(data) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                //convert property name back to object format
                let fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                //if property of object exists in settings object, update the value
                if (this._settings.hasOwnProperty(fieldName)) {
                    let newValue;
                    //check to see if data is a JSON string
                    try {
                        newValue = JSON.parse(data[key])
                    } catch(e) {
                        newValue = data[key]
                    }

                    this._settings[fieldName] = newValue
                }
            }
        }
    }

    get settings(){
        return this._settings
    }

    get appSettings(){
        return this._appSettings
    }

    settingsValuesArray():Array<IItemPropertyModel>{
    let fieldValuesArray:Array<IItemPropertyModel> = []
    let settingsObject = this.settings
    let keysArray = Object.keys(settingsObject);

    keysArray.forEach(key => {
        let _fieldValue:any;
        //convert booleans to numbers
        if (settingsObject[key] === false) {
            _fieldValue = 0
        } else if (settingsObject[key] === true) {
            _fieldValue = 1
        } else if (Array.isArray(settingsObject[key])){
            _fieldValue = JSON.stringify(settingsObject[key])
        } else if (typeof(settingsObject[key]) === 'number') {
            _fieldValue = settingsObject[key]
        } else {
            _fieldValue = settingsObject[key]
        }


        fieldValuesArray.push({
            fieldName: key.charAt(0).toUpperCase() + key.slice(1),
            fieldValue: _fieldValue
        })
    })
    
    return fieldValuesArray
}

    getSettingsStream():Observable<ISettings>{
        return this._settingsStream.asObservable();
    }

    getSettings(){
        this._settingsStream.next(this._settings);
    }

    setSetting(attr: string, value: any): any {
        if(this._settings[attr] !== undefined) {
            console.log('updating value')
            this._settings[attr] = value
            this.getSettings();
        }
    }

    getSetting(attr: any): Observable<any> {
        let obs = Observable.create((observer: Observer<any>) => {
            if(this._settings.hasOwnProperty(attr)){
                observer.next(this._settings[attr]);
            }
             observer.complete();
        });
        return obs;
    }

    get year(){
        return this._settings.year;
    }

    getSettingOptions(attr: any): Observable<any> {
        let obs = Observable.create((observer: Observer<any>) => {
             observer.next(this._settings[attr]);
             observer.complete();
        });
        return obs;
    }

    
    // checkAutoSaveState():Observable<any>{
    //     let check$ = new Observable((observer:Observer<any>) => {
    //         if (this.autoSave) {
    //             observer.next({
    //                 functionCall: 'checkAutoSaveState',
    //                 result: true,
    //             })
    //             observer.next({
    //                 reportHeading: 'checkAutoSaveState',
    //                 reportResult: 'success'
    //             })
    //         } else {
    //             observer.next({
    //                 reportHeading: 'checkAutoSaveState',
    //                 reportResult: 'failure',
    //             })
    //         }
    //         observer.complete()
    //     })
    //     return check$
    // }
     
}


