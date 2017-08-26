import { Injectable } from '@angular/core'
import { LogService } from './log.service'

import { UtilsService } from './utils.service'
import { CommonApiService } from './api-common.service'
import { UiStateService } from './ui-state.service'
import { ListService } from './list.service'
import { HealthReportService } from './health-report.service'
import { SettingsService } from './settings.service'
import { DataContextService } from './data-context.service'
import { WorkdayService } from './workdays.service'
import { NotificationService } from './notification.service'
import { StateService } from './state.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import 'rxjs/operator/mergeAll'
import 'rxjs/operator/map'
import 'rxjs/operator/mergeMap'
import 'rxjs/operator/merge'

import { UUID } from 'angular2-uuid';

//Models
import { IItemPropertyModel } from '../model/data-validation.model'

import { IFieldExists,
        IFieldThatDoesntExist,
        IFieldUpdateReportResult,
        IFieldUpdateResult,
        IListExists,
        IFieldSchemaReportResult,
        IReportResult } from '../model/data-validation.model'
import { IHealthReport,
        IActionHealthReport,
        ISettingsReport,
        IProvisionerReport } from '../model/health-report.model'

//Used for development only
import { xmlData } from '../config/xmldata'

@Injectable()
export class ScriptService {
    private logs:Array<any>;
    private manageWebPermissions: Boolean;
    private manageListPermissions: Boolean;
    private viewListPermissions: Boolean;
    private addListItemPermissions: Boolean;
    private scriptsStream: Subject<any> = new Subject();

    public xmlString: string = xmlData;
    // private _healthReport: IHealthReport;
    private _actionHealthReportResults: IActionHealthReport
    private _settingsReport: ISettingsReport;
    private _provisionerReport: IProvisionerReport;

    constructor(private logService: LogService,
                private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private uiStateService: UiStateService,
                private listService: ListService,
                private healthReportService: HealthReportService,
                private settingsService: SettingsService,
                private dataContextService: DataContextService,
                private workdaysService: WorkdayService,
                private notificationService: NotificationService,
                private stateService: StateService){
        this.init()
    }

    init(){
        this.logs = [];
        this.manageWebPermissions = false;

    }

    getScriptsDataStream(): Observable<any> {
        return this.scriptsStream.asObservable()
    }

/*
    Contents:

    1. get permissions
    2. Health Report
    3. Action Health report
    4. Provisioner
    5. Settings Check
    6. init app
*/

////////////////////////////////////////////////////////////////////////////////////////
//HEALTH REPORT
/* 
1. check permissions

2. check materials list, resource list, totals list
3. create lists if they do not exists
3. if list exists check if corresondong fields exist
4. create field/s if do/es not exist
5. where fields exists check that they are of the corrct Type and Non Mandatory are all fields non madatory - 
    use string matching regexp with this method SP.FieldCollection.get_schemaXml ()
*/
healthReport(listArray: Array<string>) {
    let healthCheck$:Observable<any> =
            // reset health report data
            this.healthReportService.resetHealthReport(listArray)
            //check permissions
            .mergeMap((data:any) =>
                        (typeof(data) == 'object' &&
                        data.hasOwnProperty('functionCall') &&
                        data.hasOwnProperty('result') &&
                        data.result == true &&
                        data.functionCall == 'resetHealthReport'
                        )
                        ? this.checkPermissions(this.utilsService.viewList, listArray)
                        : Observable.of(data)
            )
            .mergeMap((data: any) =>
                        (typeof(data) == 'object' &&
                        data.hasOwnProperty('functionCall') &&
                        data.hasOwnProperty('permission') &&
                        data.hasOwnProperty('result') &&
                        data.hasOwnProperty('listName') &&
                        data.result == true
                        )
                        ? this.commonApiService.listExists(
                                data['listName'], 
                                this.listService.getListContext(data['listName']))
                        : Observable.of(data)
            )
            .mergeMap((data:any) => 
                        (typeof(data) == 'object' && 
                        data.hasOwnProperty('listName') &&
                        data.hasOwnProperty('apiCall') &&
                        data.hasOwnProperty('result') &&
                        data.hasOwnProperty('listExists') &&
                        data['apiCall'] == this.utilsService.apiCallListExists && 
                        data['result'] == true &&
                        data['listExists'] == true)
                        
                        ? this.commonApiService.getListXml(data['listName'], this.listService.getListContext(data['listName'])) 
                        : Observable.of(data)
            )
            .mergeMap((data:any) => 
                        (typeof(data) == 'object' &&
                        data.hasOwnProperty('result') &&
                        data.hasOwnProperty('schemaXml') &&
                        data.hasOwnProperty('apiCall') &&
                        data['result'] == true && 
                        data['schemaXml'] &&
                        data['apiCall'] == this.utilsService.apiCallListXmlData)
                        
                        ? this.checkFieldsHealthReport(data) 
                        : Observable.of(data)
            )
            .mergeMap((data:any) => 
                        (typeof(data) == 'object' &&
                        data.hasOwnProperty('reportHeading') &&
                        data.hasOwnProperty('reportResult'))

                        ? this.healthReportService
                            .updateHealthReport(
                                data.listName, 
                                this.healthReportService.healthReportname,
                                data.reportHeading, 
                                data)
                        : Observable.of(data)
            )

    return healthCheck$
}

checkPermissions(type:string, listArray:Array<string>): Observable<any>{
    let permissions$ = new Observable((observer:Observer<any>) => {
        listArray.forEach(listName => {
            if (this.settingsService[type]) {
                observer.next({
                    functionCall: 'checkPermissions',
                    permission: this.utilsService[type],
                    result: true,
                    listName: listName
                })

                observer.next({
                    reportHeading: 'permissions',
                    reportResult: true,
                    permission: this.utilsService[type],
                    listName: listName
                })
            } else {
                observer.next({
                    reportHeading: 'permissions',
                    reportResult: false,
                    permission: this.utilsService[type],
                    listName: listName
                })
            }
        })        
        observer.complete()
    })
    return permissions$
}

private checkFieldsHealthReport(data): Observable<any>{

    let checkFields$ = new Observable((observer:any) => {

        let schemaXml = data.schemaXml;

        let listName = data.listName;

        let fieldsExists: Array<IReportResult> = [];
        let fieldsRequired: Array<IFieldUpdateReportResult> = [];
        let fieldsType: Array<IFieldUpdateReportResult> = [];
        let listDefintion: Array<any>;

        //parse http response into xml
        let xmlDoc = this.utilsService.parseXml(schemaXml);
        //convert xml to Json for massive performance imporvements
        let jsonFldArry = this.utilsService.xmlToJson(xmlDoc);
        //isolate just the array of fields

        try {
            jsonFldArry = jsonFldArry['List']['Fields']['Field']
        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
            return;
        }

        //get a copy of the list defintion to compare agains
        try {
            listDefintion = JSON.parse(JSON.stringify(this.listService.getListSpec(listName)));
        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
        }
        
        //previous methods tried iterating through the list definition first and the nesting iteratively through the fields.  
        // This method takes a fraction of the time
        //iterate through the fields
        for (let i in jsonFldArry) {
            let _element
            try {
                _element = jsonFldArry[i]['@attributes'];
            } catch (e) {
                this.logService.log(e, this.utilsService.errorStatus, false);
            }
            //check if any fields set to required.  They shouldn't otherwise it may prevent list data from saving to it.
            if (_element.Required == 'TRUE') {
                    
                    //add fields set to requred into health report
                    observer.next({
                        reportHeading: this.utilsService.apiCallFieldsRequired,
                        reportResult: this.utilsService.failStatus,
                        listName: listName,
                        fieldName: _element.Name,
                        oldSchema: 'Required="TRUE"',
                        newSchema: 'Required="FALSE"'
                    })
            }
            let _i = -1
            if(listDefintion){
                //now see if field matches one on the field spec
                 _i = listDefintion.findIndex((element) => {
                    return element.Name === _element.Name
                })
            } else {
                this.logService.log(`unable to find list definition for listName: ${listName}`)
            }
            if (_i !== -1) {
                //Field found
                //check its of correct type. If not of correct type then the app may fail to save data
                if (_element.Type !== listDefintion[_i].Type) {
                    //add fields of wrong type into health report
                    observer.next({
                        reportHeading:this.utilsService.apiCallFieldsType,
                        reportResult:this.utilsService.failStatus,
                        listName: listName,
                        fieldName: _element.Name,
                        oldSchema: 'Type="' + _element.Type + '"',
                        newSchema: 'Type="' + listDefintion[_i].Type + '"'
                    })
              
                }
                //remove from index for performance gains on the loop as well as stricking off correctly found fields
                //any that are left in the array after the loop will imply that they don't exist on the list and will need to be created.
                listDefintion.splice(_i,1)
            }
        
        }

        //add missing fields into healthreport
        listDefintion.forEach(field => {
            observer.next({
                reportHeading: this.utilsService.apiCallFieldsExists,
                reportResult: this.utilsService.failStatus,
                listName: listName,
                fieldName: field.Name
            })
        })

        observer.complete()
    })

    return checkFields$;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//ACTION HEALTH REPORT

public actionHealthReport(listArray:Array<string>){
    let actionHealthReport$ = 
        // reset health report data
        this.healthReportService.resetActionHealthReport(listArray)
        .mergeMap(data =>
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') && 
            data.functionCall == 'resetActionHealthReport' &&
            data.result == true)
            ? this.checkPermissions(this.utilsService.manageList, listArray) 
            : Observable.of(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('permission') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.result == true)
            ? this.defineApiCallsActionHealthReport(listArray) 
            : Observable.of(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('contextType') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('fieldName') &&
            data.hasOwnProperty('newSchema') &&
            data.hasOwnProperty('oldSchema') &&
            data.functionCall == 'updateField')
            ? this.commonApiService
                .updateField(data.fieldName,
                            data.listName,
                            data.contextType,
                            data.oldSchema,
                            data.newSchema)
            : Observable.of(data)
        )
        .mergeMap(data =>
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('contextType') &&
            data.functionCall == 'createList')
            ? this.commonApiService.createList(data.listName, data.contextType)
            : Observable.of(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('fieldXmlArray') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('contextType') &&
            data.hasOwnProperty('result') &&
            data.functionCall == 'fieldsToCreate'
            )
            ? this.commonApiService.addListFields(data.listName, data.fieldXmlArray, data.contextType)
            : Observable.of(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data['apiCall'] == this.utilsService.apiCallCreateList &&
            data['result'] == true)
            ? this.commonApiService.updateField('Title', data['listName'],this.utilsService.hostWeb, 'Required="TRUE"', 'Required="FALSE"')
            : Observable.of(data)
        )
        .mergeMap((data:any) => 
                    (typeof(data) == 'object' &&
                    data.hasOwnProperty('reportHeading') &&
                    data.hasOwnProperty('reportResult'))

                    ? this.healthReportService
                            .updateHealthReport(
                                data.listName, 
                                this.healthReportService.actionHealthReportName, 
                                data.reportHeading, 
                                data)
                    : Observable.of(data)
        )
        
