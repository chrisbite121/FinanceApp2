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
    sharePointMode: true,
    autoSave: false,
    workingHoursInDay: 7.5,
    tsWeighting: 0.2,
    listAutoCheck: false,
    persist: false,
    verbose: false,
    headerColour: '#e8effc',
    headerFontColour: '#6b6b6b',
    highlightFontColour: '#e8effc',
    highlightColour: '#7ea8a8'
}

const ApplicationControlledSettings = {
    manageWeb: true,
    manageList: true,
    viewList: true,
    addListItems: true,

    // useSettingsList: true,
    // useLoggingList: true,
    // useWorkDaysList: true,
    // logginListReady: false,

    initAppComplete: false,
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
    // private _loggingListReady: boolean;
    // private _workgDayListReady: boolean;

    constructor(){
        // this._loggingListReady = false;
        // this._workgDayListReady = false;
        
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

    get initAppComplete(){
        return this._appSettings.initAppComplete
    }

    set initAppComplete(value:boolean) {
        this._appSettings.initAppComplete = value
    }

    // set loggingListReady(value:boolean) {
    //     this._loggingListReady = value;
    // }

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

    // get loggingListReady(){
    //     return this._loggingListReady
    // }

    // get useSettingsList(){
    //     return this._appSettings.useSettingsList
    // }

    // get useLoggingList(){
    //     return this._appSettings.useLoggingList
    // }

    // get useWorkDaysList(){
    //     console.log('checking to see if we can are using workdays list')
    //     return this._appSettings.useWorkDaysList
    // }


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

    // logListReady(value) {
    //     let logListReady$ = new Observable((observer:any) => {
    //         this._loggingListReady = value

    //         let result = {
    //             functionCall: 'logListReady',
    //             result: value
    //         }
    //         observer.next(result)
    //         observer.complete()
    //     })

    //     return logListReady$
        
    // }

    // workingDaysListReady(value) {
    //     let wdListReady$ = new Observable((observer:any) => {
    //         this._workgDayListReady = value
    //         console.log('workdays list created')
    //         let result = {
    //             functionCall: 'wdListReady',
    //             result: value
    //         }
    //         observer.next(result)
    //         observer.complete()
    //     })

    //     return wdListReady$
        
    // }
    

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

    // setSetting(attr: string, value: any): Observable<any> {
    //     let update$ = new Observable((observer:Observer<any>) => {
    //         let _attribute = attr.charAt(0).toLowerCase() + attr.slice(1)
    //         if(this._settings.hasOwnProperty(_attribute)) {

    //             this._settings[_attribute] = value
                
    //             observer.next({
    //                 functionCall: 'setSetting',
    //                 result: true,
    //             })

    //             observer.next({
    //                 reportHeading: 'setSetting',
    //                 reportResult: 'success',
    //                 description: `${_attribute}: Setting updated to ${value}`
    //             })
    //         } else {
    //             observer.next({
    //                 reportHeading: 'setSetting',
    //                 reportResult: 'fail',
    //                 description: `unable to update setting in functionCall: setSetting - could not find attribue ${attr}`
    //             })
    //         }

    //         observer.complete()
    //     })

    //     return update$

    // }

    setSettings(settingsArray: IItemPropertyModel[]): Observable<any> {
        let update$ = new Observable((observer:Observer<any>) => {
            settingsArray.forEach(setting => {
                let _attribute = setting.fieldName.charAt(0).toLowerCase() + setting.fieldName.slice(1)
                if(this._settings.hasOwnProperty(_attribute)) {
    
                    this._settings[_attribute] = setting.fieldValue
                    
                    observer.next({
                        functionCall: 'setSettings',
                        result: true,
                    })
    
                    observer.next({
                        reportHeading: 'setSettings',
                        reportResult: 'success',
                        description: `${_attribute}: Setting updated to ${setting.fieldName}`
                    })
                } else {
                    observer.next({
                        reportHeading: 'setSettings',
                        reportResult: 'fail',
                        description: `unable to update setting in functionCall: setSetting - could not find attribue ${_attribute}`
                    })
                }
            })
            
            

            observer.complete()
        })

        return update$

    }    

    getSetting(attr: any): Observable<any> {
        let obs = Observable.create((observer: Observer<any>) => {
            if(this._settings.hasOwnProperty(attr)){
                observer.next({
                    functionCall: 'getSetting',
                    result: true,
                    setting: attr,
                    value: this._settings[attr]
                });
                observer.next({
                    reportHeading: 'getSetting',
                    reportResult: 'success',
                    description: 'successfully retrieved setting ' + attr
                })
            } else {
                observer.next({
                    reportHeading: 'getSetting',
                    reportResult: 'fail',
                    description: `could not find attribute: ${attr}`
                })

                console.error(`cannot find attribute ${attr} in settings list`)
            }
             observer.complete();
        });
        return obs;
    }

    get year(){
        return this._settings.year;
    }

    get highlightColour(){
        return this._settings.highlightColour
    }

    get highlightFontColour(){
        return this._settings.highlightFontColour
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


