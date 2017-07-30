import { Component } from '@angular/core'
import { ScriptService } from '../../../service/scripts.service'
import { SettingsService } from '../../../service/settings.service'
import { UtilsService } from '../../../service/utils.service'
import { DataContextService } from '../../../service/data-context.service'

import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'data',
    templateUrl: './data.component.html',
    styleUrls: [`./data.component.css`]
})
export class DataComponent {
    public logs:Array<any>

    constructor(private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private dataContextService: DataContextService){
        this.logs = [];
    }


    saveAppData(event) {
        this.scriptService.saveAppData()
            .subscribe(
                data => {
                    console.log(data);
                },
                err => {
                    console.log(err);
                },
                () => {
                    console.log('save data api call complete')
                }
            )
    }

    loadAppData(event){
        let confirmation = confirm('this will clear all cached data, any unsaved data will be lost. Are you sure you want to proceed?')
        
        if (confirmation) {
            this.dataContextService.clearCache([this.utilsService.financeAppResourceData,
                                            this.utilsService.financeAppMaterialData,
                                            this.utilsService.financeAppTotalsData,
                                            this.utilsService.financeAppSummaryData])
            .mergeMap(data => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('listName') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'clearCache' &&
                data.result == true)
                ? this.scriptService.loadAppData([data.listName], this.settingsService.year)
                : Observable.of(data)
            )
            
                .subscribe(
                    data => {
                        console.log(data);
                    },
                    err => {
                        console.error(err);
                    },
                    () => {
                        console.log('save data api call complete')
                    }
                )
        } 
    }

    clearCache(event){
        let confirmation = confirm('this will clear all cached data, any unsaved data will be lost. Are you sure you want to proceed?')
        
        if (confirmation) {
            this.dataContextService.clearCache([this.utilsService.financeAppResourceData,
                                            this.utilsService.financeAppMaterialData,
                                            this.utilsService.financeAppTotalsData,
                                            this.utilsService.financeAppSummaryData])
                .subscribe(
                    data => {
                        console.log(data);
                    },
                    err => {
                        console.error(err);
                    },
                    () => {
                        console.log('save data api call complete')
                    }
                )                                                    
        }
    }
}