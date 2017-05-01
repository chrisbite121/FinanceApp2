import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import { ISettings, ISettingsOptions } from '../model/settings.model';
import { IRegion } from '../model/region.model'

const settings: ISettings = {
    year: 2017,
    region: {
            label: 'UK',
            value: 'United Kingdon'
    }
}

const settingsOptions: ISettingsOptions = {
    regionOptions: [
        { label: 'UK', value: 'United Kingdon' },
        { label: 'US', value: 'United States' },
        { label: 'FR', value: 'France' },
        { label: 'ES', value: 'Spain' },
        { label: 'UK', value: 'United Kingdon' },
        { label: 'DE', value: 'Germany' },
    ],
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
        ] 
}

@Injectable()
export class SettingsService {
    private _data: ISettings 
    private _settingsOptions: ISettingsOptions
    private _settingsStream: Subject<ISettings> = new Subject();
    private _settingsOptionsStream: Subject<ISettingsOptions> = new Subject();
    private _yearStream: Subject<number> = new Subject();

    constructor(){
        this._data = settings
        this._settingsOptions = settingsOptions
    }

    getSettingsStream():Observable<ISettings>{
        return this._settingsStream.asObservable();
    }

    getYearStream():Observable<number>{
        return this._yearStream.asObservable();
    }

    getSettingsOptionsStream():Observable<ISettingsOptions> {
        return this._settingsOptionsStream.asObservable();
    }

    getSettings(){
        this._settingsStream.next(this._data);
        this._yearStream.next(this._data.year);
    }

    getSettingsOptions(){
        this._settingsOptionsStream.next(this._settingsOptions);
    }

    setSetting(attr: string, value: any): any {
        console.log(value);
        if (attr === 'region') {
            let regionIndex = this.findIndex(value);
            let obj = JSON.parse(JSON.stringify(this._settingsOptions.regionOptions[regionIndex]));
            this._data[attr] = obj;
        } else {
            this._data[attr] = value
        }
        this.getSettings();
    }

    getSetting(attr: any): Observable<any> {
        let obs = Observable.create((observer: Observer<any>) => {
            console.log(this._data[attr]);
             observer.next(this._data[attr]);
             observer.complete();
        });
        return obs;
    }

    getYear(){
        return this._data.year;
    }

    getSettingOptions(attr: any): Observable<any> {
        let obs = Observable.create((observer: Observer<any>) => {
            console.log(this._settingsOptions[attr]);
             observer.next(this._settingsOptions[attr]);
             observer.complete();
        });
        return obs;
    }

    findIndex(value: 'string') {
       return this._settingsOptions.regionOptions.findIndex((element:any):any => {
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


