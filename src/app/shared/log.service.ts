import { Injectable } from '@angular/core';

interface ILogModel {
    id: number,
    description: string,
    type: string,
    timestamp: Date,
    verbose: Boolean
}

@Injectable()
export class LogService {
    private _logs:Array<ILogModel>
    private _logId: number
    constructor(){
        this._logs = []
        this._logId = 0
    }

    log(desc:any, type:string = 'info', verbose:boolean = false){
        let log = {
            id: this.generateId(),
            type: type,
            description: desc,
            timestamp: new Date(),
            verbose: verbose
        };
        
        this._logs.push(log);
    }

    get logs():Array<any>{
        return this._logs;
    }

    generateId(){
        return this._logs.length + 1
    }

}