    return actionHealthReport$
}

defineApiCallsActionHealthReport(listArray): Observable<any>{
    let api$ = new Observable((observer: Observer<any>) => {
        //1. get data
        let _healthReport = JSON.parse(JSON.stringify(this.healthReportService.healthReport))
        let fieldsToCreate: Array<IReportResult> = [];

        if (typeof(_healthReport) == 'object') {
            for (let list in _healthReport) {
                if (_healthReport.hasOwnProperty(list)) {
                    console.log(_healthReport[list])
                    try {
                        if (_healthReport[list].hasOwnProperty('listExists') && Array.isArray(_healthReport[list].listExists)) {
                            _healthReport[list].listExists.forEach((element:IReportResult) => {
                                //if report status is set to fail then list doesn't exist
                                if (element.reportResult == this.utilsService.failStatus) {
                                    // listsToCreate.push(element)
                                    observer.next({
                                        functionCall: 'createList',
                                        listName: element.listName,
                                        contextType: this.listService.getListContext(element.listName)
                                    })
                                } 
                            })
                        }
                        if (_healthReport[list].hasOwnProperty('fieldsExists') && Array.isArray(_healthReport[list].fieldsExists)) {
                            _healthReport[list].fieldsExists.forEach((element:IReportResult) => {
                                // if report status is set to fail then field doesn't exist
                                if (element.reportResult == this.utilsService.failStatus) {
                                    fieldsToCreate.push(element)
                                }
                            })
                            let fieldsToCreateApi = this.constructFieldsToCreateApiArray(fieldsToCreate) || [];
                            console.error(fieldsToCreateApi)
                               if (fieldsToCreateApi && Object.keys(fieldsToCreateApi).length > 0) {
                                   console.log(fieldsToCreate)
                                    for (let listName in fieldsToCreateApi) {
                                        //NOTE API CALL HERE HAS BEEN DESIGNED TO TAKE AN ARRAY OF FIELDS FOR EACH LIST TO REDUCE API CALLS
                                        observer.next({
                                            functionCall: 'fieldsToCreate',
                                            fieldXmlArray: fieldsToCreateApi[listName],
                                            listName: listName,
                                            contextType: this.listService.getListContext(listName),
                                            result: true,
                                        })
                                    }
                                }                              

                          
                        }
                        if (_healthReport[list].hasOwnProperty('fieldsRequired') && Array.isArray(_healthReport[list].fieldsRequired)) {
                            _healthReport[list].fieldsRequired.forEach((element:IFieldUpdateReportResult) => {
                                // if report status is set to fail then field incorrectly set to required
                                if (element.reportResult == this.utilsService.failStatus) {
                                    // fieldsSetRequired.push(element)
                                    observer.next({
                                        functionCall: 'updateField',
                                        listName: element.listName,
                                        fieldName: element.fieldName,
                                        contextType: this.listService.getListContext(element.listName),
                                        newSchema: element.newSchema,
                                        oldSchema: element.oldSchema,
                                    })
                                }
                            })
                        }
                        if (_healthReport[list].hasOwnProperty('fieldsType') && Array.isArray(_healthReport[list].fieldsType)) {
                            _healthReport[list].fieldsType.forEach((element:IFieldUpdateReportResult) => {
                                // if report status is set to fail then field incorrectly set to wrong type
                                if (element.reportResult == this.utilsService.failStatus) {
                                    // fieldsWrongType.push(element)
                                    observer.next({
                                        functionCall: 'updateField',
                                        listName: element.listName,
                                        fieldName: element.fieldName,
                                        contextType: this.listService.getListContext(element.listName),
                                        newSchema: element.newSchema,
                                        oldSchema: element.oldSchema,
                                    })                                    
                                }
                            })
                        }
                    } catch(e) {
                        this.logService.log(e, this.utilsService.errorStatus, false)
                        this.scriptsStream.next('error getting health report data, exiting action health report function')
                        return;
                    }
                }
            }
        }
        observer.complete()
    })
    return api$
}


///////////////////////////////////////////////////////////////////////////////////////
// PROVISIONER
public provisioner(_listArry:Array<string>) {
    //check permissions
    //If list exists IGNORE else CREATe LISTS
    // this._provisionerReport = {
    //     date: new Date(),
    //     permissions: {
    //         permission: this.utilsService.viewList,
    //         result: false
    //     },
    //     listExists: [],
    //     createList: [],
    //     deleteList: [],
    //     errors: []
    // };
    let provisioner$ = 
            this.checkPermissions(this.utilsService.manageList, _listArry)
            .mergeMap((data: any) =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('permission') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('listName') &&
                data.result == true
                )
                ? this.commonApiService.listExists(
                        data['listName'], 
                        this.listService.getListContext(data['listName']))
                : Observable.of(data)
            )
            .mergeMap(data => 
                (typeof(data) == 'object' && 
                    data.hasOwnProperty('listName') && 
                    data.hasOwnProperty('apiCall') && 
                    data.hasOwnProperty('result') &&
                    data.hasOwnProperty('listExists') &&
                    data.result == true &&
                    data.listExists == false && 
                    data.apiCall == this.utilsService.apiCallListExists)
                ? this.commonApiService.createList(data['listName'], this.listService.getListContext(data['listName'])) 
                : this.placeholderObservable(data)
            )
            .mergeMap(data => 
                (typeof(data) === 'object' &&
                    data.hasOwnProperty('listName') && 
                    data.hasOwnProperty('apiCall') && 
                    data.hasOwnProperty('result') &&
                    data.apiCall == this.utilsService.apiCallCreateList &&
                    data.result == true)
                ? this.commonApiService.updateField('Title', data['listName'],this.listService.getListContext(data['listName']), 'Required="TRUE"', 'Required="FALSE"')
                : this.placeholderObservable(data)
            )
        return provisioner$
}

