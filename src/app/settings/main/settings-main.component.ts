import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterContentChecked} from '@angular/core'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'
import { ScriptService } from '../../service/scripts.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'

import { ISettings, ISettingsOptions } from '../../model/settings.model'

import { Observable } from 'rxjs/Rx';

import { FabricDropdownWrapperComponent } from '../../office-fabric/dropdown/fabric.dropdown.wrapper.component'
import { FabricToggleWrapperComponent } from '../../office-fabric/toggle/fabric.toggle.wrapper.component'

@Component({
    selector: 'settings-main',
    templateUrl: './settings-main.component.html'
})
export class SettingsMainComponent implements OnInit, AfterViewInit { 
    public selectedYear: number;
    public years: Array<number>;
    public year: number
    public autoSaveValue: boolean;
    public sharePointModeValue: boolean;
    public persistLogsValue: boolean;
    public verboseLogsValue: boolean;
    public workingHoursInDayValue: number;
    public tsWeightingValue: number;
    public listAutoCheckValue: boolean;
    public tswInput: HTMLElement;

    constructor(private settingsService: SettingsService,
                private utilsService: UtilsService,
                private scriptService: ScriptService,
                private dataContextService: DataContextService,
                private uiStateService: UiStateService ) {
    }

    @ViewChild('tsweighting') private tswDiv: ElementRef

    ngOnInit() {
        this.settingsService.getSettingsStream().subscribe(data => {
            this.year = data.year;
            this.selectedYear = +data.year;
            this.autoSaveValue = data.autoSave
            this.sharePointModeValue = data.sharePointMode
            this.years = <Array<number>>data.years
            this.workingHoursInDayValue = data.workingHoursInDay
            this.tsWeightingValue = data.tsWeighting
            this.listAutoCheckValue = data.listAutoCheck
            this.persistLogsValue = data.persist
            this.verboseLogsValue = data.verbose
        })
        this.settingsService.getSettings()

        this.tswInput = this.tswDiv.nativeElement.getElementsByTagName('input')[0]
    }

    ngAfterViewInit(){
        //register event listner on the tsweight input field
        let tsWeight = 
            Observable.fromEvent(this.tswInput, 'keyup',)
            .debounceTime(1000)
            .subscribe((data:Event) => {
                this.updateSetting('TsWeighting',data.target['value'])
            });      
    }

    yearSelect(year){
        this.updateSetting('Year', year)
    }

    autoSaveSelect(value: boolean){
        this.updateSetting('AutoSave', value)
    }

    sharePointModeSelect(value: boolean){
        this.updateSetting('SharePointMode', value)
    }

    persistLogsSelect(value: boolean){
        this.updateSetting('Persist', value)
    }

    verboseLogsSelect(value: boolean){
        this.updateSetting('Verbose', value)
    }

    listAutoCheckSelect(value: boolean){
        this.updateSetting('ListAutoCheck', value)
    }

    tsWeightingSet(value: any) {
    }



    updateSetting(settingName, fieldValue) {
        this.scriptService.updateSetting(this.prepDataForUpdate(settingName, fieldValue))
                .subscribe(
                    data => {
                        if (typeof(data) == 'object' &&
                            data.hasOwnProperty('apiCall') &&
                            data.hasOwnProperty('result') &&
                            data.apiCall == this.utilsService.apiCallUpdateItem &&
                            data.result == true
                        ) {
                            console.log('item updated successfully')
                        }                
                        console.log('next', data)
                    },
                    err => {
                        console.log('error', err)
                    },
                    () => {
                        this.settingsService.getSettings()
                        if(settingName == 'Year') {
                            this.dataContextService.checkForCachedData([this.utilsService.financeAppResourceData,
                                                            this.utilsService.financeAppMaterialData,
                                                            this.utilsService.financeAppTotalsData,
                                                            this.utilsService.financeAppSummaryData], fieldValue)
                            .mergeMap(data => 
                                (typeof(data) == 'object' &&
                                data.hasOwnProperty('functionCall') &&
                                data.hasOwnProperty('listName') &&
                                data.hasOwnProperty('result') &&
                                data.hasOwnProperty('dataExists') &&
                                data.functionCall == 'checkForCachedData' &&
                                data.result == true &&
                                data.dataExists == false
                                )
                                ? this.scriptService.loadAppData(data.listName, fieldValue)
                                : Observable.of(data)
                            )
                        }
                        this.uiStateService.updateMessage('update settings complete', this.utilsService.completeStatus).subscribe()
                        console.log('completed updating setting')
                    }
                )
    }


    prepDataForUpdate(fieldName, fieldValue){
        return [{
            fieldName: fieldName,
            fieldValue: fieldValue
        }]
    }


    getSubscriber():any {
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