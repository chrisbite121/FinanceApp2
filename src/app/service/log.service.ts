import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service'
import { CommonApiService } from './api-common.service'
import { UtilsService } from './utils.service'

import { ILogModel } from '../model/log.model'
import { IItemPropertyModel } from '../model/data-validation.model'

import { IReportResult,
        IGetItemsResult } from '../model/data-validation.model'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import 'rxjs/operator/mergeMap'

declare var SP;
declare var hostUrl;
declare var appUrl;

@Injectable()
export class LogService {
    private _logs:Array<ILogModel>
    private _logId: number
    private hostUrl:string =  '';
    private appUrl:string = '';
    private _error:string = 'error';
    private _success:string = 'success';
    private _info: string = 'info';

    private _saved: string = 'saved'
    private _notSaved: string = 'not saved'

    constructor(private settingsService: SettingsService,
                //private commonApiSevice: CommonApiService,
                private utilsService: UtilsService){
        this._logs = []
        this._logId = 0

            try{
                this.hostUrl = hostUrl;
            } catch (e) {
                this.log(e, this._error, false);
            }

            try{
                this.appUrl = appUrl;
            } catch (e) {
                this.log(e, this._error, false);
            }

        }        


    log(desc:any, type:string = this.utilsService.infoStatus, verbose:boolean = false){
        let log: ILogModel = {
            ItemId: this.generateId(),
            Type: type,
            Description: typeof(desc) == 'object'? JSON.stringify(desc) : desc,
            Timestamp: new Date(),
            Verbose: verbose,
            State: this._notSaved
        };
        this._logs.push(log);
        
        // let _useLoggingList = this.settingsService.useLoggingList
        
        // if(!_useLoggingList) {
        //     console.log('logging list not being used')
        //     return
        // }


        // let _persist = this.settingsService.persist
        // let _verbose = this.settingsService.verbose
        // let _loggingListReady = this.settingsService.loggingListReady

        // if (_persist && _loggingListReady)  {

        //     let _logArry:Array<IItemPropertyModel> = []
        //     //remove state property as item is being saved
        //     for (let key in log) {
        //         if (key !== 'State') {
        //             let _fieldProperty:IItemPropertyModel = {
        //                 fieldName: key,
        //                 fieldValue: log[key]
        //             }
        //             _logArry.push(_fieldProperty)
        //         }
        //     }

        //     this.addItem(this.utilsService.financeAppLogsData, this.utilsService.appWeb, _logArry)
        //         .subscribe(
        //             data => {
        //                if (typeof(data) == 'object' && 
        //                 data.hasOwnProperty('listName') &&
        //                 data.hasOwnProperty('apiCall') &&
        //                 data.hasOwnProperty('result') &&
        //                 data['apiCall'] == this.utilsService.apiCallAddItem && 
        //                 data['result'] == true) {
        //                     // update log state value
        //                     log.State = this._saved
        //                     this._logs.push(log);
        //                 }
        //             },
        //             err => {
        //                 this._logs.push({
        //                     ItemId: this.generateId(),
        //                     Type: this.utilsService.errorStatus,
        //                     Description: `Unable to save log`,
        //                     Timestamp: new Date(),
        //                     Verbose: false,
        //                     State: this._notSaved                            
        //                 });
        //                 this._logs.push(log);
        //             },
        //             () => {}
        //         )
        // } else {
        //     // default secenario when not persisting logs
        //     this._logs.push(log);

        // }

        
    }

    get logs(){
        return this._logs
    }



    genLogSkipTakeCamlQuery(itemCount: number, skip:number, take:number = 500):string {

        //need to get inverse number to get correct skip step
        let _skip =  itemCount - skip - 500
        var camlQuery =  `<View>
                            <Query>
                                <Where>
                                    <Geq>
                                        <FieldRef Name='ID'/>
                                                <Value Type='Number'>
                                                    ${_skip}
                                                </Value>
                                    </Geq>
                                </Where>
                                <OrderBy>
                                    <FieldRef Name="ID" Ascending="FALSE"/>
                                </OrderBy>
                            </Query>
                            <RowLimit>
                                ${take}
                            </RowLimit>
                        </View>`
        return camlQuery
    }

    processItems(data:Array<ILogModel>):Observable<any> {
        let processItem$ = new Observable((observer:any) => {
            console.log(data)
            data.forEach(log => {
                log.State = this._saved
                this._logs.push(log)
            })
            
            console.log('UPDATED LOGS')
            console.log(this._logs)
            observer.next({
                functionCall: 'processLogs',
                result: true
            })
            observer.complete()
        })

        return processItem$
    }


