import { Injectable } from '@angular/core'
import { LogService } from './log.service'

import { UtilsService } from './utils.service'
import { CommonApiService } from './api-common.service'
import { UiStateService } from './ui-state.service'
import { ListService } from './list.service'
import { HealthReportService } from './health-report.service'
import { SettingsService } from './settings.service'
import { DataContextService } from './data-context.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import 'rxjs/operator/mergeAll'
import 'rxjs/operator/map'
import 'rxjs/operator/mergeMap'
import 'rxjs/operator/merge'


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
    private _healthReport: IHealthReport;
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
                private dataContextService: DataContextService){
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


///////////////////////////////////////////////////////////////////////////////////////
//Check permissions
// getPermissions(){
//         this.commonApiService.getPermissions(this.utilsService.hostWeb, 
//                                         this.utilsService.financeAppResourceData)
//         .subscribe(
//             data => {
//                 this.logService.log('Observer.next is array:  ' + String(Array.isArray(data)), this.utilsService.infoStatus, true);
//                 if (Array.isArray(data)) {
//                     console.log('receiving permissions results array')
//                     console.error(data);
//                     data.forEach(element => {
//                         this.logService.log(element, this.utilsService.infoStatus, true);
//                         this.scriptsStream.next(element);
//                         switch (element.permissionType) {
                        
//                         case this.utilsService.manageWeb:
//                             this.logService.log('user has ManageWebPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
//                             try { 
//                                 this.uiStateService.updateUiState(this.utilsService.manageWeb, element.value)
//                             } catch (e) {
//                                 this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
//                             }
                            
//                             break;
//                         case this.utilsService.manageList:
//                             this.logService.log('user has ManageListPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
//                             try {
//                                 this.uiStateService.updateUiState(this.utilsService.manageList, element.value)
//                             } catch (e) {
//                                 this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
//                             }
                            
//                             break;
//                         case this.utilsService.viewList:
//                             this.logService.log('user has ViewListPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
//                             try {
//                                 this.uiStateService.updateUiState(this.utilsService.viewList, element.value)
//                             } catch (e) {
//                                 this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
//                             }                                    

//                             break;
//                         case this.utilsService.addListItems:
//                             this.logService.log('user has AddListItemsPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
//                             try {
//                                 this.uiStateService.updateUiState(this.utilsService.addListItems, element.value)
//                             } catch (e) {
//                                 this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
//                             }

//                             break;
//                         default:
//                             this.logService.log('unable to determine permissions type', this.utilsService.errorStatus, false)
//                             break;
//                         }
//                     })
//                 } else {
//                     this.logService.log(data, this.utilsService.infoStatus, true);

//                 }
//             },
//             err => {
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 try {
//                     this.uiStateService.updateUiState(this.utilsService.message, 'error unable to check user permissions')
//                     this.uiStateService.updateUiState(this.utilsService.uiState, this.utilsService.redStatus)
//                     this.scriptsStream.error('error unable to check user permissions');
//                 } catch (e) {
//                     this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
//                 }
//             },
//             () => {
//                 this.logService.log('get permissions observer has completed', this.utilsService.infoStatus, true);
//                 this.scriptsStream.complete();
//             }
//         );
//     }



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
healthReport() {
    // reset health report data
    this._healthReport = {
        date: new Date(),
        permissions: {
            permission: '',
            result: false
        },
        listExists: [],
        listXmlData: [],
        fieldsExists: [],
        fieldsType: [],
        fieldsRequired: [],
        errors: []
    }

    if (!this.settingsService.viewList) {
        this.scriptsStream.next(`user does not have permissions to view list`);
        return
    } else {
        this._healthReport.permissions = {
            permission: this.utilsService.viewList,
            result: true
        }        
    }

    let healthCheck$:Observable<any> = Observable
            .of(this.settingsService.viewList)
            .mergeMap(permissions => permissions == true
                        ? Observable
                            .from(this.constructListExistsApiArry())
                            .mergeAll()
                        : Observable.of(permissions)
            )
            .mergeMap(data => 
                        (typeof(data) == 'object' && 
                        data.hasOwnProperty('listName') &&
                        data.hasOwnProperty('apiCall') &&
                        data.hasOwnProperty('result') &&
                        data['apiCall'] == this.utilsService.apiCallListExists && 
                        data['result'] == true)
                        
                        ? this.commonApiService.getListXml(data['listName'], this.utilsService.hostWeb) 
                        : Observable.of(data)
            )
            .mergeMap(data => 
                        (typeof(data) == 'object' &&
                        data.hasOwnProperty('result') &&
                        data.hasOwnProperty('schemaXml') &&
                        data.hasOwnProperty('apiCall') &&
                        data['result'] == true && 
                        data['schemaXml'] &&
                        data['apiCall'] == this.utilsService.apiCallListXmlData)
                        
                        ? Observable.of(this.checkFieldsHealthReport(data)) 
                        : Observable.of(data)
            )
            // .subscribe(
            //     data => {
            //         if (typeof(data) === 'object' && 
            //             data.reportHeading && 
            //             data.reportResult) {
            //             // add report results to healthreport array
            //             if (this._healthReport.hasOwnProperty(data.reportHeading)) {
            //                 try {
            //                     this._healthReport[data.reportHeading].push = data
            //                 } catch (e) {
            //                     this.logService.log(e, this.utilsService.errorStatus, false);
            //                 }
            //             }
            //         } else {

            //             this.scriptsStream.next(data);
            //         }

            //     },
            //     err => {
            //         this.logService.log(err, this.utilsService.errorStatus, false);
            //         this.scriptsStream.next(`error running health report`)
            //         try {
            //             this._healthReport.errors.push(err);
            //         } catch (e) {
            //             this.logService.log(e, this.utilsService.errorStatus, false);
            //         }
                    
            //         //this.provisionerStream.error(err)
            //     },
            //     () => {
            //         //update the health report
            //         this.healthReportService.healthReport = this._healthReport;
            //         //not sure if needed
            //         this.scriptsStream.next(this._healthReport);              
            //         this.scriptsStream.next('exiting health check')
            //     }
            // )
    

    
    return healthCheck$

    // let getListXmlObservable = this.commonApiService.getListXml(listName, this.utilsService.hostWeb)

    // let checkFieldsObservable = Observable().from(this.checkFieldsHealthReport(fields))

    // this.checkPermissionsHealthReport();

}




// private checkPermissionsHealthReport (){
//     let viewPermissions: Boolean
//     //1.check permissions
//     viewPermissions = this.uiStateService.getUiState('viewList');

//     if (!viewPermissions) {
//         this.healthReportStream.next('user does not have permissions to run the health report')
//         this.healthReportStream.complete()
//         this._healthReport.permissionsResults = {
//             permission: 'viewList',
//             result: false
//         }
//         return;
//     } else {
//         this.healthReportStream.next('user has permissions to view lists')
//         this._healthReport.permissionsResults = {
//             permission: 'viewList',
//             result: true
//         }
//         this.checkListExistsHealthReport()
//     }
// }


// private checkListExistsHealthReport() {
//     //2.check Lists exist
//     let listArry:Array<any>
   
//     listArry = [this.utilsService.financeAppResourceData, 
//                 this.utilsService.financeAppMaterialData,
//                 this.utilsService.financeAppTotalsData]
    
//     listArry.forEach(listName => {
//         this.commonApiService.listExists(listName, this.utilsService.hostWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                     data.listName && 
//                     data.value) {
//                     this.healthReportStream.next('List ' + data.listName + ' exists: ' + data.value)   
//                     if (data.value == true) {
//                         //list exists so check fields
//                         this.getFieldsHealthReport(data)
//                     } else {
//                         //check settings of app to see if script should auto create lists
//                         //this.createList(data)
//                     }
//                     // add results to array
//                     this._healthReport.listExistsResults.push(data)
                    
//                 }
//                 this.healthReportStream.next(data);

//             },
//             err => {
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this.healthReportStream.next(`unable to check if list ${listName} exists`)
//                 this._healthReport.listsFailedToCheck.push(listName);
//                 //this.provisionerStream.error(err)
//             },
//             () => {
//                 //update health report
//                 this.healthReportService.healthReport = this._healthReport;                
//                 this.healthReportStream.next('exiting check list exists function call')
//             }
//         )
//     })
    
// }

// private getFieldsHealthReport(listName){
//     //let listFailedGetXml: Array<any>;
//     this.commonApiService.getListXml(listName, this.utilsService.hostWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                     data.listName == listName && 
//                     data.schemaXml) {
//                     this.healthReportStream.next('List xml for ' + data.listName + ' recieved ')
//                     this._healthReport.listXmlData.push(data)  
//                     this.checkFieldsHealthReport(data)
//                 }
//                 this.healthReportStream.next(data);                
//             },
//             err => {
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this.healthReportStream.next(`unable to get schemaXml list ${listName}`)
//                 try {
//                     this._healthReport.listFailedGetXml.push(listName);
//                 } catch (e) {
//                     this.logService.log(e, this.utilsService.errorStatus, false);
//                     return
//                 }
//             },
//             () => {
//                 this.healthReportStream.next('exiting get fields function call')
//                 //update health report
//                 this.healthReportService.healthReport = this._healthReport;
//             }
//         )
// }

private checkFieldsHealthReport(data){
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
    this.scriptsStream.next(jsonFldArry);

    try {
        jsonFldArry = jsonFldArry['List']['Fields']['Field']
    } catch (e) {
        this.logService.log(e, this.utilsService.errorStatus, false);
        return;
    }

    //get a copy of the list defintion to compare agains
    try {
        listDefintion = this.listService.getListSpec(listName);
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
                this._healthReport.fieldsRequired.push({
                    reportHeading: this.utilsService.apiCallFieldsRequired,
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    fieldName: _element.Name,
                    oldSchema: 'Required="TRUE"',
                    newSchema: 'Required="FALSE"'
                });           
        }

        //now see if field matches one on the field spec
        let _i = listDefintion.findIndex((element) => {
            return element.Name === _element.Name
        })
        if (_i !== -1) {
            //Field found
            //check its of correct type. If not of correct type then the app may fail to save data
            if (_element.Type !== listDefintion[_i].Type) {

                //add fields of wrong type into health report
                this._healthReport.fieldsType.push({
                    reportHeading:this.utilsService.apiCallFieldsType,
                    reportResult:this.utilsService.failStatus,
                    listName: listName,
                    fieldName: _element.Name,
                    oldSchema: 'Type: "' + _element.Type + '"',
                    newSchema: 'Type: "' + listDefintion[_i].Type + '"'
                })                 
            }
            //remove from index for performance gains on the loop as well as stricking off correctly found fields
            //any that are left in the array after the loop will imply that they don't exist on the list and will need to be created.
            listDefintion.splice(_i,1)
        }
    
    }

    //add missing fields into healthreport
    listDefintion.forEach(field => {
        this._healthReport.fieldsExists.push ({
            reportHeading: this.utilsService.apiCallFieldsExists,
            reportResult: this.utilsService.failStatus,
            listName: listName,
            fieldName: field.Name
        })

    })

    //update health report
    this.healthReportService.healthReport = this._healthReport;

    return;
}











//////////////////////////////////////////////////////////////////////////////////////////////////
//ACTION HEALTH REPORT

public actionHealthReport(){

    //reset action health report results doucument
        // reset health report file
    this._actionHealthReportResults = {
        date: new Date(),
        permissions: {
            permission: this.utilsService.manageList,
            result: false
        },
        createList: [],
        addFields: [],
        updateField: [],
        errors: []
    }

    //this.checkPermissionsActionHealthReport();
    if (!this.uiStateService.getUiState(this.utilsService.manageList)) {
        this.scriptsStream.next(`user does not have permissions to manage lists`);
        return
    } else {
         this._actionHealthReportResults.permissions = {
            permission: this.utilsService.manageList,
            result: true
        }
    }

    //1. get data
    let _healthReport:IHealthReport = this.healthReportService.healthReport
    let listsToCreate: Array<IReportResult> = [];
    let fieldsToCreate: Array<IReportResult> = [];
    let fieldsSetRequired: Array<IFieldUpdateReportResult> = [];
    let fieldsWrongType: Array<IFieldUpdateReportResult> = [];

    console.log(this._healthReport)
    try {
        if (_healthReport.listExists && _healthReport.listExists.length > 0) {
            _healthReport.listExists.forEach((element:IReportResult) => {
                //if report status is set to fail then list doesn't exist
                if (element.reportResult == this.utilsService.failStatus) {
                    listsToCreate.push(element)
                } 
            })
        }

        if (_healthReport.fieldsExists && _healthReport.fieldsExists.length > 0) {
            _healthReport.fieldsExists.forEach((element:IReportResult)=>{
                // if report status is set to fail then field doesn't exist
                if (element.reportResult == this.utilsService.failStatus) {
                    fieldsToCreate.push(element)
                }
            })
        }


        if (_healthReport.fieldsRequired && _healthReport.fieldsRequired.length > 0) {
            _healthReport.fieldsRequired.forEach((element:IFieldUpdateReportResult) => {
                // if report status is set to fail then field incorrectly set to required
                if (element.reportResult == this.utilsService.failStatus) {
                    fieldsSetRequired.push(element)
                }
            })
        }

        if (_healthReport.fieldsType && _healthReport.fieldsType.length > 0) {
            _healthReport.fieldsType.forEach((element:IFieldUpdateReportResult) => {
                // if report status is set to fail then field incorrectly set to wrong type
                if (element.reportResult == this.utilsService.failStatus) {
                    fieldsWrongType.push(element)
                }
            })
        }
    } catch(e) {
        this.logService.log(e, this.utilsService.errorStatus, false)
        this.scriptsStream.next('error getting health report data, exiting action health report function')
        return;
    }

    let listsToCreateApi = this.constructListsToCreateApiArray(listsToCreate) || [];
    let fieldsToCreateApi = this.constructFieldsToCreateApiArray(fieldsToCreate) || [];
    let fieldsToUpdateApi = this.constructFieldsToUpdatedArray(fieldsSetRequired, fieldsWrongType) || [];
    
    let _observableArray = []

    if (listsToCreateApi.length > 0) {
        _observableArray = _observableArray.concat(listsToCreateApi)
    }

    if (fieldsToCreateApi.length > 0) {
        _observableArray = _observableArray.concat(fieldsToCreateApi)
    }

    if (fieldsToUpdateApi.length > 0) {
        _observableArray = _observableArray.concat(fieldsToUpdateApi)
    }

    console.log(_observableArray);

    if (_observableArray.length == 0) {
        this.scriptsStream.next('no action required exiting action health check function')
        return
    }

    let actionHealthReport = Observable
            .of(this.settingsService.manageList)
            .mergeMap(permissions => permissions == true
                ? Observable.from(_observableArray)
                    .mergeAll()
                : Observable.of(permissions)
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
            .subscribe(
                data => {
                    if (typeof(data) === 'object' && 
                        data.hasOwnProperty('reportHeading') && 
                        data.hasOwnProperty('reportResult')) {
                        // add report results to healthreport array
                        if (this._actionHealthReportResults.hasOwnProperty(data['reportHeading'])) {
                            try {
                                this._actionHealthReportResults[data['reportHeading']].push = data
                            } catch (e) {
                                this.logService.log(e, this.utilsService.errorStatus, false);
                            }
                        }
                    } else {

                        this.scriptsStream.next(data);
                    }
                },
                err => {
                    this.logService.log(err, this.utilsService.errorStatus, false);
                    this.scriptsStream.next(`error running action health report`)
                    try {
                        this._actionHealthReportResults.errors.push(err);
                    } catch (e) {
                        this.logService.log(e, this.utilsService.errorStatus, false);
                    }
                },
                () => {
                    this.scriptsStream.next(this._actionHealthReportResults)
                    this.scriptsStream.next('exiting Action Health Report function')
                }
            )
}



// //1. Check Permissions
// private checkPermissionsActionHealthReport (){
//     let managePermissions: Boolean
//     //1.check permissions
//     managePermissions = this.uiStateService.getUiState[this.utilsService.manageList];
//     this.logService.log(`retrieving requistie permissions - manage List: ${managePermissions}`)
    
//     if (!managePermissions) {
//         this.scriptsStream.next('user does not have permissions to run Action Health Report')
//         this._actionHealthReportResults.permissionsResults = {
//             permission: this.utilsService.manageList,
//             result: false
//         }
//         this.scriptsStream.complete()
//         return;
//     } else {
//         this.scriptsStream.next('user has permissions to manage lists')
//         this._actionHealthReportResults.permissionsResults = {
//             permission: this.utilsService.manageList,
//             result: true
//         }
//         this.healthReportService.actionHealthReport = this._actionHealthReportResults
//         this.actionHealthReportInit()
//     }
// }


// //2 init action health report
// private actionHealthReportInit() {
//     //reset action health report results doucument
//         // reset health report file
//     this._actionHealthReportResults = {
//         date: new Date(),
//         permissionsResults: {
//             permission: this.utilsService.manageList,
//             result: false
//         },
//         createListSuccess: [],
//         createListsFailed: [],
//         createListError: [],
//         createFieldsSuccess: [],
//         createFieldsFailed: [],
//         createFieldsError: [],
//         updateFieldsSuccess: [],
//         updateFieldsFailed: [],
//         updateFieldsError: []

//     }
//     this._actionHealthReportResults.date = new Date();
    
//     //1. get data
//     let healthReport = this.healthReportService.healthReport
    
//     let listToCreate = healthReport.missingLists
//     let fieldToCreate = healthReport.missingFields
//     let fieldsSetRequired = healthReport.fieldsRequired
//     let fieldsWrongType = healthReport.fieldsWrongtype

//     //create lists
//     listToCreate.forEach(listName => {
//         this.createList(healthReport);
//     })

//     //Reorder create fields into groups of arrays
//     let _fieldsToCreateOrdered = {};
    
//     fieldToCreate.forEach((fieldSpec:IFieldThatDoesntExist) => {
//         //NOTE IT IS MORE EFFICIENT TO PASS IN AN ARRAY OF FIELDS FOR EACH LIST TO REDUCE NUMBER OF API CALLS
//         _fieldsToCreateOrdered[fieldSpec.listName] = _fieldsToCreateOrdered[fieldSpec.listName] || []
//         _fieldsToCreateOrdered[fieldSpec.listName].push(fieldSpec)
//     })

//     //  now create fields passing in an array of each fields for each list
//     for (let i in _fieldsToCreateOrdered) {
//         if (_fieldsToCreateOrdered.hasOwnProperty(i)) {
//             this.createFields(_fieldsToCreateOrdered[i], i)
//         }
//     }

//     //update fields set to required
//     fieldsSetRequired.forEach(fieldSpec => {
//         this.updateFields(fieldSpec)
//     })

//     //update fields set to wrong type
//     fieldsWrongType.forEach(fieldSpec => {
//         this.updateFields(fieldSpec);
//     })    
// }


// //3. Create Lists
// private createList(listName) {
//     this.logService.log('creating lists', this.utilsService.infoStatus, true);

//         this.actionHealthReportStream.next('creating List ' + listName)
//         this.logService.log('creating list: ' + listName, this.utilsService.infoStatus, true)
//         this.commonApiService.createList(listName, 
//                                         this.utilsService.hostWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                         data.listName && 
//                         data.result) {
//                         this.actionHealthReportStream.next('List ' + data.listName + ' created: ' + data.result)

//                         this._actionHealthReportResults.createListSuccess.push(data)   
//                     }              
//             },
//             err => {
//                 this.actionHealthReportStream.next('unable to create list: ' + listName)
//                 this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this._actionHealthReportResults.createListError.push({ listName: listName, error: err })
//             },
//             () => {
//                 this.healthReportService.actionHealthReport = this._actionHealthReportResults
//                 this.actionHealthReportStream.next('exiting create list function for ' + listName)
//             }
//         );
        
// }

// //4.create fields that don't exist
// private createFields(fieldSpecArry: Array<IFieldThatDoesntExist>, listName: string){
//     this.logService.log('creating fields', this.utilsService.infoStatus, true);

//     let _fieldXml = []
    
//     fieldSpecArry.forEach(element=>{
//       _fieldXml.push(this.listService.getFieldXml(listName, element.fieldName))  
//     })

//     //NOTE API CALL HERE HAS BEEN DESIGNED TO TAKE AN ARRAY OF FIELDS FOR EACH LIST TO REDUCE API CALLS
//     this.commonApiService.addListFields(listName, _fieldXml, this.utilsService.hostWeb)
    
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                         data.listName && 
//                         data.result) {
//                             this.provisionerStream.next('Fields have been added to list: ' + data.listName + ' created: ' + data.result)
                        
//                         if (data.result == true) {
//                             this._actionHealthReportResults.createFieldsSuccess.push(data)
//                         } else {
//                             this._actionHealthReportResults.createFieldsFailed.push(data)
//                         }   
//                     }              
//             },
//             err => {
//                 this.provisionerStream.next('unable to create list: ' + listName)
//                 this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this._actionHealthReportResults.createFieldsError.push({
//                     listName: listName,
//                     error: err
//                 })
//             },
//             () => {
//                 this.healthReportService.actionHealthReport = this._actionHealthReportResults
//                 this.actionHealthReportStream.next('exiting create list function for ' + listName)
//             }
//         )
        
// }

// //5.update fields that have incorrect configuration
// private updateFields(fieldSpec: IFieldUpdate){
//     this.logService.log('updating fields', this.utilsService.infoStatus, true);
//     this.commonApiService.updateField(fieldSpec.fieldName, fieldSpec.listName, this.utilsService.hostWeb, fieldSpec.oldSchema, fieldSpec.newSchema)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                         data.listName &&
//                         data.fieldName && 
//                         data.result) {
//                             this.actionHealthReportStream.next('Fields have been updated to list: ' + data.listName + ' updated: ' + data.result)
                        

//                         if (data.result == true) {
//                             this._actionHealthReportResults.updateFieldsSuccess.push(data)
//                         } else {
//                             this._actionHealthReportResults.updateFieldsFailed.push(data)
//                         }
//                 }                
//             },
//             err => {
//                 this.actionHealthReportStream.next('unable to update field: ' + fieldSpec.listName)
//                 this.logService.log('unable to create list: ' + fieldSpec.listName, this.utilsService.errorStatus, false);
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this._actionHealthReportResults.updateFieldsError.push({
//                     listName: fieldSpec.listName,
//                     fieldName: fieldSpec.fieldName,
//                     error: err
//                 })
//             },
//             () => {
//                 this.healthReportService.actionHealthReport = this._actionHealthReportResults
//                 this.actionHealthReportStream.next('exiting update field function for ' + fieldSpec.listName)
//             }
//         )


// }

///////////////////////////////////////////////////////////////////////////////////////
// PROVISIONER
public provisioner() {



    //check permissions
    //If list exists DELETE then RECREATE LISTS, otherwise CREATE
    this._provisionerReport = {
        date: new Date(),
        permissions: {
            permission: this.utilsService.viewList,
            result: false
        },
        listExists: [],
        createList: [],
        deleteList: [],
        errors: []
    };
    
    if (!this.uiStateService.getUiState(this.utilsService.manageList)) {
        this.scriptsStream.next('user does not have permissions to run provisioner')
        return
    } else {
        this._provisionerReport.permissions = {
        permission: this.utilsService.manageList,
        result: true
        }
    }

    let provisioner$ = Observable
            .from(this.constructListExistsApiArry())
            .mergeAll()
            .mergeMap(data => 
                (typeof(data) === 'object' && 
                    data.hasOwnProperty('listName') && 
                    data.hasOwnProperty('apiCall') && 
                    data.hasOwnProperty('result') &&
                    data['result'] == true && 
                    data['apiCall'] == this.utilsService.apiCallListExists)
                ? this.commonApiService.deleteList(data['listName'], this.utilsService.hostWeb)
                : this.placeholderObservable(data)
            )
            .mergeMap(data => 
                (typeof(data) == 'object' && 
                    data.hasOwnProperty('listName') && 
                    data.hasOwnProperty('apiCall') && 
                    data.hasOwnProperty('result') &&
                    data.result == false && 
                    data.apiCall == this.utilsService.apiCallListExists)
                ? this.commonApiService.createList(data['listName'], this.utilsService.hostWeb) 
                : this.placeholderObservable(data)
            )
            .mergeMap(data => 
                (typeof(data) === 'object' && 
                    data.hasOwnProperty('listName') && 
                    data.hasOwnProperty('apiCall') && 
                    data.hasOwnProperty('result') &&
                    data.result == true && 
                    data.apiCall == this.utilsService.apiCallDeleteList)
                ?  this.commonApiService.createList(data['listName'], this.utilsService.hostWeb) 
                : this.placeholderObservable(data)
            )            
            .mergeMap(data => 
                (typeof(data) === 'object' &&
                    data.hasOwnProperty('listName') && 
                    data.hasOwnProperty('apiCall') && 
                    data.hasOwnProperty('result') &&
                    data.apiCall == this.utilsService.apiCallCreateList &&
                    data.result == true)
                ? this.commonApiService.updateField('Title', data['listName'],this.utilsService.hostWeb, 'Required="TRUE"', 'Required="FALSE"')
                : this.placeholderObservable(data)
            )
            // .subscribe(
            //     data => {
            //         if (typeof(data) === 'object' && 
            //             data.reportHeading && 
            //             data.reportResult) {
            //             // add report results to healthreport array
            //             if (this._provisionerReport.hasOwnProperty(data.reportHeading)) {
            //                 try {
            //                     this._provisionerReport[data.reportHeading].push = data
            //                 } catch (e) {
            //                     this.logService.log(e, this.utilsService.errorStatus, false);
            //                 }
            //             }
            //         } else {
            //             this.scriptsStream.next(data);
            //         }
            //     },
            //     err => {
            //         this.logService.log(err, this.utilsService.errorStatus, false);
            //         this.scriptsStream.next(`error running provisioner function`)
            //         try {
            //             this._provisionerReport.errors.push(err);
            //         } catch (e) {
            //             this.logService.log(e, this.utilsService.errorStatus, false);
            //         }
            //     },
            //     () => {
            //         this.scriptsStream.next(this._provisionerReport)
            //         this.scriptsStream.next('exiting Provisioner function')
            //     }
            // )                

        return provisioner$
}

// private checkPermissionsProvisioner (permissionLevel){
//     let viewPermissions: Boolean
//     //1.check permissions
//     viewPermissions = this.uiStateService.getUiState(permissionLevel);
//     this.provisionerStream.next(`user has view permissions: ${viewPermissions}`)
//     if (!viewPermissions) {
//         this.provisionerStream.next('user does not have permissions to run provisioner')
//         this._provisionerReport.permissionsResults = {
//             permission: 'manageList',
//             result: false
//         }
//         this.healthReportService.provisionerReport = this._provisionerReport
//         this.provisionerStream.complete()
//         return;
//     } else {
//         this.provisionerStream.next('user has permissions to manage lists')
//         this._provisionerReport.permissionsResults = {
//             permission: 'manageList',
//             result: true
//         }
//         this.healthReportService.provisionerReport = this._provisionerReport
//         this.provisionerStream.next(`running check list exists function for provisioner`)
//         this.checkListExistsProvisioner()
//     }
// }


// private checkListExistsProvisioner () {
//     //2.check Lists exist
//     let listArry:Array<any>
    
//     listArry = [this.utilsService.financeAppResourceData, 
//                 this.utilsService.financeAppMaterialData,
//                 this.utilsService.financeAppTotalsData]
    
//     listArry.forEach(listName => {
//         this.provisionerStream.next('')
//         this.commonApiService.listExists(listName, this.utilsService.hostWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                     data.listName && 
//                     data.value) {
//                     this.provisionerStream.next('List ' + data.listName + ' exists: ' + data.value)   
//                     if (data.value == true) {
//                         this._provisionerReport.listExistsSuccess.push(data)
//                         //list exists so delete it beofre trying to recreate it
//                         this.provisionerStream.next(`running delete list function for list ${data.listName}`)
//                         this.deleteThenCreateList(data.listName)
//                     } else {
//                         //just create list
//                         this._provisionerReport.listExistsFailed.push(data)
//                         this.provisionerStream.next(`running create list function for list ${data.listName}`)
//                         this.createListProvisioner(data.listName)
//                     }
                   
//                 }
//                 this.provisionerStream.next(data);
//             },
//             err => {
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this.provisionerStream.next(`unable to check if list ${listName} exists`)
//                 this.provisionerStream.next(
//                     {
//                         functionName: 'listExists',
//                         listName: listName,
//                         result: false
//                     }
//                 )
//                 this._provisionerReport.listExistsError.push({
//                     listName: listName,
//                     error: err
//                 })
//             },
//             () => {
//                 this.provisionerStream.next('exiting check list exists function call')
//             }
//         )
//     })
    
// }

// private deleteThenCreateList(listName) {
//     this.commonApiService.deleteList(listName, this.utilsService.hostWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                         data.listName && 
//                         data.result) {
                        
//                         this.provisionerStream.next('List ' + data.listName + ' delete: ' + data.result)   
//                         if (data.result == true) {
//                             // now recreate list
//                             this.provisionerStream.next(`running create list function for provisioner`)
//                             this.createListProvisioner(data.listName);
//                             this._provisionerReport.listDeleteSuccess.push(data)
//                         } else {
//                             this.provisionerStream.next(`failed delete list function for provisioner`)
//                             this._provisionerReport.listDeleteFailed.push(data);
//                         }
//                     }
//             },
//             err => {
//                 this.provisionerStream.next('unable to delete list: ' + listName)
//                 this.provisionerStream.next(
//                     {
//                         functionName: 'deleteList',
//                         listName: listName,
//                         result: false
//                     }
//                 )
//                 this.logService.log('unable to delete list: ' + listName, this.utilsService.errorStatus, false);
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this._provisionerReport.listDeleteError.push({
//                     listName:listName,
//                     error: err
//                 })
//             },
//             () => {
//                 this.provisionerStream.next('exiting delete list function for ' + listName)
//             }
//         )
// }

// private createListProvisioner(listName) {
//     this.logService.log('creating lists', this.utilsService.infoStatus, true);

//         this.provisionerStream.next('creating List ' + listName)
//         this.logService.log('creating list: ' + listName, this.utilsService.infoStatus, true)
//         this.commonApiService.createList(listName, 
//                                         this.utilsService.hostWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                         data.listName && 
//                         data.result) {
//                         this.provisionerStream.next('List ' + data.listName + ' created: ' + data.result)
//                         if (data.result == true) {
//                             this._provisionerReport.listCreateSuccess.push(data)   
//                         } else {
//                             this._provisionerReport.listCreateFailed.push(data);
//                         }
                        
//                     }              
//             },
//             err => {
//                 this.provisionerStream.next('unable to create list: ' + listName)
//                 this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this._provisionerReport.listCreateError.push({ listName: listName, error: err })
//                 this.healthReportService.provisionerReport = this._provisionerReport
//             },
//             () => {
//                 this.healthReportService.provisionerReport = this._provisionerReport
//                 this.provisionerStream.next('exiting create list function for ' + listName)
//             }
//         );
        
// }


///////////////////////////////////////////////////////////////////////////////////////
//SETTINGS LIST SCRIPT

// check settings list and fields exist, create if does not
public settingsListReport(){
    //reset settings report data
    this._settingsReport = {
        date: new Date(),
        permissions: {
            permission: this.utilsService.manageList,
            result: false
        },
        listExists: [],
        createList: [],
        listXmlData: [],
        fieldsRequired: [],
        fieldsType: [],
        fieldsExists: [],
        errors: []
    };

    if (!this.settingsService.manageList) {
        this.scriptsStream.next('user does not have permissions to run settings Report')
        return
    } else {
        this._settingsReport.permissions = {
        permission: this.utilsService.manageList,
        result: true
        }
    }    

    let settingsListReport = 
                this.commonApiService.listExists(this.utilsService.financeAppSettingsData, this.utilsService.appWeb)
                .mergeMap(data => 
                    (typeof(data) === 'object' && 
                        data.hasOwnProperty('listName') &&
                        data.hasOwnProperty('result') &&
                        data.hasOwnProperty('apiCall') && 
                        data['result'] === false && 
                        data['apiCall'] === this.utilsService.apiCallListExists) 
                    ?  this.commonApiService.createList(data['listName'], this.utilsService.appWeb) 
                    : this.placeholderObservable(data)
                )
                .mergeMap(data => 
                    (typeof(data) === 'object' &&
                        data.hasOwnProperty('listName') &&
                        data.hasOwnProperty('result') &&
                        data.hasOwnProperty('apiCall') && 
                        data['apiCall'] === this.utilsService.apiCallCreateList &&
                        data['result'] === true)
                    ? this.commonApiService.updateField('Title', data.listName,this.utilsService.appWeb, 'Required="TRUE"', 'Required="FALSE"')
                    : this.placeholderObservable(data)
                )
                .mergeMap(data => 
                    (typeof(data) === 'object' &&
                    data.hasOwnProperty('apiCall') &&
                    data.hasOwnProperty('listName') &&
                    data.hasOwnProperty('result') &&
                    data['apiCall'] === this.utilsService.apiCallListExists && 
                    data['result'] === true)
                    
                    ? this.commonApiService.getListXml(data.listName, this.utilsService.hostWeb) 
                    : this.placeholderObservable(data)
                )
                .mergeMap(data => 
                    (typeof(data) == 'object' && 
                    data.hasOwnProperty('result') &&
                    data.hasOwnProperty('schemaXml') &&
                    data.hasOwnProperty('apiCall') &&
                    data['result'] == true && 
                    data['apiCall'] == this.utilsService.apiCallListXmlData)
                    
                    ? Observable.of(this.checkFieldsSettingsList(data)) 
                    : this.placeholderObservable(data)
                )

                .subscribe(
                    data => {
                        if (typeof(data) === 'object' && 
                            data.reportHeading && 
                            data.reportResult) {
                            // add report results to healthreport array
                            if (this._settingsReport.hasOwnProperty(data.reportHeading)) {
                                try {
                                    this._settingsReport[data.reportHeading].push = data
                                } catch (e) {
                                    this.logService.log(e, this.utilsService.errorStatus, false);
                                }
                            }
                        } else {
                            this.scriptsStream.next(data);
                        }
                    },
                    err => {
                        this.logService.log(err, this.utilsService.errorStatus, false);
                        this.scriptsStream.next(`error Settings check function`)
                        try {
                            this._settingsReport.errors.push(err);
                        } catch (e) {
                            this.logService.log(e, this.utilsService.errorStatus, false);
                        }
                    },
                    () => {
                        this.scriptsStream.next(this._settingsReport)
                        this.scriptsStream.next('exiting Settings check function')
                        
                    }
                )
//  this.checkPermissionsSettingsList('manageList')
}

// private checkPermissionsSettingsList(permissionLevel) {
//     let managePermissions: Boolean
//     //1.check permissions
//     managePermissions = this.uiStateService.getUiState(permissionLevel);
//     console.log(managePermissions)
//     if (!managePermissions) {
//         this.settingsStream.next('user does not have permissions to run Settings Report')
//         this._settingsReport.permissionsResults = {
//             permission: permissionLevel,
//             result: false
//         }
//         //update settings report
//         this.healthReportService.settingsReport = this._settingsReport
//         this.settingsStream.complete()
//         return;
//     } else {
//         this.settingsStream.next('user has permissions to manage lists')
//         this._settingsReport.permissionsResults = {
//             permission: permissionLevel,
//             result: true
//         }
//         //update settings report
//         this.healthReportService.settingsReport = this._settingsReport        
//         this.settingsListInit()
//     }    
// }

// private settingsListInit() {
    
//     this.checkSettingsListExists()
// }

// private checkSettingsListExists() {
//     //2.check Lists exist
//     let listArry:Array<any>
//     //let listExistsRsltsArry:Array<IListExists>;
//     //let listsFailedToCheck: Array<string>

//     //listExistsRsltsArry = [];
//     //listsFailedToCheck = []; 
    
//     listArry = [this.utilsService.financeAppSettingsData]
    
//     listArry.forEach(listName => {
//         this.commonApiService.listExists(listName, this.utilsService.appWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                     data.listName && 
//                     data.value) {
//                     this.settingsStream.next('List ' + data.listName + ' exists: ' + data.value)   
//                     if (data.value == true) {
//                         //list exists so check fields
//                         this.getFieldsSettingsList(listName)
//                     } else {
//                         //check settings of app to see if script should auto create lists
//                         this.createSettingsList(listName)
//                     }
//                     // add results to array
//                     this._settingsReport.listExistsResults.push(data)
                    
//                 }
//                 this.settingsStream.next(data);

//             },
//             err => {
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this.settingsStream.next(`unable to check if list ${listName} exists`)
//                 this._settingsReport.listsFailedToCheck.push(listName);
//                 //update settings report
//                 this.healthReportService.settingsReport = this._settingsReport
//             },
//             () => {
//                 this.settingsStream.next('exiting check settings list exists function call')
//                 //update settings report
//                 this.healthReportService.settingsReport = this._settingsReport                
//             }
//         )
//     })
    
// }
// //DUPLICATE OF PREVIOUS FUNCITON REFACTORING REQUIRED
// private createSettingsList(listName){
//     this.logService.log('creating lists', this.utilsService.infoStatus, true);

//         this.settingsStream.next('creating List ' + listName)
//         this.logService.log('creating list: ' + listName, this.utilsService.infoStatus, true)
//         this.commonApiService.createList(listName, 
//                                         this.utilsService.appWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                         data.listName && 
//                         data.result) {
//                         this.settingsStream.next('List ' + data.listName + ' created: ' + data.result)

//                         this._actionHealthReportResults.createListSuccess.push(data)   
//                     }
//             },
//             err => {
//                 this.settingsStream.next('unable to create list: ' + listName)
//                 this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this._actionHealthReportResults.createListError.push({ listName: listName, error: err })
//                 //update settings report
//                 this.healthReportService.settingsReport = this._settingsReport                
//             },
//             () => {
//                 this.settingsStream.next('exiting create list function for ' + listName)
//                 //update settings report
//                 this.healthReportService.settingsReport = this._settingsReport                
//             }
//         );    
// }
// //DUPLICATE OF EARLIER FUNCTION REFACTORING REQUIRED
// private getFieldsSettingsList(listName){
//     //let listFailedGetXml: Array<any>;
//     this.commonApiService.getListXml(listName, this.utilsService.appWeb)
//         .subscribe(
//             data => {
//                 if (typeof(data) === 'object' && 
//                     data.listName == listName && 
//                     data.schemaXml) {
//                     this.settingsStream.next('List xml for ' + data.listName + ' received ')
//                     this._settingsReport.listXmlData.push(data)  
//                     this.checkFieldsSettingsList(data)
//                 }
//                 this.settingsStream.next(data);                
//             },
//             err => {
//                 this.logService.log(err, this.utilsService.errorStatus, false);
//                 this.settingsStream.next(`unable to get schemaXml list ${listName}`)
//                 try {
//                     this._settingsReport.listFailedGetXml.push(listName);
//                 } catch (e) {
//                     this.logService.log(e, this.utilsService.errorStatus, false);
//                     return
//                 }
//                 //update settings report
//                 this.healthReportService.settingsReport = this._settingsReport                
//             },
//             () => {
//                 this.settingsStream.next('exiting get fields settings function call')
//                 //update settings report
//                 this.healthReportService.settingsReport = this._settingsReport                
//             }
//         )
// }
//DUPLICATE OF EARLIER FUNCTION, REFACTORING REQUIRED
private checkFieldsSettingsList(data){
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
    this.scriptsStream.next(jsonFldArry);

    try {
        jsonFldArry = jsonFldArry['List']['Fields']['Field']
    } catch (e) {
        this.logService.log(e, this.utilsService.errorStatus, false);
        return;
    }

    //get a copy of the list defintion to compare agains
    try {
        listDefintion = this.listService.getListSpec(listName);
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
                this._settingsReport.fieldsRequired.push({
                    reportHeading: this.utilsService.apiCallFieldsRequired,
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    fieldName: _element.Name,
                    oldSchema: 'Required="TRUE"',
                    newSchema: 'Required="FALSE"'
                });           
        }

        //now see if field matches one on the field spec
        let _i = listDefintion.findIndex((element) => {
            return element.Name === _element.Name
        })
        if (_i !== -1) {
            //Field found
            //check its of correct type. If not of correct type then the app may fail to save data
            if (_element.Type !== listDefintion[_i].Type) {

                //add fields of wrong type into health report
                this._settingsReport.fieldsType.push({
                    reportHeading:this.utilsService.apiCallFieldsType,
                    reportResult:this.utilsService.failStatus,
                    listName: listName,
                    fieldName: _element.Name,
                    oldSchema: 'Type: "' + _element.Type + '"',
                    newSchema: 'Type: "' + listDefintion[_i].Type + '"'
                })                 
            }
            //remove from index for performance gains on the loop as well as stricking off correctly found fields
            //any that are left in the array after the loop will imply that they don't exist on the list and will need to be created.
            listDefintion.splice(_i,1)
        }
    
    }

    //add missing fields into healthreport
    listDefintion.forEach(field => {
        this._settingsReport.fieldsExists.push ({
            reportHeading: this.utilsService.apiCallFieldsExists,
            reportResult: this.utilsService.failStatus,
            listName: listName,
            fieldName: field.Name
        })

    })

    //update health report
    this.healthReportService.healthReport = this._healthReport;

    return;
}



///UTILS

placeholderObservable(data) {
    data = data || []

    let place$ = new Observable((observer: Observer<any>) => {
        observer.next(data);
        observer.complete();
    })
    return place$
}

constructListExistsApiArry(){
    let _listArry = []
    let _listApiArry = [];

    try {
        _listArry = [this.utilsService.financeAppResourceData, 
                    this.utilsService.financeAppMaterialData,
                    this.utilsService.financeAppTotalsData]
        _listArry.forEach(listName => {
            _listApiArry.push(this.commonApiService.listExists(listName, this.utilsService.hostWeb))
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
    let _createFieldsApiArray = [];

    if (_fieldXmlObj && Object.keys(_fieldXmlObj).length > 0) {
        for (let listName in _fieldXmlObj) {
            //NOTE API CALL HERE HAS BEEN DESIGNED TO TAKE AN ARRAY OF FIELDS FOR EACH LIST TO REDUCE API CALLS
            _createFieldsApiArray.push(this.commonApiService.addListFields(listName, _fieldXmlObj[listName], this.utilsService.hostWeb))
        }
    }

    return _createFieldsApiArray

}

constructFieldsToUpdatedArray(fieldsSetRequired, fieldsWrongType){
    let _updateFieldApiArray:Array<any> = []
    
    if (fieldsSetRequired && fieldsSetRequired.length > 0) {
        fieldsSetRequired.forEach((element:IFieldUpdateReportResult) => {
            _updateFieldApiArray.push(this.commonApiService.updateField(element.fieldName, element.listName, this.utilsService.hostWeb, element.oldSchema, element.newSchema))
        })
    }

    if (fieldsWrongType && fieldsWrongType.length > 0) {
        fieldsWrongType.forEach((element:IFieldUpdateReportResult) => {
            _updateFieldApiArray.push(this.commonApiService.updateField(element.fieldName, element.listName, this.utilsService.hostWeb, element.oldSchema, element.newSchema))
        })
    }

    return _updateFieldApiArray
}

constructGetDataArray(){
    let _listArry = []
    let _listApiArry = [];

    try {
        _listArry = [this.utilsService.financeAppResourceData, 
                    this.utilsService.financeAppMaterialData,
                    this.utilsService.financeAppTotalsData]
        _listArry.forEach(listName => {
            _listApiArry.push(this.commonApiService.getItems(listName, this.utilsService.hostWeb))
        })
    } catch (e) {
        this.logService.log(e, this.utilsService.errorStatus, false)
    }

    return _listApiArry    
}


// //NOT SURE IF THIS IS STILL NEEDED
// processListData(data:Array<Object>, listName: string):Observable<any> {
//     console.error(data);
//     this.logService.log(`Process List Data Function called for list: ${listName}`, this.utilsService.infoStatus, false);

//     let listData$ = new Observable((observer:Observer<any>) => {

//         let _resultsArray = []
        
//         let listSpecArray = this.listService.getListSpec(listName);
//         //need to pull out the field names from list spec and put them into array
//         let nameArray = []
//         listSpecArray.forEach(element => {
//             nameArray.push(element.Name)
//         })

//         if (data.length>0) {

//             data.forEach(item => {
//                 let _item = {}
//                 console.error(item);
//                 //filter out superlous item data and create an object of just the required fields
//                 for (let key in item) {
//                     let indexValue = nameArray.findIndex((element) => {
//                         return element == key
//                     })
//                     if (indexValue >= 0){
//                         console.error(key);
//                         _item[key] = item[key]
//                     }
//                 }
//                 //push the object into the results array if not empty
//                 if (Object.keys(_item).length !== 0) {
//                     _resultsArray.push(_item);
//                 }
                
//             })

//         }
//         //MOVE THIS FUNCTION AND ASSOCIATED AYSNC CALLS INTO CONTEXT SERVICE
//         console.error(_resultsArray);
//         observer.next({
//             functionCall: 'processListData',
//             data: _resultsArray
//         })

//         observer.complete()
//     })
//     return listData$


// }

// processSettingsData(data){
//     let settings$ = new Observable((observer:Observer<any>) => {
//         if (typeof(data) === 'string') {
//             JSON.parse(data)
//         }
//         if (typeof(data) === 'object') {
//             try {
//                 this.settingsService.processSettingsData(data)
//                 observer.next({
//                     functionCall: 'processSettingsData',
//                     result: true
//                 })
//                 //need to include this second data submission to trigger the log list checks
//                 observer.next({
//                     functionCall: 'processSettingsData2',
//                     result: true
//                 })
//             } catch(e) {
//                 this.logService.log(e, this.utilsService.errorStatus, false);
//                 observer.next({
//                     functionCall: 'processSettingsData',
//                     result: false
//                 })
//             }

//         } else {
//             observer.next({
//                 functionCall: 'processSettingsData',
//                 result: false
//             })
//         }
//         observer.complete()
        
//     })

//     return settings$
// }

/////////////////////////////
// 6. Init application

// using settings list?
// initApp2():Observable<any>{

// let init$ = new Observable((observer:Observer<any>) => {
//     Observable
//     // this property is set in code and is only intended to be used for development/debugging
//     .of(this.settingsService.useSettingsList)
//     .mergeMap( data =>
//         // are we using settings list?
//         data
//         //if yes check if settings list exist?
//         ? this.commonApiService.listExists(this.utilsService.financeAppSettingsData, this.utilsService.appWeb)
//         // if no, then use app default values, let data pass though
//         : this.placeholderObservable(data)
//     )
//     .mergeMap( data => 
//         (typeof(data) == 'object' && 
//         data.hasOwnProperty('listName') &&
//         data.hasOwnProperty('apiCall') &&
//         data.hasOwnProperty('result') &&
//         data['apiCall'] == this.utilsService.apiCallListExists && 
//         data['listName'] == this.utilsService.financeAppSettingsData && 
//         data['result'] == false)
//         //if settings doesn't exists create
//         ? this.commonApiService.createList(this.utilsService.financeAppSettingsData, this.utilsService.appWeb)
//         : this.placeholderObservable(data)
//     )
//     .mergeMap( data => 
//         (typeof(data) == 'object' && 
//         data.hasOwnProperty('listName') &&
//         data.hasOwnProperty('apiCall') &&
//         data.hasOwnProperty('result') &&
//         data['apiCall'] == this.utilsService.apiCallCreateList && 
//         data['result'] == true)
//         //if settings doesn't exists create
//         ? this.commonApiService.addItem(this.utilsService.financeAppSettingsData, this.utilsService.appWeb, this.settingsService.settingsValuesArray())
//         : this.placeholderObservable(data)
//     )    
//     .mergeMap( data => 
//         (
//         (typeof(data) == 'object' && 
//         data.hasOwnProperty('listName') &&
//         data.hasOwnProperty('apiCall') &&
//         data.hasOwnProperty('result') &&
//         data['apiCall'] == this.utilsService.apiCallListExists &&
//         data['listName'] == this.utilsService.financeAppSettingsData &&        
//         data['result'] == true)

//         ||

//         (typeof(data) == 'object' && 
//         data.hasOwnProperty('listName') &&
//         data.hasOwnProperty('apiCall') &&
//         data.hasOwnProperty('result') &&
//         data['apiCall'] == this.utilsService.apiCallAddItem && 
//         data['result'] == true)
//         )
//         //if settings exists get data
//         ? this.commonApiService.getItem(this.utilsService.financeAppSettingsData, 
//                                         this.utilsService.generateXmlGetItemById(1),
//                                         this.utilsService.appWeb)
//         : this.placeholderObservable(data)
//     )
//     .mergeMap( data => 
//         (typeof(data) == 'object' && 
//         data.hasOwnProperty('listName') &&
//         data.hasOwnProperty('apiCall') &&
//         data.hasOwnProperty('result') &&
//         data.hasOwnProperty('data') &&
//         data['apiCall'] == this.utilsService.apiCallGetItem && 
//         data['result'] == true)    
//         //need to process settings data, add results to settings service
//         ? this.processSettingsData(data.data[0])
//         : this.placeholderObservable(data)
//     )
//     .mergeMap( data => 
//         // if settings list exists or create successful and sharepoint mode then get application list data
//         (
//         (typeof(data) === 'object' &&
//         data.hasOwnProperty('functionCall') &&
//         data.hasOwnProperty('result') &&
//         data['functionCall'] == 'processSettingsData' &&
//         data['result'] == true
//         )
//         &&
//         this.settingsService.sharePointMode
//         )
//         ? Observable.from(this.constructGetDataArray())
//             .mergeAll()
//         : this.placeholderObservable(data)
//     )
//     .mergeMap( data => 
//         // process list data
//         (typeof(data) === 'object' &&
//         data.hasOwnProperty('listName') &&
//         data.hasOwnProperty('apiCall') &&
//         data.hasOwnProperty('result') &&        
//         data['apiCall'] == this.utilsService.apiCallGetItems && 
//         data['result'] == true)
//         ? this.processListData(data['data'], data['listName'])
//         : this.placeholderObservable(data)
//     )
//     .mergeMap( data => 
//         //if settings list and using logging?
//         (
//         (typeof(data) === 'object' &&
//         data.hasOwnProperty('functionCall') &&
//         data.hasOwnProperty('result') &&
//         data['functionCall'] == 'processSettingsData2' &&
//         data['result'] == true)
//         &&
//         // this property is set in code and is only intended to be used for development/debugging
//         this.settingsService.useLoggingList
//         )
//         //if yes check if logs list exist?
//         ? this.commonApiService.listExists(this.utilsService.financeAppLogsData, this.utilsService.appWeb)
//         // if no, then use app default values, let data pass though
//         : this.placeholderObservable(data)
//     )
//     .mergeMap( data => 
//         (typeof(data) == 'object' && 
//         data.hasOwnProperty('listName') &&
//         data.hasOwnProperty('apiCall') &&
//         data.hasOwnProperty('result') &&
//         data['apiCall'] == this.utilsService.apiCallListExists &&
//         data['listName'] == this.utilsService.financeAppLogsData && 
//         data['result'] == false)
//         //if logging doesn't exists create
//         ? this.commonApiService.createList(this.utilsService.financeAppLogsData, this.utilsService.appWeb)
//         : this.placeholderObservable(data)
//     )
//     ////SUBSCRIBE TO THIS VIA THE APP COMPONENT INSTEAD OF HERE
//     /// USE RETURNED PROCESSS LIST DATA TO UPDATE THE DATA CONTEXT SERVICE

// })

// return init$
// }

getLogs():Observable<any>{
    if (this.settingsService.useLoggingList 
        //TO BE ADDED
        //&& this.settingsService.loggingListReady
        && (this.settingsService.persist)) {
                
        return this.commonApiService.getItems(this.utilsService.financeAppLogsData, this.utilsService.appWeb, 
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

    } else {
        this.logService.log('persist logs set to false, returning cached logs', this.utilsService.infoStatus, true)
        return this.placeholderObservable(this.logService.logs)
    }
}

testObservable(){
    let testObservable$ = new Observable((observer:Observer<any>) => {
        console.error('TEST OBSERVABLE')
        observer.next('TEST OBSERVALBE NEXT CALL')
        observer.complete()
    })
    return testObservable$
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
            data['result'] == true)
            ? this.logService.processItems(data['data'])
            :this.placeholderObservable(data)
        )


    return saveLogs$

}

/////////////////////////////
// Init application

// using settings list?
initApp():Observable<any>{
this.logService.log('initialising app', this.utilsService.infoStatus, true);
let init$ = 
    //NEED TO GET USER PERMISSIONS FIRST
    // this property is set in code and is only intended to be used for development/debugging
    this.checkUseSettingsList()
    .mergeMap( data =>
        // are we using settings list?
        this.settingsListOutcome(data)
        ? this.commonApiService.listExists(this.utilsService.financeAppSettingsData, this.utilsService.appWeb)
        // if no, then use app default values, let data pass though
        : this.placeholderObservable(data)
    )
    .mergeMap( data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallListExists && 
        data['listName'] == this.utilsService.financeAppSettingsData && 
        data['result'] == false)
        //if settings doesn't exists create
        ? this.commonApiService.createList(this.utilsService.financeAppSettingsData, this.utilsService.appWeb)
        : this.placeholderObservable(data)
    )
    .mergeMap( data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallCreateList && 
        data['result'] == true)
        //if settings doesn't exists create
        ? this.commonApiService.addItem(this.utilsService.financeAppSettingsData, this.utilsService.appWeb, this.settingsService.settingsValuesArray())
        : this.placeholderObservable(data)
    )    
    .mergeMap( data => 
        (
        (typeof(data) === 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallListExists &&
        data['listName'] == this.utilsService.financeAppSettingsData &&        
        data['result'] == true)

        ||

        (typeof(data) === 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallAddItem && 
        data['result'] == true)
        )

        //if settings exists get data
        ? this.commonApiService.getItem(this.utilsService.financeAppSettingsData, 
                                        this.utilsService.generateXmlGetItemById(1),
                                        this.utilsService.appWeb)
        : this.placeholderObservable(data)
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
    .mergeMap( data => 
        //if settings list and using logging?
        (
        (typeof(data) === 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('result') &&
        data['functionCall'] == 'processSettingsData' &&
        data['result'] == true)
        &&
        // this property is set in code and is only intended to be used for development/debugging
        this.settingsService.useLoggingList
        )
        //if yes check if logs list exist?
        ? this.commonApiService.listExists(this.utilsService.financeAppLogsData, this.utilsService.appWeb)
        // if no, then use app default values, let data pass though
        : this.placeholderObservable(data)
    )
    .mergeMap( data => 
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallListExists &&
        data['listName'] == this.utilsService.financeAppLogsData && 
        data['result'] == false)
        //if logging doesn't exists create
        ? this.commonApiService.createList(this.utilsService.financeAppLogsData, this.utilsService.appWeb)
        : this.placeholderObservable(data)
    )
    .mergeMap(data => 
        this.isLogListReady(data)
        ? this.settingsService.logListReady(true)
        : this.placeholderObservable(data)
    
    )
    .mergeMap(data =>
        //log list exists or create log list succeeds
        this.logListReadyCallResult(data)
        //save queued logs to persistant storage
        ? this.saveLogsBatch()
        : this.placeholderObservable(data)
    )













    // .mergeMap(data =>
    //     //log list exists or create log list succeeds
    //     (typeof(data) === 'object' &&
    //     data.hasOwnProperty('functionCall') &&
    //     data.hasOwnProperty('result') &&
    //     data['functionCall'] == ' logListReady' &&
    //     data['result'] == true)
    //     //save queued logs to persistant storage
    //     ? this.logService.determinePersistLogs()
    //     : this.placeholderObservable(data)
    // )
    // .mergeMap(data => 
    //     (typeof(data) === 'object' &&
    //     data.hasOwnProperty('functionCall') &&
    //     data.hasOwnProperty('result') &&
    //     data['functionCall'] === 'persistLogs' &&
    //     data['result'] === true) 
    //     ? this.commonApiService.addItems(this.utilsService.financeAppLogsData, this.utilsService.appWeb, this.logService.prepLogs(this.settingsService.verbose))
    //     : Observable.of(data)
    // )
    //need to decide if logs should be cleared and re downloaded or if these 2 steps should be skipped
    // .mergeMap(data => 
    //     (typeof(data) == 'object' && 
    //     data.hasOwnProperty('listName') &&
    //     data.hasOwnProperty('apiCall') &&
    //     data.hasOwnProperty('result') &&
    //     data['apiCall'] == this.utilsService.apiCallAddItems &&
    //     data['listName'] == this.utilsService.financeAppLogsData && 
    //     data['result'] == true)
    //     ? this.logService.clearLogs(this.settingsService.loggingType)
    //     : Observable.of(data)
    // )
    // .mergeMap(data => 
    //     (typeof(data) == 'object' &&
    //     data.hasOwnProperty('functionCall') &&
    //     data.hasOwnProperty('result') &&
    //     data['functionCall'] == 'clearLogs' &&
    //     data['result'] == 'complete'
    //     )
    //     ? this.commonApiService.getItems(this.utilsService.financeAppLogsData, this.utilsService.appWeb)
    //     : Observable.of(data)
    // )    
    // .mergeMap(data => 
    //     (

    //     //once log data has been saved to list get application data
    //     (typeof(data) == 'object' && 
    //     data.hasOwnProperty('listName') &&
    //     data.hasOwnProperty('apiCall') &&
    //     data.hasOwnProperty('result') &&
    //     data['apiCall'] == this.utilsService.apiCallGetItems && 
    //     data['listName'] == this.utilsService.financeAppLogsData &&          
    //     data['result'] == true)

    //     ||

    //     //or if not using logging
    //     (typeof(data) === 'object' &&
    //     data.hasOwnProperty('functionCall') &&
    //     data.hasOwnProperty('result') &&            
    //     data['result'] === 'none')
        
    //     )
    //     //trigger get application data from context service
    //     ? this.dataContextService.getApiData(true, true, true)
    //     : this.placeholderObservable(data)
    // )


return init$
}

logListReadyCallResult(data){
   let outcome = (typeof(data) === 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('result') &&
        data['functionCall'] === 'logListReady' &&
        data['result'] === true)

    return outcome
}
settingsListOutcome (data) : boolean{
    let outcome = (typeof(data) === 'object' &&
        data.hasOwnProperty('functionCall') &&
        data.hasOwnProperty('value') &&
        data['functionCall'] === 'checkUseSettingsList' &&
        data['value'] === true)
    
     return outcome
}

isLogListReady(data): boolean{
    let outcome =         (
        (typeof(data) == 'object' && 
        data.hasOwnProperty('listName') &&
        data.hasOwnProperty('apiCall') &&
        data.hasOwnProperty('result') &&
        data['apiCall'] == this.utilsService.apiCallListExists &&
        data['listName'] == this.utilsService.financeAppLogsData &&        
        data['result'] == true)

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


checkUseSettingsList():Observable<any>{
    let setting$ = new Observable((observer:Observer<any>) => {
        let result = this.settingsService.useSettingsList
        this.logService.log(`use settings list: ${result}`, this.utilsService.infoStatus, true)

        observer.next({
            functionCall: 'checkUseSettingsList',
            value: result
        })

        observer.complete()
    })

    return setting$
}

checkUseLoggingList():boolean{
    let result = <boolean>this.settingsService.useLoggingList
    this.logService.log(`use logging list: ${result}`, this.utilsService.infoStatus, false)
    console.error('use settings list', result);
    
    return result
}

processSettingsData(data){
    console.error(data);
    if (data.hasOwnProperty('data') &&
        Array.isArray(data['data']) &&
        data['data'].length === 1) {
            data = data['data'][0]
    } else {
        this.logService.log(`unable to extract settings data from api call`, this.utilsService.errorStatus, false);
    }
    console.error(data);

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


loadAppData(Resource:boolean,Material:boolean,Total:boolean):Observable<any>{
    let getData$ = Observable
        .merge(...this.loadAppDataLists(Resource, Material, Total))
        .mergeMap(data =>
            // process list data
            (typeof(data) === 'object' &&
            data.hasOwnProperty('listName') &&
            data.hasOwnProperty('apiCall') &&
            data.hasOwnProperty('result') &&        
            data['apiCall'] == this.utilsService.apiCallGetItems && 
            data['result'] == true)
            ? this.dataContextService.processListData(data['data'], data['listName'])
            : this.placeholderObservable(data)
        )

    return getData$
}

//get required lists
loadAppDataLists(Resource:boolean,Material:boolean,Total:boolean):Array<Observable<any>>{
    let _observableArray = []

    if (Resource) _observableArray.push(this.commonApiService.getItems(
                                            this.utilsService.financeAppResourceData, 
                                            this.utilsService.hostWeb,
                                            this.utilsService.includeFields(
                                                this.listService.getArrayFieldNames(
                                                    this.utilsService.financeAppResourceData)),
                                            this.utilsService.genCamlQuery()
                                            ))

    if (Material) _observableArray.push(this.commonApiService.getItems(
                                            this.utilsService.financeAppMaterialData, 
                                            this.utilsService.hostWeb,
                                            this.utilsService.includeFields(
                                                this.listService.getArrayFieldNames(
                                                    this.utilsService.financeAppMaterialData)),
                                            this.utilsService.genCamlQuery()
                                            ))

    if (Total) _observableArray.push(this.commonApiService.getItems(
                                            this.utilsService.financeAppTotalsData, 
                                            this.utilsService.hostWeb,
                                            this.utilsService.includeFields(
                                                this.listService.getArrayFieldNames(
                                                    this.utilsService.financeAppTotalsData)),
                                            this.utilsService.genCamlQuery()
                                            ))
    return _observableArray
}


saveAppData(){
    this.logService.log('submit data to api function called', this.utilsService.infoStatus, false);


        let submitData$ = Observable
                .merge(...this.prepDataForApi([
                        {data: this.dataContextService.resourceData, listName: this.utilsService.financeAppResourceData},
                        {data: this.dataContextService.materialData, listName: this.utilsService.financeAppMaterialData},
                        {data: this.dataContextService.totalsData, listName: this.utilsService.financeAppTotalsData}])
                )
                .mergeMap(data =>
                (
                (typeof(data) === 'object' &&
                data.hasOwnProperty('listName') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('apiCall') &&
                data['apiCall'] === this.utilsService.apiCallAddItem &&
                data['result'] == true)

                ||

                (typeof(data) === 'object' &&
                data.hasOwnProperty('listName') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('apiCall') &&
                data['apiCall'] === this.utilsService.apiCallDeleteItem &&
                data['result'] === true)
                
                ||

                (typeof(data) === 'object' &&
                data.hasOwnProperty('listName') &&
                data.hasOwnProperty('result') &&
                data.hasOwnProperty('apiCall') &&
                data['apiCall'] === this.utilsService.apiCallUpdateItem &&
                data['result'] == true)
                )
                ? this.dataContextService
                    .updateStateAfterApiCall(data['listName'], data['itemId'], data['apiCall'])
                : this.placeholderObservable(data)
                )
    return submitData$
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
                        let fieldArray = this.createFieldArray(_item);
                        _rsltArray.push(this.commonApiService.addItem(listName, this.utilsService.hostWeb, fieldArray))

                    } else if (_item.hasOwnProperty('State') && _item['State'] == this.utilsService.deleteState) {
                        _rsltArray.push(this.commonApiService.deleteItem(listName, _item['ItemId'], this.utilsService.hostWeb))

                    } else if (_item.hasOwnProperty('State') && _item['State'] == this.utilsService.updateState) {
                        let fieldsArray = this.createFieldArray(_item);
                        _rsltArray.push(this.commonApiService.updateItem(listName, this.utilsService.hostWeb, _item['ItemId'], fieldsArray))

                    } else if (_item.hasOwnProperty('State') && _item['State'] == this.utilsService.inertState) {
                        this.logService.log(`item flagged as intert, saving item not required`, this.utilsService.infoStatus, true)
                    }
                })
            }
        })
    }
    return _rsltArray
}

createFieldArray(item){
    //create fields array
    let _fieldArray:Array<IItemPropertyModel> = []
    for (let property in item) {
        if (item.hasOwnProperty(property) &&
            //exclude internal properties, these are not in the lists
            property !== 'State' &&
            property !== 'ListName' &&
            property !== 'Highlights' &&
            //don't want to include the Property<number> item properties that are uses as placeholders for text
            property.indexOf('Placeholder') == -1
            ) {
            _fieldArray.push({
                fieldName: property,
                fieldValue: item[property]
            })
        }

    }
    return _fieldArray   
}

//end service
}

