import { Component, OnInit } from '@angular/core';

import { ILogModel } from '../../model/log.model'
import { ICommandButtonEntry, ICommandButtonLabel } from '../../model/CommandButton.model'

import { LogService } from '../../service/log.service'
import { CommonApiService } from '../../service/api-common.service'
import { UtilsService } from '../../service/utils.service'
import { ScriptService } from '../../service/scripts.service'
import { PagerService } from '../../service/pagination.service'

import { FabricDropdownWrapperComponent } from '../../office-fabric/dropdown/fabric.dropdown.wrapper.component'
import { FabricToggleWrapperComponent } from '../../office-fabric/toggle/fabric.toggle.wrapper.component'
import { FabricCommandButtonWrapperComponent } from '../../office-fabric/commandbutton/fabric.commandButton.wrapper.component'

import { CommandButtonLabel, CommandButtonValues } from './logger.config'

@Component({
    selector: 'logger',
    templateUrl: './logger.component.html',
    styleUrls: ['./logger.component.css']
})
export class LoggerComponent implements OnInit {
    public _logs: Array<ILogModel>
    public _enableVerbose: boolean
    public commandButtonLabel:ICommandButtonLabel
    public commandButtonValues: Array<ICommandButtonEntry>
    public logTypeOptions: Array<string>
    public logTypeDefaultValue: string
    // pager object
    public pager: any = {};
    // paged items
    public pagedItems: any[];

    constructor(private logService: LogService,
                private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private scriptService: ScriptService,
                private pagerService: PagerService){
        this._logs = [];
        this.commandButtonLabel = CommandButtonLabel
        this.commandButtonValues = CommandButtonValues
        this._enableVerbose = false;
        this.logTypeDefaultValue = 'All'
        this.logTypeOptions = ['All', this.utilsService.infoStatus, this.utilsService.errorStatus,this.utilsService.successStatus]
    }

    ngOnInit(){
        this.refreshLogs(null);
        this.reverseLogs()
    }

    reverseLogs(){
        if(this._logs && Array.isArray(this._logs)){
            this._logs = this._logs.reverse()
        } else {
            console.error('unable to reverse logs')
        }
        this.setPage(1)
    }

    refreshLogs(event){
            console.log('refresh logs')
            this._logs = JSON.parse(JSON.stringify(this.logService.logs));
                this._logs = this._logs.filter((value, index, array) => {
                    if (this._enableVerbose == false) {
                        return value.Verbose == false
                    } else {
                        return value.Verbose == false || value.Verbose == true
                    }
                });
            this.setPage(1)           
        }

    showVerbose(value){
        if (value) {
            this._enableVerbose = true
        } else {
            this._enableVerbose = false;
        }
        this.refreshLogs(null);
        
    }

    filterType(type){
        if(type=='All'){
            this._logs = JSON.parse(JSON.stringify(this.logService.logs))
        } else {
            this._logs = JSON.parse(JSON.stringify(this.logService.logs.filter((value, index, array) => {
                return value.Type == type
            })))
        }
        this.setPage(1)
    }

    saveLogs(event){
        this.scriptService.saveLogsBatch().subscribe(this.getSubscriber())
    }

    getLogs(event){
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

    lengthLogs(event){
        console.log(this.logService.lengthLogs)
    }

    generateLog(verbose) {
        verbose
        ? this.logService.log('test verbose log', this.utilsService.infoStatus, true)
        : this.logService.log('test log', this.utilsService.infoStatus, false);

        this.refreshLogs(true)
    }

    commandButtonClick(event){
        console.log(event.id)
        let id = event.id
        switch(id){
            case 'lengthLogs':
                this.lengthLogs(event)
            break;
            case 'refreshLogs':
                this.refreshLogs(event)
            break;
            case 'saveLogs':
                this.saveLogs(event)
            break;
            case 'getLogs':
                this.getLogs(event)
            break;
            case 'generateLog':
                this.generateLog(false)
            break;
            case 'generateLogVerbose':
                this.generateLog(true)
            break;
            case 'reverseLogs':
                this.reverseLogs()
            break;
            default:
                console.error(`unrecognised command request: ${id}`)
            break;
        }
    }

    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
 
        // get pager object from service
        this.pager = this.pagerService.getPager(this._logs.length, page, 20);
 
        // get current page of items
        this.pagedItems = this._logs.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

}