public resetLists(type? :string) {
    //check permissions
    //If list exists DELETE then RECREATE LISTS, otherwise CREATE
    let _listArry;

    switch (type) {
        case this.utilsService.hostWeb:
            _listArry = [this.utilsService.financeAppResourceData, 
                    this.utilsService.financeAppMaterialData,
                    this.utilsService.financeAppTotalsData,
                    this.utilsService.financeAppSummaryData]
        break;
        case this.utilsService.appWeb:
            _listArry = [this.utilsService.financeAppLogsData, 
                        this.utilsService.financeAppSettingsData,
                        this.utilsService.financeAppWorkingDaysData] 
        break;
        default:
            _listArry = [this.utilsService.financeAppResourceData, 
                    this.utilsService.financeAppMaterialData,
                    this.utilsService.financeAppTotalsData,
                    this.utilsService.financeAppLogsData, 
                    this.utilsService.financeAppSettingsData,
                    this.utilsService.financeAppWorkingDaysData,
                    this.utilsService.financeAppSummaryData]                     
        break;
    }

    let resetHostLists$ =
        this.checkPermissions(this.utilsService.manageList, _listArry)
        .mergeMap((data: any) =>
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('permission') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.result == true
            )
            ? this.commonApiService.listExists(
                    data['listName'], 
                    this.listService.getListContext(data['listName']))
            : Observable.of(data)
        )
        .mergeMap(data => 
            (typeof(data) === 'object' && 
                data.hasOwnProperty('listName') && 
                data.hasOwnProperty('apiCall') && 
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('listExists') &&
                data['result'] == true && 
                data['listExists'] == true &&
                data['apiCall'] == this.utilsService.apiCallListExists)
            ? this.commonApiService.deleteList(data['listName'], this.listService.getListContext(data['listName']))
            : this.placeholderObservable(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' && 
                data.hasOwnProperty('listName') && 
                data.hasOwnProperty('apiCall') && 
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('listExists') &&
                data.result == true &&
                data.listExists == false && 
                data.apiCall == this.utilsService.apiCallListExists)
            ? this.commonApiService.createList(data['listName'], this.listService.getListContext(data['listName'])) 
            : this.placeholderObservable(data)
        )
        .mergeMap(data => 
            (typeof(data) === 'object' && 
                data.hasOwnProperty('listName') && 
                data.hasOwnProperty('apiCall') && 
                data.hasOwnProperty('result') &&
                data.result == true && 
                data.apiCall == this.utilsService.apiCallDeleteList)
            ?  this.commonApiService.createList(data['listName'], this.listService.getListContext(data['listName'])) 
            : this.placeholderObservable(data)
        )            
        .mergeMap(data => 
            (typeof(data) === 'object' &&
                data.hasOwnProperty('listName') && 
                data.hasOwnProperty('apiCall') && 
                data.hasOwnProperty('result') &&
                data.apiCall == this.utilsService.apiCallCreateList &&
                data.result == true)
            ? this.commonApiService.updateField('Title', data['listName'],this.listService.getListContext(data['listName']), 'Required="TRUE"', 'Required="FALSE"')
            : this.placeholderObservable(data)
        )

    return resetHostLists$
}


///////////////////////////////////////////////////////////////////////////////////////
//SETTINGS LIST SCRIPT

// check settings list and fields exist, create if does not
// public settingsListReport(){
//     //reset settings report data
//     this._settingsReport = {
//         date: new Date(),
//         permissions: {
//             permission: this.utilsService.manageList,
//             result: false
//         },
//         listExists: [],
//         createList: [],
//         listXmlData: [],
//         fieldsRequired: [],
//         fieldsType: [],
//         fieldsExists: [],
//         errors: []
//     };

//     if (!this.settingsService.manageList) {
//         this.scriptsStream.next('user does not have permissions to run settings Report')
//         return
//     } else {
//         this._settingsReport.permissions = {
//         permission: this.utilsService.manageList,
//         result: true
//         }
//     }    

//     let settingsListReport = 
//                 this.commonApiService.listExists(this.utilsService.financeAppSettingsData, this.utilsService.appWeb)
//                 .mergeMap(data => 
//                     (typeof(data) === 'object' && 
//                         data.hasOwnProperty('listName') &&
//                         data.hasOwnProperty('result') &&
//                         data.hasOwnProperty('apiCall') && 
//                         data['result'] === false && 
//                         data['apiCall'] === this.utilsService.apiCallListExists) 
//                     ?  this.commonApiService.createList(data['listName'], this.utilsService.appWeb) 
//                     : this.placeholderObservable(data)
//                 )
//                 .mergeMap(data => 
//                     (typeof(data) === 'object' &&
//                         data.hasOwnProperty('listName') &&
//                         data.hasOwnProperty('result') &&
//                         data.hasOwnProperty('apiCall') && 
//                         data['apiCall'] === this.utilsService.apiCallCreateList &&
//                         data['result'] === true)
//                     ? this.commonApiService.updateField('Title', data.listName,this.utilsService.appWeb, 'Required="TRUE"', 'Required="FALSE"')
//                     : this.placeholderObservable(data)
//                 )
//                 .mergeMap(data => 
//                     (typeof(data) === 'object' &&
//                     data.hasOwnProperty('apiCall') &&
//                     data.hasOwnProperty('listName') &&
//                     data.hasOwnProperty('result') &&
//                     data['apiCall'] === this.utilsService.apiCallListExists && 
//                     data['result'] === true)
                    
//                     ? this.commonApiService.getListXml(data.listName, this.utilsService.hostWeb) 
//                     : this.placeholderObservable(data)
//                 )
//                 .mergeMap(data => 
//                     (typeof(data) == 'object' && 
//                     data.hasOwnProperty('result') &&
//                     data.hasOwnProperty('schemaXml') &&
//                     data.hasOwnProperty('apiCall') &&
//                     data['result'] == true && 
//                     data['apiCall'] == this.utilsService.apiCallListXmlData)
                    
//                     ? Observable.of(this.checkFieldsSettingsList(data)) 
//                     : this.placeholderObservable(data)
//                 )

//                 .subscribe(
//                     data => {
//                         if (typeof(data) === 'object' && 
//                             data.reportHeading && 
//                             data.reportResult) {
//                             // add report results to healthreport array
//                             if (this._settingsReport.hasOwnProperty(data.reportHeading)) {
//                                 try {
//                                     this._settingsReport[data.reportHeading].push = data
//                                 } catch (e) {
//                                     this.logService.log(e, this.utilsService.errorStatus, false);
//                                 }
//                             }
//                         } else {
//                             this.scriptsStream.next(data);
//                         }
//                     },
//                     err => {
//                         this.logService.log(err, this.utilsService.errorStatus, false);
//                         this.scriptsStream.next(`error Settings check function`)
//                         try {
//                             this._settingsReport.errors.push(err);
//                         } catch (e) {
//                             this.logService.log(e, this.utilsService.errorStatus, false);
//                         }
//                     },
//                     () => {
//                         this.scriptsStream.next(this._settingsReport)
//                         this.scriptsStream.next('exiting Settings check function')
                        
//                     }
//                 )
// //  this.checkPermissionsSettingsList('manageList')
// }

// //DUPLICATE OF EARLIER FUNCTION, REFACTORING REQUIRED
// private checkFieldsSettingsList(data){
//     let schemaXml = data.schemaXml;

//     let listName = data.listName;

//     let fieldsExists: Array<IReportResult> = [];
//     let fieldsRequired: Array<IFieldUpdateReportResult> = [];
//     let fieldsType: Array<IFieldUpdateReportResult> = [];
//     let listDefintion: Array<any>;

//     //parse http response into xml
//     let xmlDoc = this.utilsService.parseXml(schemaXml);
//     //convert xml to Json for massive performance imporvements
//     let jsonFldArry = this.utilsService.xmlToJson(xmlDoc);
//     //isolate just the array of fields
//     this.scriptsStream.next(jsonFldArry);

//     try {
//         jsonFldArry = jsonFldArry['List']['Fields']['Field']
//     } catch (e) {
//         this.logService.log(e, this.utilsService.errorStatus, false);
//         return;
//     }

//     //get a copy of the list defintion to compare agains
//     try {
//         listDefintion = JSON.parse(JSON.stringify(this.listService.getListSpec(listName)));
//     } catch (e) {
//         this.logService.log(e, this.utilsService.errorStatus, false);
//     }
    
//     //previous methods tried iterating through the list definition first and the nesting iteratively through the fields.  
//     // This method takes a fraction of the time
//     //iterate through the fields
//     for (let i in jsonFldArry) {
//         let _element
//         try {
//             _element = jsonFldArry[i]['@attributes'];
//         } catch (e) {
//             this.logService.log(e, this.utilsService.errorStatus, false);
//         }
//         //check if any fields set to required.  They shouldn't otherwise it may prevent list data from saving to it.
//         if (_element.Required == 'TRUE') {
                
//                 //add fields set to requred into health report
//                 this._settingsReport.fieldsRequired.push({
//                     reportHeading: this.utilsService.apiCallFieldsRequired,
//                     reportResult: this.utilsService.failStatus,
//                     listName: listName,
//                     fieldName: _element.Name,
//                     oldSchema: 'Required="TRUE"',
//                     newSchema: 'Required="FALSE"'
//                 });           
//         }

//         //now see if field matches one on the field spec
//         let _i = listDefintion.findIndex((element) => {
//             return element.Name === _element.Name
//         })
//         if (_i !== -1) {
//             //Field found
//             //check its of correct type. If not of correct type then the app may fail to save data
//             if (_element.Type !== listDefintion[_i].Type) {

//                 //add fields of wrong type into health report
//                 this._settingsReport.fieldsType.push({
//                     reportHeading:this.utilsService.apiCallFieldsType,
//                     reportResult:this.utilsService.failStatus,
//                     listName: listName,
//                     fieldName: _element.Name,
//                     oldSchema: 'Type: "' + _element.Type + '"',
//                     newSchema: 'Type: "' + listDefintion[_i].Type + '"'
//                 })                 
//             }
//             //remove from index for performance gains on the loop as well as stricking off correctly found fields
//             //any that are left in the array after the loop will imply that they don't exist on the list and will need to be created.
//             listDefintion.splice(_i,1)
//         }
    
//     }