//DEPRECATED
    // //4. Check Fields Exist
    // listExistsRsltsArry.forEach(element => {
    //     let listName = element.listName
    //     let listValue = element.value
    //     // if list does exist then we need to check if each field exists
    //     if (listValue === true) {
    //         this.provisionerStream.next('checking if required fields exist for ' + element.listName)
    //         this.logService.log('checking if required fields exist for ' + element.listName, this.utilsService.infoStatus, true)

    //         let listSpec: Array<IFieldSPecModel>
    //         listSpec = this.listService.getListSpec(element.listName);

    //         if (!Array.isArray(listSpec)) {
    //             this.provisionerStream.next('error obtaining listSpec for list: ' + element.listName)
    //         }


    //         if (Array.isArray(listSpec)) {
    //             listSpec.forEach(element => {
    //                 let fieldName = element.Name;
    //                 if (fieldName) {
    //                     this.commonApiService.fieldExists(  listName,
    //                                                         fieldName,
    //                                                         this.utilsService.hostWeb)
    //                     .subscribe(
    //                         data => {
    //                             if (typeof(data) === 'object' && 
    //                                 data.fieldName && 
    //                                 data.value) {
    //                                     this.provisionerStream.next('Field ' + data.fieldName + ' exists: ' + data.value)   
    //                                     fieldExistsRsltsArray.push(data);
    //                             }
    //                             this.provisionerStream.next(data);

    //                         },
    //                         err => {
    //                             this.logService.log(err, this.utilsService.errorStatus, false);
    //                             this.provisionerStream.next(`unable to check if field ${fieldName} exists`)
    //                             fieldsFailedToCheck.push(fieldName)
    //                             //this.provisionerStream.error(err)
    //                         },
    //                         () => {
    //                             this.provisionerStream.next('exiting check Resource list exists function call')
    //                         }
    //                     )
    //                 }
    //             // end listspec.foreach
    //             })
    //         }
    //     }
    // // end listrsltsarry.foreach
    // })

    // //5. Create Fields
    // fieldExistsRsltsArray.forEach(element => {
    //     if (element.value = false) {
    //         //to be implemented
    //         this.logService.log('field' + element.fieldName + 'does not exist on list: ' + element.listName, this.utilsService.errorStatus, false);
    //         this.provisionerStream.next('exiting check Resource list exists function call')
    //     }
    // });

    // //6. Get Field Definitions
    // // for those fields that do exist on list get schema xml
   

    // fieldExistsRsltsArray.forEach(element => {
    //     //to be implemented
    //     let fieldName = element.fieldName;
    //     let listName = element.listName
        
    //     if (element.value === true &&
    //         fieldName &&
    //         listName) {

    //             this.commonApiService.readField(fieldName,
    //                                     listName,
    //                                     this.utilsService.hostWeb)

    //             .subscribe(
    //                 data => {
    //                     if (typeof(data) === 'object' && 
    //                         data.fieldName && 
    //                         data.schemaXml) {
    //                             this.provisionerStream.next('field: ' + data.fieldName + ' on list: ' + data.listName + ' has schemaXml: ' + data.SchemaXml);
    //                             fieldDefinitionsArry.push(data);
    //                     }
    //                     this.provisionerStream.next(data);

    //                 },
    //                 err => {
    //                     this.logService.log(err, this.utilsService.errorStatus, false);
    //                     this.provisionerStream.next(`unable to get schemal xml for field: ${fieldName} in list: ${listName}`)
    //                     fieldsFailedToGetXml.push(fieldName)
    //                     //this.provisionerStream.error(err)
    //                 },
    //                 () => {
    //                     this.provisionerStream.next('exiting check Resource list exists function call')
    //                 }
    //         )                                                    
    //     }
    // })
    // //8. Update Fields were required






    /*
//parsing xml
getXml () {
    let schemaXmlData:string
    let listName = this.utilsService.financeAppResourceData
    let listFailedGetXml: Array<any>;
    //get list schema
    this.commonApiService.getListXml(listName, this.utilsService.hostWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                    data.schemaXml) {
                    this.provisionerStream.next('List ' + data.schemalXml)   
                    schemaXmlData = data.Schemxml
                }
                this.provisionerStream.next(data);
                this.processXml(schemaXmlData)
            },
            err => {
                this.logService.log(err, this.utilsService.errorStatus, false);
                this.provisionerStream.next(`unable to get schemaXml list ${listName}`)
                try {
                    listFailedGetXml.push(listName);
                } catch (e) {
                    this.logService.log(e, this.utilsService.errorStatus, false);
                    return
                }

                
            },
            () => {
                this.provisionerStream.next('exiting check Resource list exists function call')
            }
            
        )
}




processXml(xml) {
    let listName = this.utilsService.financeAppResourceData
    
    let fieldsThatDontExist: Array<IFieldThatDoesntExist> = [];
    let fieldsSetRequired: Array<IFieldSetRequired> = [];
    let fieldWrongType: Array<IFieldWrongType> = [];
    let listDefintion: Array<any>;

    //parse http response into xml
    let xmlDoc = this.utilsService.parseXml(xmlData);
    //convert xml to Json for massive performance imporvements
    let jsonFldArry = this.utilsService.xmlToJson(xmlDoc);
    //isolate just the array of fields
    jsonFldArry = jsonFldArry['d:SchemaXml']['Fields']['Field']

    //get a copy of the list defintion to compare agains
    listDefintion = this.listService.getListSpec(listName);
    
    //previous methods tried iterating through the list definition first and the nesting iteratively through the fields.  
    // This method takes a fraction of the time
    //iterate through the fields
    for (let i in jsonFldArry) {
        let _element = jsonFldArry[i]['@attributes'];
        //check if any fields set to required.  They shouldn't otherwise it may prevent list data from saving to it.
        if (_element.Required == 'TRUE') {
                console.log('FIELD IS IDENTIFED AS REQUIRED')
                //push into fieldsSetRequired Array
                fieldsSetRequired.push({
                    listName: listName,
                    fieldName: _element.Name
                });           
        }

        //now see if field matches one on the field spec
        let _i = listDefintion.findIndex((element) => {
           return element.Name === _element.Name
        })
        if (_i !== -1) {
            //Field found
            //check its of correct type. If not of correct type then the app may fail to save data
            if (_element.Type !== listDefintion[_i].Type) {
                console.log('Type does not match')
                fieldWrongType.push({
                    listName: listName,
                    fieldName: _element.Name,
                    oldSchema: 'Type: "' + _element.Type + '"',
                    newSchema: 'Type: "' + listDefintion[_i].Type + '"'
                })                 
            }
            //remove from index for performance gains on the loop as well as stricking off correctly found fields
            //any that are left in the array after the loop will imply that they don't exist on the list and will need to be created.
            listDefintion.splice(_i,1)
        }
     
    }

    console.log(listDefintion.length);
    console.log('FIELDS THAT DONT EXIST')
    console.log(listDefintion)
    console.log('FIELDS OF WRONG TYPE')
    console.log(fieldWrongType)
    console.log('FIELDS SET REQUIRED')
    console.log(fieldsSetRequired)
}

        // if (_element.Name == element.Name){
        //     console.log('Field Exists')
        //     if (_element.Type !== element.Type) {
        //         console.log('Type does not match')
        //         fieldWrongType.push({
        //             listName: listName,
        //             fieldName: _element.Name,
        //             oldSchema: 'Type: "' + _element.Type + '"',
        //             newSchema: 'Type: "' + element.Type + '"'
        //         })                    
        //     }

        //     if (_element.Required == 'TRUE') {
        //         //push into fieldsSetRequired Array
        //         fieldsSetRequired.push({
        //             listName: listName,
        //             fieldName: _element.Name
        //         })                    
        //     }
        // } else {
        //     console.log('Field Does Not Exist')
        //     fieldsThatDontExist.push({
        //         listName: listName,
        //         fieldName: element.Name
        //     })
        // }
    //}

    


    console.log(xmlDoc.getElementsByTagName("Fields"));
        
    
    //get field Array from xml document
    let fldArry = xmlDoc.getElementsByTagName("Fields")[0].childNodes
    console.log(fldArry.length)

    
    
    let listDefintion = this.listService.getListSpec(listName);

    //iterate through each Field in the XML to check if any are set to required
    for (let i = 0; i < fldArry.length; i++) { 
        //iterate through each attribute
        for (let v = 0; v < fldArry[i].attributes.length; v++) {
            if (fldArry[i].attributes[v].name == 'Required'){
                console.log(fldArry[i].attributes[v].name + ' : ' + fldArry[i].attributes[v].value)    
            }
            console.log(fldArry[i].attributes[v].name == 'Required')
            // Check if set to required
            if (fldArry[i].attributes[v].name == 'Required' && fldArry[i].attributes[v].value == 'TRUE') {
                let _fieldName;
                //get field name for this node
                for (let w = 0; w < fldArry[i].attributes.length; w++) {
                    if (fldArry[i].attributes[w].name == 'Name') {
                        _fieldName = fldArry[i].attributes[w].value
                    }
                }

                //push into fieldsSetRequired Array
                fieldsSetRequired.push({
                    listName: listName,
                    fieldName: _fieldName
                })
            }
        }
    }

    //now iterate through each field in the field spec and check if exists in xml document
    listDefintion.forEach(element => {
        let _fildName = element.Name
        let _elmtType = element.Type
        //iterate through each Field
        for (let i = 0; i < fldArry.length; i++) { 
            //iterate through each attribute
            for (let v = 0; v < fldArry[i].attributes.length; v++) {
                //check if fieldname exists in xml document
                console.log(_fildName);
                console.log(fldArry[i].attributes[v].value);
                // console.log(fldArry[i].attributes[v].name == 'Name')
                // console.log(fldArry[i].attributes[v].value == _fildName)
                
                if (fldArry[i].attributes[v].name =='Name' 
                    && fldArry[i].attributes[v].value == _fildName) {
                        console.log('matched field spec to field name - FIELD EXISTS')

                        // Now check if field has correct Type
                        if (fldArry[i].attributes[v].name == 'Type' &&
                            fldArry[i].attributes[v].value !== _elmtType) {
                            //console.log(fldArry[i].attributes[v].value)
                            fieldWrongType.push({
                                listName: listName,
                                fieldName: _fildName,
                                oldSchema: 'Type: "' + fldArry[i].attributes[v].value + '"',
                                newSchema: 'Type: "' + _elmtType + '"'
                            })
                            // console.log(fldArry[i].attributes[v].value)
                            // console.log(typeof(this.utilsService.serializeXml(fldArry[i])));
                        }                        
                } else {
                    console.log('FIELD DOES NOT EXIST')
                    fieldsThatDontExist.push({
                        listName: listName,
                        fieldName: _fildName
                    })
                }
            }
        }    

    })
   */