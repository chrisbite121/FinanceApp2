import { Component, OnInit } from '@angular/core'

import { SettingsService } from '../../shared/settings.service'
import { DataApiService } from '../../shared/data-api.service'

import { IRegion } from '../../model/region.model'
import { ISettings, ISettingsOptions } from '../../model/settings.model'

@Component({
    selector: 'settings-main',
    templateUrl: './settings-main.component.html',
    styles: [`
        option, select, button {
            color: #000000
        },
        li, span { cursor: pointer; cursor: hand; }
    `]
})
export class SettingsMainComponent implements OnInit { 
    public displayRegion: boolean = false;
    public region: IRegion;
    //private settings: ISettings;
    public regionOptions: Array<IRegion>;
    public selectedRegion: IRegion;
    public selectedYear: number;
    public years: Array<number>;
    public year: number

    constructor(private settingsService: SettingsService,
                private dataApiService: DataApiService ) {
    }

    showRegionDialog() {
        this.displayRegion = true;
    }

    ngOnInit() {
        this.settingsService.getSettingsOptionsStream().subscribe(data => {
            this.years = <Array<number>>data.years
            this.regionOptions = <Array<IRegion>>data.regionOptions
        })
        this.settingsService.getSettingsStream().subscribe(data => {
            this.region = <IRegion>data.region;
            this.year = data.year;
            this.selectedYear = data.year;
        })
        this.settingsService.getSettings()
        this.settingsService.getSettingsOptions();


        // this.settingsService.getSettingOptions('years').subscribe(years => {
        //     this.years = <Array<IYearChoice>>years;
        // });
        // this.settingsService.getSetting('region').subscribe(region =>
        // { this.region = <IRegion>region;})
        // this.settingsService.getSettingOptions('regionOptions').subscribe(regionOptions =>
        // { this.regionOptions = <IRegion[]>regionOptions });
    }

    updateAttr(attr: any, value: any) {
        this.settingsService.setSetting(attr, value)
    }

    selectRegion(region: any): void {
        this.selectedRegion = region;
    }

    cancelRegionSelect(){
        this.selectedRegion = this.region; 
    }

    saveRegionSelect(){
        this.settingsService.setSetting('region',this.selectedRegion)
    }

    saveYearSelect(year){
        this.settingsService.setSetting('year', year)
        this.selectedYear = year
    }

    selectYear(year: number) {
        console.log(year);
        this.selectedYear = year
    }

    //TOBEDELETED
    createList(){
        this.dataApiService.createList$.subscribe(this.getSubscriber())
    }

    updateList(){
        this.dataApiService.updateList$.subscribe(this.getSubscriber())
    }

    deleteList() {
        this.dataApiService.deleteList$.subscribe(this.getSubscriber())
    }

    readList() {
        this.dataApiService.readList$.subscribe(this.getSubscriber())
    }

    listExists() {
        this.dataApiService.listExists$.subscribe(this.getSubscriber())
    }

    fieldExists() {
        this.dataApiService.listExists$.subscribe(this.getSubscriber())
    }

    readFields(){
        this.dataApiService.readFields$.subscribe(this.getSubscriber());
    }

    readField(){
        this.dataApiService.readField$.subscribe(this.getSubscriber());
    }

    deleteField(){
        this.dataApiService.deleteField$.subscribe(this.getSubscriber());
    }

    updateField(){
        this.dataApiService.updateField$.subscribe(this.getSubscriber());
    }

    addItem(){
        this.dataApiService.addItem$.subscribe(this.getSubscriber());
    }

    updateItem(){
        this.dataApiService.updateItem$.subscribe(this.getSubscriber());
    }

    getItem(){
        this.dataApiService.getItem$.subscribe(this.getSubscriber());
    }

    getItems(){
        this.dataApiService.getItems$.subscribe(this.getSubscriber());
    }

    deleteItem(){
        this.dataApiService.deleteItem$.subscribe(this.getSubscriber());
    }

    deleteItems(){
        this.dataApiService.deleteItems$.subscribe(this.getSubscriber());
    }
    
    
    getSubscriber() {
        return {
            next(data){
                console.log('next', data)
            },
            error(err){
                console.log('error', err)
            },
            complete(){
                console.log('completed');
            }
        }
    }
 
}