//     //add missing fields into healthreport
//     listDefintion.forEach(field => {
//         this._settingsReport.fieldsExists.push ({
//             reportHeading: this.utilsService.apiCallFieldsExists,
//             reportResult: this.utilsService.failStatus,
//             listName: listName,
//             fieldName: field.Name
//         })

//     })

//     //update settings report
//     this.healthReportService.settingsReport = this._settingsReport;

//     return;
// }



///UTILS

placeholderObservable(data) {
    data = data || []

    let place$ = new Observable((observer: Observer<any>) => {
        observer.next(data);
        observer.complete();
    })
    return place$
}

// constructListExistsApiArry(_listArry):Array<Observable<any>>{
//     let _listApiArry = [];

//     try {
//         _listArry.forEach(listName => {
//             _listApiArry.push(this.commonApiService.listExists(listName, this.listService.getListContext(listName)))
//         })
//     } catch (e) {
//         this.logService.log(e, this.utilsService.errorStatus, false)
//     }
//     console.log('LIST ARRAY')
//     console.log(_listApiArry)

//     return _listApiArry
    
// }

constructAppListExistsApiArry(){
    let _listArry = []
    let _listApiArry = [];

    try {

        _listArry = [this.utilsService.financeAppLogsData, 
                    this.utilsService.financeAppSettingsData,
                    this.utilsService.financeAppWorkingDaysData]

        _listArry.forEach(listName => {
            _listApiArry.push(this.commonApiService.listExists(listName, this.utilsService.appWeb))
        })
    } catch (e) {
        this.logService.log(e, this.utilsService.errorStatus, false)
    }

    return _listApiArry
    
}

constructListsToCreateApiArray(listsToCreate){
    let _listApiArry = [];

    if (listsToCreate && listsToCreate.length>0) {
        listsToCreate.forEach((element:IReportResult) => {
            _listApiArry.push(this.commonApiService.createList(element.listName,this.utilsService.hostWeb))
        })
    }

    return _listApiArry
}

constructFieldsToCreateApiArray(fieldsToCreate){
    
    let _listsObj = {}
    // first need to group fields by list

    if (fieldsToCreate && fieldsToCreate.length>0) {
        fieldsToCreate.forEach((element:IReportResult)=>{
            // create entry in listsObj
            _listsObj[element.listName] = _listsObj[element.listName] || []
            _listsObj[element.listName].push(element);
        })
    }

    let _fieldXmlObj = {};

    if (_listsObj && Object.keys(_listsObj).length > 0) {
        //create array of field xmls grouped by listname
        for (let listName in _listsObj) {
            _fieldXmlObj[listName] = []

            _listsObj[listName].forEach((element:IReportResult)=>{
                _fieldXmlObj[listName].push(this.listService.getFieldXml(listName, element.fieldName))  
            })
        }
    }
    // create array of api calls, one for each list, with each api call containing an array of the field XMLs that need to be created
    // let _createFieldsApiArray = [];

    // if (_fieldXmlObj && Object.keys(_fieldXmlObj).length > 0) {
    //     for (let listName in _fieldXmlObj) {
    //         console.error(_fieldXmlObj)
    //         //NOTE API CALL HERE HAS BEEN DESIGNED TO TAKE AN ARRAY OF FIELDS FOR EACH LIST TO REDUCE API CALLS
    //         _createFieldsApiArray.push(this.commonApiService.addListFields(listName, _fieldXmlObj[listName], this.utilsService.hostWeb))
    //     }
    // }

    return _fieldXmlObj

}

// constructFieldsToUpdatedArray(fieldsSetRequired, fieldsWrongType){
//     let _updateFieldApiArray:Array<any> = []
    
//     if (fieldsSetRequired && fieldsSetRequired.length > 0) {
//         fieldsSetRequired.forEach((element:IFieldUpdateReportResult) => {
//             console.log('set Required', element)
//             console.log('context type', this.listService.getListContext(element.listName))
//             _updateFieldApiArray.push(this.commonApiService.updateField(element.fieldName, element.listName, this.utilsService.hostWeb, element.oldSchema, element.newSchema))
//         })
//     }

//     if (fieldsWrongType && fieldsWrongType.length > 0) {
//         fieldsWrongType.forEach((element:IFieldUpdateReportResult) => {
//             console.log('wrong type', element)
//             console.log('context type', this.listService.getListContext(element.listName))
//             _updateFieldApiArray.push(this.commonApiService.updateField(element.fieldName, element.listName, this.utilsService.hostWeb, element.oldSchema, element.newSchema))
//         })
//     }

//     return _updateFieldApiArray
// }

// constructGetDataArray(){
//     let _listArry = []
//     let _listApiArry = [];

//     try {
//         _listArry = [this.utilsService.financeAppResourceData, 
//                     this.utilsService.financeAppMaterialData,
//                     this.utilsService.financeAppTotalsData]
//         _listArry.forEach(listName => {
//             _listApiArry.push(this.commonApiService.getItems(listName, this.utilsService.hostWeb))
//         })
//     } catch (e) {
//         this.logService.log(e, this.utilsService.errorStatus, false)
//     }

//     return _listApiArry    
// }

getLogs():Observable<any>{
       let getLog$ =       
             this.commonApiService.getItems(this.utilsService.financeAppLogsData, this.utilsService.appWeb, 
                                this.utilsService.includeFields(
                                    this.listService.getArrayFieldNames(this.utilsService.financeAppLogsData)),
                                    //this caml query will be replaced eventually with a skip take query
                                    this.utilsService.genCamlQuery())
                .mergeMap(data => 
                    (typeof(data) == 'object' && 
                    data.hasOwnProperty('listName') &&
                    data.hasOwnProperty('apiCall') &&
                    data.hasOwnProperty('result') &&
                    data.hasOwnProperty('data') &&
                    data['apiCall'] == this.utilsService.apiCallGetItems && 
                    data['result'] == true)
                    ? this.logService.processItems(data['data'])
                    :this.placeholderObservable(data)
                )

        return getLog$
}

saveLogsBatch(){
    this.logService.log(`saveLogs script called`, this.utilsService.infoStatus, true);
    let saveLogs$ = 
        this.logService.determinePersistLogs()
        .mergeMap(data => 
            (typeof(data) === 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data['functionCall'] == 'persistLogs' &&
            data['result'] === true)
            ? this.commonApiService.addItems(this.utilsService.financeAppLogsData, 
                            this.utilsService.appWeb, 
                            this.logService.prepLogs(this.settingsService.verbose))
            : this.placeholderObservable(data)
            )
        //need to decide if logs should be cleared and re downloaded or if these 2 steps should be skipped
        .mergeMap(data => 
            (typeof(data) == 'object' && 
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data['apiCall'] == this.utilsService.apiCallAddItems &&
            data['listName'] == this.utilsService.financeAppLogsData && 
            data['result'] == true)
            ? this.logService.clearLogs()
            : this.placeholderObservable(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data['functionCall'] == 'clearLogs' &&
            data['result'] == true
            )
            ? this.commonApiService.getItems(this.utilsService.financeAppLogsData, this.utilsService.appWeb, 
                                this.utilsService.includeFields(
                                    this.listService.getArrayFieldNames(this.utilsService.financeAppLogsData)),
                                    this.utilsService.genCamlQuery())
            : this.placeholderObservable(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' && 
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('data') &&
            data['apiCall'] == this.utilsService.apiCallGetItems && 
            data['listName'] == this.utilsService.financeAppLogsData &&
            data['result'] == true)
            ? this.logService.processItems(data['data'])
            :this.placeholderObservable(data)
        )


    return saveLogs$

}

/////////////////////////////
// Init application
// APPLICATION LISTS

