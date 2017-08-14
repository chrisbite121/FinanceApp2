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
    public includeResourceList: boolean;
    public includeMaterialList: boolean;
    public includeTotalList: boolean;
    public includeSummaryList: boolean;

    constructor(private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private dataContextService: DataContextService){
        this.logs = [];
        this.includeResourceList = true
        this.includeMaterialList = true
        this.includeSummaryList = true
        this.includeTotalList = true
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
        
        let _listArray = this.constructListArray()

        if(_listArray.length == 0) {
            alert('validation error: no lists selected')
            return
        }

        if (confirmation) {
            this.dataContextService.clearCache(_listArray)
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
                        console.log('load data api call complete')
                    }
                )
        } 
    }

    clearCache(event){
        let confirmation = confirm('this will clear all cached data, any unsaved data will be lost. Are you sure you want to proceed?')
        
        let _listArray = this.constructListArray()
        if(_listArray.length == 0) {
            alert('validation error: no lists selected')
            return
        }

        if (confirmation) {
            this.dataContextService.clearCache(_listArray)
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

    includeResourceSelect($event) {
        this.includeResourceList = $event
    }

    includeMaterialSelect($event) {
        this.includeMaterialList = $event
    }
    
    includeTotalSelect($event) {
        this.includeTotalList = $event
    }
    
    includeSummarySelect($event) {
        this.includeSummaryList = $event
    }    

    constructListArray(){
        let _listArray:Array<string> = []
        if (this.includeResourceList) {
            _listArray.push(this.utilsService.financeAppResourceData)
        }

        if (this.includeMaterialList) {
            _listArray.push(this.utilsService.financeAppMaterialData)
        }
        
        if (this.includeTotalList) {
            _listArray.push(this.utilsService.financeAppTotalsData)
        }

        if (this.includeSummaryList){
            _listArray.push(this.utilsService.financeAppSummaryData)
        }

        return _listArray
    }
}