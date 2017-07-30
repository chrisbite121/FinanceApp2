import { Component, OnInit } from '@angular/core'
import { SettingsService } from '../../service/settings.service'
import { CommonApiService } from '../../service/api-common.service'
import { UtilsService } from '../../service/utils.service'
import { ListService } from '../../service/list.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'

import { FabricButtonWrapperComponent } from '../../office-fabric/button/fabric.button.wrapper.component'
import { FabricTextFieldWrapperComponent } from '../../office-fabric/textfield/fabric.textfield.wrapper.component'

import { IYear } from '../../model/year.model'
import { ILogModel } from '../../model/log.model'

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
export class SettingsWorkDaysComponent implements OnInit {
    public logs: Array<any>
    public years: Array<number>;
    public selectedYear: IYear;
    public workdayData: Array<IYear>

    constructor(private settingsService: SettingsService,
                private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private listService: ListService,
                private workdayService: WorkdayService,
                private scriptService: ScriptService){
                    this.logs=[]
                }

    ngOnInit(){
        if(this.settingsService.useWorkDaysList) {
            if(this.settingsService.workingDaysListReady) {
                    this.workdayData = this.workdayService.workdayData
                    this.years = this.processYears()
            } else {
                this.getWorkDays(true)
            }
        } else {
            this.workdayData = this.workdayService.generateDummyData()
            this.years = this.processYears()
        }
    }

    getWorkDays(event){
        this.scriptService.getWorkdays()
                    .subscribe(
                        data => {
                            if (typeof(data) == 'object' &&
                                data.hasOwnProperty('functionCall') &&
                                data.hasOwnProperty('result') &&
                                data.functionCall == 'processWorkingDays' &&
                                data.result == true
                            ) {
                                this.workdayData = this.workdayService.workdayData
                                this.years = this.processYears()
                            }
                             typeof(data) == 'object'
                             ? this.logs.push(JSON.stringify(data))
                             : this.logs.push(data);
                        },
                        err => {
                             typeof(err) == 'object'
                             ? this.logs.push(JSON.stringify(err))
                             : this.logs.push(err);
                        },
                        () => {
                            this.logs.push('save updates api call complete')
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
        this.scriptService.updateWorkdays(this.selectedYear.ID,this.prepSelectedYear())
                            .subscribe(
                                data => {
                                    if (typeof(data) == 'object' &&
                                        data.hasOwnProperty('functionCall') &&
                                        data.hasOwnProperty('result') &&
                                        data.functionCall == 'processWorkingDays' &&
                                        data.result == true
                                    ) {
                                        this.workdayData = this.workdayService.workdayData
                                        this.years = this.processYears()
                                    }                                                    
                                    this.logs.push(data)
                                },
                                err => {
                                    this.logs.push(err)
                                },
                                () => {
                                    this.logs.push('save updates api call complete')
                                }
                            )
    }

    prepSelectedYear(){
        let _fieldValues = []
        for (let key in this.selectedYear) {
            if(key !== 'ID') {
                _fieldValues.push({
                    fieldName: key,
                    fieldValue: this.selectedYear[key]
                })
            }
        }
        console.log(_fieldValues)
        return _fieldValues
    }

}