// using settings list?
initApp():Observable<any>{
this.logService.log('initialising app', this.utilsService.infoStatus, true);
let _transactionId = UUID.UUID();

let init$ = 
    this.uiStateService.updateMessage('Initialising App', this.utilsService.loadingStatus)
    // create new entry in transaction table
    .mergeMap(data =>
        (typeof(data) == 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('result') &&
        data.functionCall == 'updateMessage' &&
        data.result == true)
        ? this.notificationService.initTransaction(_transactionId, 'Init App')
        : Observable.of(data)
    )
    .mergeMap((data:any) =>
        (
        (typeof(data) == 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('result') &&
        data.functionCall == 'initTransaction' &&
        data.result == true) &&
        //make sure app is in sharepoint mode
        this.settingsService.sharePointMode
        )
        ? Observable.from([
            this.commonApiService.listExists(this.utilsService.financeAppSettingsData, this.listService.getListContext(this.utilsService.financeAppSettingsData)),
            this.commonApiService.listExists(this.utilsService.financeAppLogsData, this.listService.getListContext(this.utilsService.financeAppLogsData)),
            this.commonApiService.listExists(this.utilsService.financeAppWorkingDaysData, this.listService.getListContext(this.utilsService.financeAppWorkingDaysData)),
            this.commonApiService.listExists(this.utilsService.financeAppSummaryData, this.listService.getListContext(this.utilsService.financeAppSummaryData)),
            this.commonApiService.listExists(this.utilsService.financeAppResourceData, this.listService.getListContext(this.utilsService.financeAppResourceData)),
            this.commonApiService.listExists(this.utilsService.financeAppMaterialData, this.listService.getListContext(this.utilsService.financeAppMaterialData)),
            this.commonApiService.listExists(this.utilsService.financeAppTotalsData, this.listService.getListContext(this.utilsService.financeAppTotalsData)),
        ])
        .mergeAll()
        : Observable.of(data)
    )
    .mergeMap( data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data.hasOwnProperty('listExists') &&
        data['apiCall'] == this.utilsService.apiCallListExists &&
        data['result'] == true &&
        data['listExists'] == false)
        //if any list doesn't exists create list
        ? this.commonApiService.createList(data['listName'], 
                                            this.listService.getListContext(data['listName']))
        : Observable.of(data)
    )
        
    // .mergeMap( data => 
    //     (typeof(data) == 'object' && 
    //     data.hasOwnProperty('listName') &&
    //     data.hasOwnProperty('apiCall') &&
    //     data.hasOwnProperty('result') &&
    //     data.hasOwnProperty('listExists') &&
    //     data['apiCall'] == this.utilsService.apiCallListExists && 
    //     data['listName'] == this.utilsService.financeAppSettingsData && 
    //     data['listExists'] == false &&
    //     data['result'] == true)
    //     //if settings doesn't exists create
    //     ? this.commonApiService.createList(this.utilsService.financeAppSettingsData, this.utilsService.appWeb)
    //     : Observable.of(data)
    // )
    .mergeMap( data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallCreateList && 
        data['listName'] == this.utilsService.financeAppSettingsData &&
        data['result'] == true)
        //if settings has just been created then need to add placeholder item for settings data
        ? this.commonApiService.addItem(this.utilsService.financeAppSettingsData, this.utilsService.appWeb, this.settingsService.settingsValuesArray())
        : Observable.of(data)
    )    
    .mergeMap( data => 
        (
        (typeof(data) === 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data.hasOwnProperty('listExists') &&
        data['apiCall'] == this.utilsService.apiCallListExists &&
        data['listName'] == this.utilsService.financeAppSettingsData &&        
        data['result'] == true &&
        data['listExists'] == true)

        ||

        (typeof(data) === 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['listName'] == this.utilsService.financeAppSettingsData &&
        data['apiCall'] == this.utilsService.apiCallAddItem && 
        data['result'] == true)

        )

        //if settings exists or succesfully created new item get data
        ? this.commonApiService.getItem(this.utilsService.financeAppSettingsData, 
                                            this.utilsService.generateXmlGetItemById(1),
                                            this.utilsService.appWeb,
                                            this.utilsService.includeFields(
                                                    this.listService.getArrayFieldNames(this.utilsService.financeAppSettingsData)))
        : Observable.of(data)
    )
    .mergeMap( data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data.hasOwnProperty('data') &&
        data['apiCall'] == this.utilsService.apiCallGetItem && 
        data['result'] == true)    
        //need to process settings data, add results to settings service
        ? this.processSettingsData(data)
        : Observable.of(data)
    )
    // .mergeMap( data => 
    //     //if settings list and using logging?
    //     (typeof(data) === 'object' &&
    //     data.hasOwnProperty('functionCall') &&
    //     data.hasOwnProperty('result') &&
    //     data['functionCall'] == 'processSettingsData' &&
    //     data['result'] == true)
    //     ? this.loadAppData([this.utilsService.financeAppResourceData,
    //         this.utilsService.financeAppMaterialData,
    //         this.utilsService.financeAppTotalsData,
    //         this.utilsService.financeAppSummaryData], this.settingsService.year)
    //     : Observable.of(data)
    // )
    .mergeMap( data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallCreateList && 
        data['listName'] == this.utilsService.financeAppWorkingDaysData &&          
        data['result'] == true)
        //if create workdays list then add placeholder data items
        ? this.commonApiService.addItems(this.utilsService.financeAppWorkingDaysData, 
                            this.utilsService.appWeb, 
                            this.workdaysService.generatePlaceholderWorkdays())
        : Observable.of(data)
    )       
    // .mergeMap(data => 
    //     this.isWDListReady(data)
    //     ? this.settingsService.workingDaysListReady(true)
    //     : Observable.of(data)
    
    // )
    .mergeMap(data =>
        //working day list exists or create working day list succeeds
        this.workingDayListReadyCallResult(data)
        //save queued logs to persistant storage
        ? this.commonApiService.getItems(this.utilsService.financeAppWorkingDaysData, this.utilsService.appWeb, 
                                this.utilsService.includeFields(
                                    this.listService.getArrayFieldNames(this.utilsService.financeAppWorkingDaysData)),
                                    this.utilsService.genCamlQuery())
        : Observable.of(data)
    )
    .mergeMap(data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data.hasOwnProperty('data') &&
        data['apiCall'] == this.utilsService.apiCallGetItems && 
        data['listName'] == this.utilsService.financeAppWorkingDaysData &&
        data['result'] == true)
        ? this.workdaysService.processItems(data['data'])
        : Observable.of(data)
    )
    //collect notifications passed down the observable chain and add them to the notifcaiton table
    .mergeMap((data:any) => 
        (typeof(data) == 'object' &&
        data.hasOwnProperty('reportHeading') &&
        data.hasOwnProperty('reportResult'))
        ? this.notificationService.addNotification(data, _transactionId)
        : Observable.of(data)
    )

return init$
}

//END INIT
///////////////////////////////////////////////////////////

logListReadyCallResult(data){
   let outcome = (typeof(data) === 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('result') &&
        data['functionCall'] === 'logListReady' &&
        data['result'] === true)

    return outcome
}

workingDayListReadyCallResult(data){
   let outcome = (typeof(data) === 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('result') &&
        data['functionCall'] === 'wdListReady' &&
        data['result'] === true)

    return outcome
}

isLogListReady(data): boolean{
    let outcome =         (
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data.hasOwnProperty('listExists') &&
        data['apiCall'] == this.utilsService.apiCallListExists &&
        data['listName'] == this.utilsService.financeAppLogsData &&        
        data['result'] == true &&
        data['listExists'] == true)

        ||

        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallCreateList && 
        data['listName'] == this.utilsService.financeAppLogsData &&          
        data['result'] == true)
        )
    return outcome
}

isWDListReady(data): boolean{
    let outcome =         (
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data.hasOwnProperty('listExists') &&
        data['apiCall'] == this.utilsService.apiCallListExists &&
        data['listName'] == this.utilsService.financeAppWorkingDaysData &&        
        data['result'] == true &&
        data['listExists'] == true)

        ||

        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallAddItems &&
        data['listName'] == this.utilsService.financeAppWorkingDaysData && 
        data['result'] == true)
    )

    return outcome
}

updateField(fieldName: string, listName: string, attributeType: string, newSchema:any): Observable<any> {
    let updateField$ = 
        this.commonApiService.readField(fieldName, listName, this.listService.getListContext(listName))
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('fieldName') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('schemaXml'))
            ? this.getFieldAttribute(data, attributeType)
            : Observable.of(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('attribute') &&
            data.functionCall == 'getFieldAttribute' &&
            data.result == true)
            ? this.commonApiService
                .updateField(
                    fieldName, 
                    listName, 
                    this.listService.getListContext(listName),
                    `${attributeType}="${data.attribute}"`,
                    newSchema)
            : Observable.of(data)
        )

    return updateField$
}


// checkUseSettingsList():Observable<any>{
//     let setting$ = new Observable((observer:Observer<any>) => {
//         let result = this.settingsService.useSettingsList
//         this.logService.log(`use settings list: ${result}`, this.utilsService.infoStatus, true)

//         observer.next({
//             functionCall: 'checkUseSettingsList',
//             value: result
//         })

//         observer.complete()
//     })

//     return setting$
// }

// checkUseLoggingList():boolean{
//     let result = <boolean>this.settingsService.useLoggingList
//     this.logService.log(`use logging list: ${result}`, this.utilsService.infoStatus, false)
//     console.error('use settings list', result);
    
//     return result
// }

processSettingsData(data){
    if (data.hasOwnProperty('data') &&
        Array.isArray(data['data']) &&
        data['data'].length === 1) {
            data = data['data'][0]
    } else {
        this.logService.log(`unable to extract settings data from api call`, this.utilsService.errorStatus, false);
    }

    let settings$ = new Observable((observer:Observer<any>) => {
        if (typeof(data) === 'string') {
            JSON.parse(data)
        }
        if (typeof(data) === 'object') {
            try {
                this.settingsService.processSettingsData(data)

                observer.next({
                    functionCall: 'processSettingsData',
                    result: true
                })
                // emit useful values
                observer.next({
                    reportHeading: 'processSettingsData',
                    reportValue: this.utilsService.successStatus,
                    settingsValue: 'year',
                    value: this.settingsService.year,
                    descripton: `successfully processed settings data`
                })
                console.error(this.settingsService.year)
            } catch(e) {
                this.logService.log(e, this.utilsService.errorStatus, false);
                observer.next({
                    functionCall: 'processSettingsData',
                    result: false
                })
            }

        } else {
            observer.next({
                functionCall: 'processSettingsData',
                result: false
            })
        }
        observer.complete()
        
    })

    return settings$
}


