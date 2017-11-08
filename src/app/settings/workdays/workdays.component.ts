import { Component, OnInit, OnDestroy } from '@angular/core'
import { SettingsService } from '../../service/settings.service'
import { CommonApiService } from '../../service/api-common.service'
import { UtilsService } from '../../service/utils.service'
import { ListService } from '../../service/list.service'
// import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'

import { FabricButtonWrapperComponent } from '../../office-fabric/button/fabric.button.wrapper.component'
import { FabricTextFieldWrapperComponent } from '../../office-fabric/textfield/fabric.textfield.wrapper.component'

import { IYear } from '../../model/year.model'
import { ILogModel } from '../../model/log.model'
import { IItemPropertyModel } from '../../model/data-validation.model'

import { Subscription } from 'rxjs/subscription'

export class Log {
        public ItemId;
        public Description;
        public Type;
        public Timestamp;
        public Verbose;
        public State;

        constructor(){
            this.ItemId = 0;
            this.Description = '';
            this.Type = '';
            this.Timestamp = new Date();
            this.Verbose = false;
            this.State = '';
        }
    }

@Component({
    selector: 'workdays-settings',
    templateUrl: './workdays.component.html',
    styles: [`
        div, select, option {
            color: #000000;
        }
    `]
})
export class SettingsWorkDaysComponent implements OnInit, OnDestroy {
    public logs: Array<any>
    public years: Array<number>;
    public selectedYear: IYear;
    public workdayData: Array<IYear>
    private workdayStream: Subscription;

    constructor(private settingsService: SettingsService,
                private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private listService: ListService,
                // private workdayService: WorkdayService,
                private scriptService: ScriptService,
                private dataContextService: DataContextService,
                private uiStateService: UiStateService){
                    this.logs=[]
                }

    ngOnInit(){
        this.init()
    }

    init(){
        this.workdayData = JSON.parse(JSON.stringify(this.dataContextService.workdayData))
        this.years = this.processYears();
        
        this.workdayStream = this.dataContextService.getWorkingdayDataStream().subscribe(data => {
            console.error('WORKDAY DATA RECEIVED')
            this.workdayData =  data
            this.processYears();
        });
    }

    ngOnDestroy(){
        this.workdayStream.unsubscribe()
    }

    getWorkDays(event){
        // this.scriptService.getWorkdays()
        //             .subscribe(
        //                 data => {
        //                     if (typeof(data) == 'object' &&
        //                         data.hasOwnProperty('functionCall') &&
        //                         data.hasOwnProperty('result') &&
        //                         data.functionCall == 'processWorkingDays' &&
        //                         data.result == true
        //                     ) {
        //                         this.workdayData = this.workdayService.workdayData
        //                         this.years = this.processYears()
        //                     }
        //                      typeof(data) == 'object'
        //                      ? this.logs.push(JSON.stringify(data))
        //                      : this.logs.push(data);
        //                 },
        //                 err => {
        //                      typeof(err) == 'object'
        //                      ? this.logs.push(JSON.stringify(err))
        //                      : this.logs.push(err);
        //                 },
        //                 () => {
        //                     this.logs.push('save updates api call complete')
        //                 }
        //             )
        this.scriptService.loadAppData([this.utilsService.financeAppWorkingDaysData], this.settingsService.year)
                    .subscribe(
                        data => console.log(data),
                        err => console.log(err),
                        () => { 
                            this.uiStateService.updateMessage('data retrieved', this.utilsService.completeStatus)
                                .subscribe(this.utilsService.getSubscriber())
                            console.log('get workday data complete')
                        }
                    )

    }
    filterWorkdayData(year){
        if (this.workdayData) {
            this.selectedYear = this.workdayData.find(entry => {
                return +entry.Year == +year; 
            })
        }
    }

    processYears(){
        console.log(this.workdayData)
        if(this.workdayData) {
            return this.workdayData.map(value => {
                return value.Year
            })
        }
    }

    updateWdData(value, property){
        this.selectedYear[property] = value;
    }

    saveUpdates(event){
        this.scriptService.updateAppdata(this.utilsService.financeAppWorkingDaysData, 
                                        this.selectedYear.ID,
                                        this.prepSelectedYear())
                            .subscribe(
                                data => console.log(data),
                                err => console.log(err),
                                () => {
                                    this.uiStateService.updateMessage('update complete', this.utilsService.completeStatus)
                                        .subscribe()
                                    console.log('save updates api call complete')
                                }
                            )
    }

    cancelUpdates(event){
        this.selectedYear = null;
        this.workdayData = JSON.parse(JSON.stringify(this.dataContextService.workdayData))
    }

    prepSelectedYear():Array<IItemPropertyModel>{
        let _fieldValues = []
        let _months:Array<string> = this.utilsService.Months
        for (let key in this.selectedYear) {
            // if(key !== 'ID') {
            // updating the month values
            if(_months.indexOf(key) > -1) {
                _fieldValues.push({
                    fieldName: key,
                    fieldValue: +this.selectedYear[key]
                })
            }
        }
        return _fieldValues
    }
}
