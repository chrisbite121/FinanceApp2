import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import { ISettings, ISettingsOptions, IAppSettings } from '../model/settings.model';
import { IRegion } from '../model/region.model'
import { IItemPropertyModel } from '../model/data-validation.model'

const userControlledsettings: ISettings = {
    itemId: '1',
    year: 2017,
    years: [
        2017,
        2018,
        2019,
        2020,
        2021,
        2022,
        2023,
        2024,
        2025
    ],
    regionOptions: [
        { label: 'UK', value: 'United Kingdon' },
        { label: 'US', value: 'United States' },
        { label: 'FR', value: 'France' },
        { label: 'ES', value: 'Spain' },
        { label: 'UK', value: 'United Kingdon' },
        { label: 'DE', value: 'Germany' },
    ],    
    region: {
            label: 'UK',
            value: 'United Kingdon'
    },
    sharePointMode: true,
    autoSave: false,
    workingHoursInDay: 7.5,
    tsWeighting: 0.2,
    listAutoCheck: false,
    persist: true,
    verbose: false
}

const ApplicationControlledSettings = {
    manageWeb: true,
    manageList: true,
    viewList: true,
    addListItems: true,
    useSettingsList: true,
    useLoggingList: true,
    logginListReady: false
}

@Injectable()
export class SettingsService {
    private _settings: ISettings
    private _appSettings: IAppSettings
    // private _settingsOptions: ISettingsOptions
    private _settingsStream: Subject<ISettings> = new Subject();
    // private _settingsOptionsStream: Subject<ISettingsOptions> = new Subject();
    private _yearStream: Subject<number> = new Subject();
    private _useSettingsList: Boolean;
    private _useLoggingList:Boolean;

    //updated by the init script once logging list has been verified
    private _loggingListReady: boolean;

    constructor(){
        //Should application use settings list or logging list?
        //THIS CAN ONLY BE SET IN CODE SO NOT INCLUDING IT IN SETTINGS LIST        
        this._useSettingsList = true
        this._useLoggingList = true
        this._loggingListReady = false;
        //

        this._settings = userControlledsettings;
        this._appSettings = ApplicationControlledSettings
        // this._settingsOptions = settingsOptions
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
        return this._useSettingsList
    }

    get useLoggingList(){
        return this._useLoggingList
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

    get sharePointMode() {
        return this._settings.sharePointMode
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
            console.error(result)
            observer.next(result)
            observer.complete()
        })

        return logListReady$
        
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

                    // //convert string booleans back to booleans
                    // if (newValue === 0) {
                    //     newValue = false
                    // } else if (newValue === 1) {
                    //     newValue = true
                    // }

                    this._settings[fieldName] = newValue
                }
            }
        }
        console.error(`updating settings object`)
        console.error(this._settings)
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

    // getYearStream():Observable<number>{
    //     return this._yearStream.asObservable();
    // }

    // getSettingsOptionsStream():Observable<ISettingsOptions> {
    //     return this._settingsOptionsStream.asObservable();
    // }

    getSettings(){
        this._settingsStream.next(this._settings);
        //this._yearStream.next(this._data.year);
    }

    // getSettingsOptions(){
    //     this._settingsOptionsStream.next(this._settingsOptions);
    // }

    setSetting(attr: string, value: any): any {
        console.log(value);
        if (attr === 'region') {
            let regionIndex = this.findIndex(value);
            let obj = JSON.parse(JSON.stringify(this._settings.regionOptions[regionIndex]));
            this._settings[attr] = obj;
        } else {
            this._settings[attr] = value
        }
        this.getSettings();
    }

    getSetting(attr: any): Observable<any> {
        let obs = Observable.create((observer: Observer<any>) => {
            console.log(this._settings[attr]);
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
            console.log(this._settings[attr]);
             observer.next(this._settings[attr]);
             observer.complete();
        });
        return obs;
    }

    findIndex(value: string) {
       return this._settings.regionOptions.findIndex((element:any):any => {
                    return element.value == value
                })       
    }

    // setRegion(region: string) {
    //     let obs = Observable.create((observer: Observer<any>) => {
    //         this._data.region.label = region
    //         observer.next('success');
    //         observer.complete();
    //     });

    //     return obs;
    // }

    // getYears(): Observable<any> {
    //     let obs = Observable.create((observer: Observer<any>) => {
    //         observer.next(settings.years);
    //         observer.complete();
    //     });

    //     return obs
    // }

    // getSettings(): Observable<IRegion> {
    //     let obs = Observable.create((observer: Observer<any>) => {
    //          observer.next(this._data);
    //          observer.complete();
    //     });
    //     return obs;
    // }
    
     
}


