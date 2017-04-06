import { Component, OnInit } from '@angular/core'
import { SettingsService } from '../../shared/settings.service'
import { IRegion } from '../../model/region.model'

@Component({
    selector: 'calendar-settings',
    templateUrl: './settings-calendar.component.html',
    styles: [`
        div, select, option {
            color: #000000;
        }
    `]
})
export class SettingsCalendarComponent implements OnInit {
    years: Array<number>;
    region: IRegion;
    selectedYear: string;

    constructor(private settingsService: SettingsService){

    }

    ngOnInit(){
        this.settingsService.getSetting('years').subscribe(years => {
            this.years = years;
        });
        this.settingsService.getSetting('region').subscribe((region:any) => {
            this.region = <IRegion>region;
        })
    }

    selectYear(year: number) {
        console.log(year);
    }
}