    determinePersistLogs():Observable<any>{
        this.log(`determineLoggingType function called`, this.utilsService.infoStatus, true);
        let loggingType$ = new Observable((observer:Observer<any>) => {
            let response = {
                functionCall: 'persistLogs',
                result: this.settingsService.persist
            }
            observer.next(response);
            observer.complete();
            
        })  

        return loggingType$
    }

    prepLogs(verbose): Array<Array<IItemPropertyModel>> {
        let _logsArry: Array<Array<IItemPropertyModel>> = []
        let _filteredLogs
        if (verbose) {
            _filteredLogs = this._logs.filter(element => {
                return element.State === this._notSaved
            })
        } else {
            _filteredLogs = this._logs.filter(element => {
                return element.State === this._notSaved && element.Verbose === false
            })
        }

        _filteredLogs.forEach(log => {
            let _logItem = []
            for (let key in log) {
                let _fieldProperty:IItemPropertyModel = {
                    fieldName: '',
                    fieldValue: '',
                }
                // no need to include state
                if (key !== 'State') {
                    _fieldProperty.fieldName = key;
                    _fieldProperty.fieldValue = log[key]
                    _logItem.push(_fieldProperty)
                }
            }
            _logsArry.push(_logItem)
        })
        return _logsArry
    }

    clearLogs():Observable<any> {
        this.log(`clearLogs function called`, this.utilsService.infoStatus, true);
        let clearLogs$ = new Observable((observer:Observer<any>) => {

            this._logs = [];
            
            let result = {
                functionCall: 'clearLogs',
                result: true
            }
            observer.next(result)
            observer.complete()
    })
        return clearLogs$
    }
    
    generateId(){
        //date returns a number in milliseconds ensuring a unique ID whilst keeping order
        return this._logs.length + 1
    }

    get lengthLogs(){
        return this._logs.length
    }



   addItem(listName: string, contextType: string, itemValues: Array<IItemPropertyModel>): Observable<any>{
        this.log('Add Item funtion called', this._info, true);
        this.log(`listName parameter: ${listName}, contextType parameter: ${contextType}, itemValues parameters: ${itemValues}`, this._info, true);

        let addItem$ = new Observable((observer:Observer<any>) => {
            observer.next('add Item function called');

            if (!this.settingsService.addListItems) {
                let permissionMsg = `user does not have permissions to add a field on a list`
                this.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.log(`unable to create clientContext`, this._error, false);
                this.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
            
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }

            let list, itemCreateInfo, listItem
            try {
                this.log('setting up itemCreationInformation object for function: addItem', this._info, true);
                list = context.get_web().get_lists().getByTitle(listName);

                itemCreateInfo = new SP.ListItemCreationInformation();
                listItem = list.addItem(itemCreateInfo);
            } catch (e) {
                this.log('error setting up itemCreationInformation object for function: addItem', this._error, false);
                this.log(e,this._error, false);
                observer.error('error setting up itemCreationInformation object for function: addItem')
                return;
            }
            
            try {
                this.log('defining list item for function: addItem', this._info, true);
                
                itemValues.forEach(element => {
                    this.log(`adding field to list ${listName} with values...`, this._info, true)
                    this.log(String(element.fieldName) + ': ' + String(element.fieldValue), this._info, true);
                    listItem.set_item(element.fieldName, element.fieldValue);
                });
                listItem.update();
            } catch (e) {
                this.log('error setting list item definition for function: addItem', this._error, false);
                observer.error('error setting list item definition for function: addItem')
                return;
            }


            try {
                this.log('loading list item for function: addItem', this._info, true);
                clientContext.load(listItem);
            } catch (e) {
                this.log(`unable to load list item in function: addItem in list ${listItem}`)
                this.log(e,this._error, false);
                observer.error(`unable to load list item in function: addItem in list ${listItem}`);
                return;
            }
            

            this.log('executing JSOM query for function: addItem', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let resultMsg = `Item successfully created in List: ${listName}`
                let result = {
                    apiCall: this.utilsService.apiCallAddItem,
                    listName: listName,
                    result: true
                }
                observer.next(result);
                this.log(resultMsg, this._success, true);
                observer.complete()
                return;                
            }

            function failure(sender, args) {
                let apiResult = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
                let resultMsg = `Request failed to addItem to list ${listName}`
                let result = {
                    apiCall: this.utilsService.apiCallAddItem,
                    listName: listName,
                    result: false
                }

                observer.next(result);
                this.log(resultMsg, this._error, false);
                this.log(apiResult, this._error, false);
                observer.complete()
                return;
            }            
        })
        return addItem$
    }        


    checkUrl(contextType) {
        if (contextType == this.utilsService.hostWeb) {
            return contextType !== ''
        }

        if (contextType == this.utilsService.appWeb) {
            return contextType !== ''
        }
    }

}