import { Injectable } from '@angular/core';

@Injectable()
export class LogService {
    private _logs:Array<any>
    private _logId: number
    constructor(){
        this._logs = []
        this._logId = 0
    }

    log(desc:any){
        let log = {};
        
        log['id'] = this.generateId()
        log['description'] = desc;
        log['timestamp'] = new Date();

        this._logs.push(log);
    }

    get logs():Array<any>{
        return this._logs;
    }

    generateId(){
        this._logId ++
        return this._logId;
    }

}