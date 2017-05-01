import { Component, OnInit } from '@angular/core';

import { LogService } from '../../shared/log.service'

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
    public _logs: Array<any>
    public enableVerbose: boolean

    constructor(private logService: LogService){
        this._logs = [];
    }

    ngOnInit(){
        this.refreshLogs();
    }

    refreshLogs(){
        this._logs = this.logService.logs.reverse().filter((value, index, array) => {
            if (this.enableVerbose == false) {
                return value.verbose == false
            } else {
                return true
            }
        });
    }

    enableVervose(value){
        if (value == "Yes") {
            this.enableVerbose = true
        } else {
            this.enableVerbose = false;
        }
        this.refreshLogs();
        
    }

}