import { Component, OnInit } from '@angular/core';

import { ILogModel } from '../../model/log.model'

import { LogService } from '../../shared/log.service'
import { CommonApiService } from '../../shared/api-common.service'
import { UtilsService } from '../../shared/utils.service'
import { ScriptService } from '../../shared/scripts.service'

@Component({
    selector: 'logger',
    templateUrl: './logger.component.html',
    styles:[`
        button {
            color: black;
        }
        
    `]
})
export class LoggerComponent implements OnInit {
    public _logs: Array<ILogModel>
    public _enableVerbose: boolean

    constructor(private logService: LogService,
                private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private scriptService: ScriptService){
        this._logs = [];
    }

    ngOnInit(){
        this.refreshLogs();
    }

    refreshLogs(){
        this._logs = this.logService.logs;
        this._logs = this._logs.reverse().filter((value, index, array) => {
            if (this._enableVerbose == false) {
                return value.Verbose == false
            } else {
                return value.Verbose == false || value.Verbose == true
            }
        });
    }

    enableVerbose(value){
        if (value == "Yes") {
            this._enableVerbose = true
        } else {
            this._enableVerbose = false;
        }
        this.refreshLogs();
        
    }

    saveLogs(){
        // this.commonApiService.addItems(this.utilsService.financeAppLogsData, this.utilsService.appWeb, this.logService.prepLogs(false))
        //     .subscribe(this.getSubscriber())

        this.scriptService.saveLogsBatch().subscribe(this.getSubscriber())
    }

    getLogs(){
        this.scriptService.getLogs().subscribe(this.getSubscriber())
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

    lengthLogs(){
        console.log(this.logService.lengthLogs)
    }



}