loadAppData(listArray:Array<string>, year:number):Observable<any>{
    let _transactionId = UUID.UUID();

    let getData$ = 
        this.uiStateService.updateMessage(`Loading App Data`, this.utilsService.loadingStatus)
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'updateMessage' &&
                data.result == true)
            ? this.notificationService.initTransaction(_transactionId, 'Load App Data')
            : Observable.of(data)
        )
        // create new entry in transaction table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'initTransaction' &&
                data.result == true)
            ? Observable.from(listArray)
            : Observable.of(data)
        )
        //check list/year isn't function hasn't already been called
        .mergeMap((listName:string) =>
            (typeof(listName) == 'string' &&
            listName.length > 0)
            ? this.stateService.checkLoadAppDataState(listName)
            : Observable.of(listName)
        )
        .mergeMap((data:any) => 
        //in the event that loading operation is not already in flight then proceed
        //if loading operation is running for list then don't proceed
            (typeof(data) == 'object' &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('isLoading') &&
            data.functionCall == 'checkLoadAppDataState' &&
            data.result == true &&
            data.isLoading == false)
            ? this.commonApiService.getItems(
                                            data.listName, 
                                            this.listService.getListContext(data.listName),
                                            this.utilsService.includeFields(
                                                this.listService.getArrayFieldNames(
                                                    data.listName)),
                                            this.utilsService.genCamlQuery({
                                                                            value: year,
                                                                            fieldRef: 'Year',
                                                                            type: 'Number',
                                                                        })
                                            )
            : Observable.of(data)
        )
        .mergeMap((data:any) =>
            // process list data
            (typeof(data) == 'object' &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&        
            data['apiCall'] == this.utilsService.apiCallGetItems && 
            data['result'] == true)
            ? this.dataContextService.processListData(data['data'], data['listName'])
            : Observable.of(data)
        )
        .mergeMap((data:any) =>
        //at this point update the stae of isLoading to false
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.functionCall == 'processListData' &&
            data.result == true)
            ? this.stateService.updateLoadingAppDataState(data.listName, false)
            : Observable.of(data)
        )
        .mergeMap((data:any) =>
            //now emit data values to list
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data['functionCall'] == `updateLoadingAppDataState` &&
            data['result'] == true)
            ? this.dataContextService.emitValues([data['listName']])
            : Observable.of(data)
        )
        //collect notifications passed down the observable chain and add them to the notifcaiton table
        .mergeMap((data:any) => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('reportHeading') &&
            data.hasOwnProperty('reportResult'))
            ? this.notificationService.addNotification(data, _transactionId)
            : Observable.of(data)
        )        
        //if there are no data items for this table in this year then add placeholder row
        .mergeMap((data:any) => 
            (typeof(data) === 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('resultLength') &&
            data.hasOwnProperty('listName') &&
            data.functionCall == 'processListData' &&
            data.resultLength == 0)
            ? this.addDataRow(data.listName, this.settingsService.year, true)
            : Observable.of(data)
        )
        return getData$
}

// //get required lists
// loadAppDataLists(listArray:Array<string>, year:number):Array<Observable<any>>{
//     console.log('LOAD APP DATA LISTS CALLED')
    
//     let _observableArray = []
//     let config:any

//     if (year) {
//         config = {
//             fieldRef: 'Year',
//             type: 'Number',
//             value: year
//         } 
//     } else {
//         let _msg = 'error constructing year object for function loadAppDataLists, defaulting to getAllItems without filter'
//         this.logService.log(_msg, this.utilsService.errorStatus, false)
//         config = undefined
//     }

//     if(Array.isArray(listArray) && listArray.length>0) {
//         listArray.forEach(listName => {
//             _observableArray.push(this.commonApiService.getItems(
//                                             listName, 
//                                             this.listService.getListContext(listName),
//                                             this.utilsService.includeFields(
//                                                 this.listService.getArrayFieldNames(
//                                                     listName)),
//                                             this.utilsService.genCamlQuery(config)
//                                             ))
//         })
//     }

//     return _observableArray
// }

getAppData(listArray:Array<string>, year:number): Observable<any>{
    let _transactionId = UUID.UUID();

    let get$ = 
        this.uiStateService.updateMessage(`Getting App Data`, this.utilsService.loadingStatus)
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'updateMessage' &&
                data.result == true)
            ? this.notificationService.initTransaction(_transactionId, 'Get App Data')
            : Observable.of(data)
        )
        // create new entry in transaction table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'initTransaction' &&
                data.result == true)
            ? this.dataContextService.checkForCachedData(listArray, year)
            : Observable.of(data)
        )
        .mergeMap(data =>
        (typeof(data) == 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('result') &&
        data.hasOwnProperty('dataExists') &&
        data.functionCall == 'checkForCachedData' &&
        data.result == true &&
        data.dataExists == true)
        ? this.dataContextService.emitValues([data.listName])
        : Observable.of(data)
        )
        //collect notifications passed down the observable chain and add them to the notifcaiton table
        .mergeMap((data:any) => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('reportHeading') &&
            data.hasOwnProperty('reportResult'))
            ? this.notificationService.addNotification(data, _transactionId)
            : Observable.of(data)
        )        
        .mergeMap(data =>
        (
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('dataExists') &&
            data.functionCall == 'checkForCachedData' &&
            data.result == true &&
            data.dataExists == false
        )
        &&
        (
            this.settingsService.sharePointMode
        )
        )
            ? this.loadAppData([data.listName],year)
            : Observable.of(data)
        )        

        return get$
}

updateTable(event: any): Observable<any> {
        /*
        * 1. extract properties
        * 2. pre process data
        * 3. get index value
        * 4. update data
        * 5. process calculated fields
        * 6. if autosave - save values
        * 6.1 if autosave - reload values
        * 7. emit values
        * 8. history service
        * 9. reset statechange flag
        */
        let _transactionId = UUID.UUID();

        let updateTable$ =
            this.uiStateService.updateMessage('updating data', this.utilsService.loadingStatus)
            .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'updateMessage' &&
                data.result == true)
                ? this.notificationService.initTransaction(_transactionId, 'Update Table')
                : Observable.of(data)
            )
            // create new entry in transaction table
            .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'initTransaction' &&
                data.result == true)
                ? this.dataContextService.emitContextValues([this.utilsService.financeAppResourceData,
                                                            this.utilsService.financeAppMaterialData,
                                                            this.utilsService.financeAppTotalsData,
                                                            this.utilsService.financeAppSummaryData])
                : Observable.of(data)
            )
            .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('listArray') &&
                data.hasOwnProperty('result') &&
                data.result ==  true)
                ? this.dataContextService.extractProperties(event)
                : Observable.of(data) 
            )
            .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.functionCall == 'extractProperties' &&
                data.result == true
                )
                ? this.dataContextService.preProcessData(data.data)
                : Observable.of(data)
            )
            .mergeMap(data => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('data') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'preProcessData' &&
                data.result == true
                )
                ? this.dataContextService.getIndexValue(data.data.listName, data.data.ID, data.data)
                : Observable.of(data)
            )
            .mergeMap(data => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.functionCall == 'getIndexValue' &&
                data.result == true
                )
                ? this.dataContextService.UTUpdateData(data.data)
                : Observable.of(data)
            )
            .mergeMap(data =>
                (typeof(data) == 'object' && 
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.functionCall == 'UTUpdateData' &&
                data.result == true
                )
                ? this.dataContextService.determineStateValue(data.data.indexValue, this.utilsService.updateState, data.data.tableName, data.data)
                :Observable.of(data)
            )
            .mergeMap(data => 
                (typeof(data) == 'object' && 
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.hasOwnProperty('revisedStateValue') &&
                data.functionCall == 'determineStateValue' &&
                data.result == true
                )
                ? this.dataContextService.updateStateValue(data.data.indexValue, data.revisedStateValue, data.data.tableName, data.data)
                : Observable.of(data)
            )
            .mergeMap(data => 
                (typeof(data) == 'object' && 
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.functionCall == 'updateStateValue' &&
                data.result == true
                )
                ? this.dataContextService.processCalculatedFields(data.data.listName, data.data)
                : Observable.of(data)
            )
            .mergeMap(data => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.functionCall == 'processCalculatedFields' &&
                data.result == true
                )
                ? this.dataContextService.emitValues([data.data.listName, this.utilsService.financeAppTotalsData])
                : Observable.of(data)
            )
            //collect notifications passed down the observable chain and add them to the notifcaiton table
            .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('reportHeading') &&
                data.hasOwnProperty('reportResult'))
                ? this.notificationService.addNotification(data, _transactionId)
                : Observable.of(data)
            )
            .mergeMap(data =>
                (
                    (typeof(data) == 'object' &&
                    data.hasOwnProperty('functionCall') &&
                    data.hasOwnProperty('result') &&
                    data.result == true &&
                    data.functionCall == 'emitValues'
                    )
                    && this.settingsService.autoSave
                    && this.settingsService.sharePointMode
                )
                ? this.saveAppData()
                : Observable.of(data)
            )

        return updateTable$
    }

