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

    constructor(private logService: LogService){
        this._logs = [];
    }

    ngOnInit(){
        this.refreshLogs();
    }

    refreshLogs(){
        this._logs = this.logService.logs.reverse();
    }

}