saveAppData(){
    this.logService.log('submit data to api function called', this.utilsService.infoStatus, false);

    let _transactionId = UUID.UUID();

    let submitData$ = 
        this.uiStateService.updateMessage('saving data', this.utilsService.loadingStatus)
        // create new entry in transaction table   
        .mergeMap(data =>
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.functionCall == 'updateMessage' &&
            data.result == true)
            ? this.notificationService.initTransaction(_transactionId, 'Saving Data')
            : Observable.of(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.functionCall == 'initTransaction' &&
            data.result == true)            
            ? this.stateService.checkSaveAppDataState()
            : Observable.of(data)
        )

        .mergeMap((data:any) => 
            //if checkdata is false then proceed otherwise cancel operation - 
            //we do not want to run this function if it is already running otherwise data duplication issues    
        
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('isSaving') &&
            data.functionCall == 'checkSaveAppDataState' &&
            data.result == true &&
            data.isSaving ==  false)

            ? Observable.from(this.prepDataForApi([
                        {data: this.dataContextService.resourceData, listName: this.utilsService.financeAppResourceData},
                        {data: this.dataContextService.materialData, listName: this.utilsService.financeAppMaterialData},
                        {data: this.dataContextService.totalsData, listName: this.utilsService.financeAppTotalsData},
                        {data: this.dataContextService.summaryData, listName: this.utilsService.financeAppSummaryData}
                    ])
                ).mergeAll()
            : Observable.of(data)
        )
        .mergeMap((data:any) => 
        // When adding an item to a list we need to update the ID with the newly createed ID value
            (typeof(data) == 'object' &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('ID') &&
            data['apiCall'] == this.utilsService.apiCallAddItem &&
            data['result'] == true)        
        ? this.dataContextService.updateItemIdAfterAdd(data['itemId'], data['ID'], data['listName'], this.dataContextService.getTableName(data['listName']))
        : Observable.of(data)
        )
        .mergeMap(data =>
        (
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('ID') &&
            data.hasOwnProperty('apiCall') &&
            data.result == 'updateItemIdAfterAdd' &&
            data.result == true)

            ||

            (typeof(data) == 'object' &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('ID') &&
            data['apiCall'] == this.utilsService.apiCallDeleteItem &&
            data['result'] == true)
            
            ||

            (typeof(data) == 'object' &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('ID') &&
            data['apiCall'] == this.utilsService.apiCallUpdateItem &&
            data['result'] == true)
        )
        ? this.dataContextService.getIndexValue(data['listName'], data['ID'], {apiCall: data['apiCall']})
        : Observable.of(data)
        )
        //update stae of data items
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('data') &&
            data.hasOwnProperty('tableName') &&
            data.hasOwnProperty('data') &&
            data.functionCall == 'getIndexValue' &&
            data.result == true)
            ? this.dataContextService.updateStateValue(data.indexValue, this.utilsService.inertState, data.tableName, data.data)
            : this.placeholderObservable(data)
        )
        //update state of save app data function call after updating state value of data items
        .mergeMap(data => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.functionCall == 'updateStateValue')
            ? this.stateService.updateSaveAppDataState(false)
            : Observable.of(data)
        )
        //collect notifications passed down the observable chain and add them to the notifcaiton table
        .mergeMap((data:any) => 
            (typeof(data) == 'object' &&
            data.hasOwnProperty('reportHeading') &&
            data.hasOwnProperty('reportResult'))
            ? this.notificationService.addNotification(data, _transactionId)
            :Observable.of(data)
        )
    return submitData$
}

addDataRow(listName:string, year: number, saveData: boolean){
    let _transactionId = UUID.UUID();

    let addRow$ =
        this.uiStateService.updateMessage(`Adding data row`, this.utilsService.loadingStatus)
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'updateMessage' &&
                data.result == true)
            ? this.notificationService.initTransaction(_transactionId, 'Add Row')
            : Observable.of(data)
        )
        // create new entry in transaction table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'initTransaction' &&
                data.result == true)
            ? this.dataContextService.createDataItem(listName)
            : Observable.of(data)
        )
        .mergeMap((data:any) => 
            ((typeof(data) === 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('item') &&
            data.functionCall == 'addDataRow')
            &&
            (!saveData || !this.settingsService.sharePointMode))
            ? this.dataContextService.addDataItemToTable(data.listName, data.item)
            : Observable.of(data)
        )
        .mergeMap((data:any) =>
            ((typeof(data) === 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('item') &&
            data.functionCall == 'addDataRow' &&
            data.result == true)
            && 
            (saveData && this.settingsService.sharePointMode))
            ? this.commonApiService.addItem(data.listName, this.listService.getListContext(data.listName), this.createFieldArray(data.item, data.listName))
            : Observable.of(data)
        )
        .mergeMap((data:any) =>
            (typeof(data) === 'object' && 
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('ID') &&
            data['apiCall'] == this.utilsService.apiCallAddItem && 
            data['result'] == true)
            //if settings exists get data
            ? this.commonApiService.getItem(data.listName, 
                                            this.utilsService.generateXmlGetItemById(data.ID),
                                            this.listService.getListContext(data.listName),
                                            this.utilsService.includeFields(
                                                    this.listService.getArrayFieldNames(data.listName)))
            : Observable.of(data)
        )
        .mergeMap((data:any) => 
            (typeof(data) == 'object' && 
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('data') &&
            data['apiCall'] == this.utilsService.apiCallGetItem && 
            data['result'] == true)
            //need to process item data, add results to data table
            ? this.dataContextService.processListData(data.data, data.listName)
            : Observable.of(data)
        )
        .mergeMap(data =>
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.functionCall == 'addDataItemToTable' &&
            data.result == true
            )
            ||
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('listName') &&
            data.functionCall == 'processListData' &&
            data.result == true
            )
            ? this.dataContextService.emitValues([data.listName])
            : Observable.of(data)
        )
        //collect notifications passed down the observable chain and add them to the notifcaiton table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('reportHeading') &&
                data.hasOwnProperty('reportResult'))
            ? this.notificationService.addNotification(data, _transactionId)
            : Observable.of(data)
        )

    return addRow$
}

deleteDataRow(listName:string, ID: number){
/*
*   1. check if AutoSave
*   2. get tableName
*   3. find index
*   4. update state
*   5. calculdate values
*   6. emit values
*/
let rowData = {
    listName: listName,
    ID: ID
}

let _transactionId = UUID.UUID();

console.error('delete Row Called')
console.error(rowData)

let delete$ =
    this.uiStateService.updateMessage(`deleting data row`, this.utilsService.loadingStatus)
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'updateMessage' &&
                data.result == true)
            ? this.notificationService.initTransaction(_transactionId, 'Delete Row')
            : Observable.of(data)
        )
        // create new entry in transaction table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'initTransaction' &&
                data.result == true)
            ? this.dataContextService.getIndexValue(rowData.listName, rowData.ID, rowData)
            : Observable.of(data)
        )
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.result == true &&
                data.functionCall == 'getIndexValue'
                )
            ? this.dataContextService.updateStateValue(data.data.indexValue, this.utilsService.deleteState, data.data.tableName, data.data)
            : Observable.of(data)
        )
        .mergeMap(data => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.result == true &&
                data.functionCall == 'updateStateValue'
                )
            ? this.dataContextService.processCalculatedFields(data.data.listName, data.data)
            : Observable.of(data)
        )
        .mergeMap(data => 
                (typeof(data) == 'object'  &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('data') &&
                data.result == true &&
                data.functionCall == 'processCalculatedFields')
            ? this.dataContextService.emitValues([data.data.listName])
            : Observable.of(data)
        )
        .mergeMap(data =>
            (
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.result == true &&
                data.functionCall == 'emitValues')
                && this.settingsService.autoSave
                && this.settingsService.sharePointMode
            )
            ? this.saveAppData()
            : Observable.of(data)
        )
        //collect notifications passed down the observable chain and add them to the notifcaiton table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('reportHeading') &&
                data.hasOwnProperty('reportResult'))
            ? this.notificationService.addNotification(data, _transactionId)
            :Observable.of(data)
        )        
    return delete$
}


prepDataForApi(listDataArray:Array<Object>, ):Array<Observable<any>> {
    console.log('PREP DATA FOR API')
    let _rsltArray = []

    if(Array.isArray(listDataArray)) {
        listDataArray.forEach(element => {
            let listName = element['listName']
            let data = element['data']

            if (Array.isArray(data)) {
                data.forEach(_item => {

                    if(_item.hasOwnProperty('State') && _item['State']==this.utilsService.createState) {
                        let fieldArray = this.createFieldArray(_item, listName);
                        _rsltArray.push(this.commonApiService.addItem(listName, this.utilsService.hostWeb, fieldArray))

                    } else if (_item.hasOwnProperty('State') && _item['State'] == this.utilsService.deleteState) {
                        _rsltArray.push(this.commonApiService.deleteItem(listName, _item['ID'], this.utilsService.hostWeb))

                    } else if (_item.hasOwnProperty('State') && _item['State'] == this.utilsService.updateState) {
                        let fieldsArray = this.createFieldArray(_item, listName);
                        _rsltArray.push(this.commonApiService.updateItem(listName, this.utilsService.hostWeb, _item['ID'], fieldsArray))

                    } else if (_item.hasOwnProperty('State') && _item['State'] == this.utilsService.inertState) {
                        this.logService.log(`item flagged as inert, saving item not required`, this.utilsService.infoStatus, true)
                    }
                })
            }
        })
    }
    return _rsltArray
}

createFieldArray(item, listName){
    //create fields array
    let _fieldArray:Array<IItemPropertyModel> = []
    let fieldNames = this.listService.getArrayFieldNames(listName)
    return fieldNames.map(fieldName => {
            if (item.hasOwnProperty(fieldName)) {
                return {
                            fieldName: fieldName,
                            fieldValue: item[fieldName]
                }
            } else {
                this.logService.log(`error locating field ${fieldName} on list ${listName} for functionCall createFieldArray`)
                console.error(`cannot field field ${fieldName}`)
            }
        })
}
  


updateWorkdays(id, data):Observable<any>{

    let update$ = 
       this.commonApiService
            .updateItem(this.utilsService.financeAppWorkingDaysData,
                                this.utilsService.appWeb, id, data
        )
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('apiCall') &&
                data.hasOwnProperty('data') &&
                data.hasOwnProperty('listName') &&
                data.hasOwnProperty('result') &&
                data.listName == 'FinanceAppWorkingDaysData' &&
                data.apiCall == 'getItems' &&
                data.result == true)
        ? this.commonApiService.getItems(this.utilsService.financeAppWorkingDaysData, this.utilsService.appWeb, 
                                this.utilsService.includeFields(
                                    this.listService.getArrayFieldNames(this.utilsService.financeAppWorkingDaysData)),
                                    this.utilsService.genCamlQuery())
        : this.placeholderObservable(data)
        )
        .mergeMap(data => 
            (typeof(data) == 'object' && 
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('data') &&
            data['apiCall'] == this.utilsService.apiCallGetItems && 
            data['listName'] == this.utilsService.financeAppWorkingDaysData &&
            data['result'] == true)
            ? this.workdaysService.processItems(data['data'])
            :this.placeholderObservable(data)        
        )

    return update$
}

getWorkdays():Observable<any>{
    let getworkdays$ =
        this.commonApiService.getItems(this.utilsService.financeAppWorkingDaysData, this.utilsService.appWeb, 
                                this.utilsService.includeFields(
                                    this.listService.getArrayFieldNames(this.utilsService.financeAppWorkingDaysData)),
                                    this.utilsService.genCamlQuery())
        .mergeMap(data => 
            (typeof(data) == 'object' && 
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('data') &&
            data['apiCall'] == this.utilsService.apiCallGetItems && 
            data['listName'] == this.utilsService.financeAppWorkingDaysData &&
            data['result'] == true)
            ? this.workdaysService.processItems(data['data'])
            :this.placeholderObservable(data)        
        )

    return getworkdays$
}


updateSetting(settingData):Observable<any>{
    let _transactionId = UUID.UUID();

    let updateSetting$ = 
        this.uiStateService.updateMessage(`updating setting: ${settingData[0]['fieldName']}`, this.utilsService.loadingStatus)
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'updateMessage' &&
                data.result == true)
            ? this.notificationService.initTransaction(_transactionId, 'Update Setting')
            : Observable.of(data)
        )
        // create new entry in transaction table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'initTransaction' &&
                data.result == true)
            ? this.settingsService.getSetting('sharePointMode')
            : Observable.of(data)
        )
        //if in sharepoint mode then update the settings list in the sharepoint app
        .mergeMap(data =>
        (
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('value') &&
            data.hasOwnProperty('setting') &&
            data.hasOwnProperty('result') &&
            data.functionCall == 'getSetting' &&
            data.setting == 'sharePointMode' &&
            data.result == true &&
            data.value == true)

            ||

            //or value to be updated is sharepoint mode itself
            (
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('value') &&
            data.hasOwnProperty('setting') &&
            data.hasOwnProperty('result') &&
            data.functionCall == 'getSetting' &&
            data.setting == 'sharePointMode' &&
            data.result == true &&
            data.value == false) 
            &&
            settingData[0]['fieldName'] == 'SharePointMode'
            )
        )
            ? this.commonApiService
                .updateItem(this.utilsService.financeAppSettingsData,
                                    this.utilsService.appWeb, "1", settingData)
            : Observable.of(data)
        )
        //get the settings and update the cached settings data
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('apiCall') &&
                data.hasOwnProperty('listName') &&
                data.hasOwnProperty('result') &&
                data.listName == this.utilsService.financeAppSettingsData &&
                data.apiCall == this.utilsService.apiCallUpdateItem &&
                data.result == true)
            ? this.getSettings()
            : this.placeholderObservable(data)
        )
        //if not in sharepoint mode then just add value to cache settings data
        .mergeMap(data =>
        (
            (typeof(data) == 'object' &&
            data.hasOwnProperty('functionCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('value') &&
            data.hasOwnProperty('setting') &&
            data.hasOwnProperty('result') &&
            data.functionCall == 'getSetting' &&
            data.setting == 'sharePointMode' &&
            data.result == true &&
            data.value == false)
            &&
            //make sure that the value that we are updating is not sharepoint mode
            settingData[0]['fieldName'] !== 'SharePointMode'
        )
            ? this.settingsService.setSetting(settingData[0]['fieldName'], settingData[0]['fieldValue'])
            : Observable.of(data)
        )
        //collect notifications passed down the observable chain and add them to the notifcaiton table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('reportHeading') &&
                data.hasOwnProperty('reportResult'))
            ? this.notificationService.addNotification(data, _transactionId)
            :Observable.of(data)
    )        

    return updateSetting$ 

}

getSettings(): Observable<any> {
    let _transactionId = UUID.UUID();    
    let getSetting$ =
    
        this.uiStateService.updateMessage('updating setting', this.utilsService.loadingStatus)
        .mergeMap(data =>
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'updateMessage' &&
                data.result == true)
            ? this.notificationService.initTransaction(_transactionId, 'Get Settings')
            : Observable.of(data)
        )
        // create new entry in transaction table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('functionCall') &&
                data.hasOwnProperty('result') &&
                data.functionCall == 'initTransaction' &&
                data.result == true)
            ? this.commonApiService.getItem(this.utilsService.financeAppSettingsData, 
                                                this.utilsService.generateXmlGetItemById(1),
                                                this.utilsService.appWeb,
                                                this.utilsService.includeFields(
                                                        this.listService.getArrayFieldNames(this.utilsService.financeAppSettingsData)))
            : Observable.of(data)
        )
        .mergeMap( data => 
            (typeof(data) == 'object' && 
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&
            data.hasOwnProperty('data') &&
            data['apiCall'] == this.utilsService.apiCallGetItem && 
            data['result'] == true)    
            //need to process settings data, add results to settings service
            ? this.processSettingsData(data)
            : this.placeholderObservable(data)
        )
        //collect notifications passed down the observable chain and add them to the notifcaiton table
        .mergeMap((data:any) => 
                (typeof(data) == 'object' &&
                data.hasOwnProperty('reportHeading') &&
                data.hasOwnProperty('reportResult'))
            ? this.notificationService.addNotification(data, _transactionId)
            : Observable.of(data)            
        )                                                    

    return getSetting$
}

getFieldAttribute(data, attribute:string): Observable<any>{
    let getFieldType$ = new Observable((observer:any) => {

        let schemaXml = data.schemaXml;
        let listName = data.listName;
        let oldSchema;
        let fieldDefintion: Array<any>;

        //parse http response into xml
        let xmlDoc = this.utilsService.parseXml(schemaXml);
        //convert xml to Json for massive performance imporvements
        let fieldProperties = this.utilsService.xmlToJson(xmlDoc);
        let property
        //isolate just the array of fields
        console.log(fieldProperties);
        try {
            fieldProperties = fieldProperties['Field']['@attributes']
        } catch (e) {
            this.logService.log(e, this.utilsService.errorStatus, false);
            return;
        }

        
        property = fieldProperties[attribute] || undefined
        
        if (property) {
            //add fields set to requred into health report
            observer.next({
                functionCall: 'getFieldAttribute',
                result: true,
                attributeName: attribute,
                attribute: property
            })

            observer.next({
                reportHeading: this.utilsService.apiCallFieldsRequired,
                reportResult: this.utilsService.successStatus,
                listName: listName,
                fieldName: fieldProperties['Name'] || undefined
            })
        } else {
            observer.next({
                reportHeading: this.utilsService.apiCallFieldsRequired,
                reportResult: this.utilsService.failStatus,
                listName: listName,
                fieldName: fieldProperties['Name'] || undefined
            })
        }

        observer.complete()


    })  
    return getFieldType$;
}
//end service
}
