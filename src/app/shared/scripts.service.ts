import { Injectable } from '@angular/core'
import { LogService } from './log.service'

import { UtilsService } from './utils.service'
import { CommonApiService } from './api-common.service'
import { UiStateService } from './ui-state.service'
import { ListService } from './list.service'
import { HealthReportService } from './health-report.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import { IFieldExists,
        IFieldThatDoesntExist,
        IFieldUpdate,
        IFieldUpdateResult,
        IListExists,
        ISchemaFieldResult } from '../model/data-validation.model'
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
    private provisionerStream: Subject<any> = new Subject();
    private healthReportStream: Subject<any> = new Subject();
    private actionHealthReportStream: Subject<any> = new Subject();
    private settingsStream: Subject<any> = new Subject();
    private permissionsStream: Subject<any> = new Subject();    
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
                private healthReportService: HealthReportService){
        this.init()
    }

    init(){
        this.logs = [];
        this.manageWebPermissions = false;

    }

    getProvisionerDataStream(): Observable<any> {
        return this.provisionerStream.asObservable()
    }
    getHealthReportDataStream(): Observable<any> {
        return this.healthReportStream.asObservable()
    }    
    getActionHealthReportDataStream(): Observable<any> {
        return this.actionHealthReportStream.asObservable()
    }  
    getSettingsStream(): Observable<any> {
        return this.settingsStream.asObservable()
    }
    getPermissionsStream(): Observable<any> {
        return this.permissionsStream.asObservable()
    }    


/*
    Contents:

    1. get permissions
    2. Health Report
    3. Action Health report
    4. Provisioner
    5. Settings Check
*/


///////////////////////////////////////////////////////////////////////////////////////
//Check permissions
getPermissions(){
        this.commonApiService.getPermissions(this.utilsService.hostWeb, 
                                        this.utilsService.financeAppResourceData)
        .subscribe(
            data => {
                this.logService.log('Observer.next is array:  ' + String(Array.isArray(data)), this.utilsService.infoStatus, true);
                if (Array.isArray(data)) {
                    console.log('receiving permissions results array')
                    data.forEach(element => {
                        this.logService.log(element, this.utilsService.infoStatus, true);
                        this.permissionsStream.next(element);
                        switch (element.permissionType) {
                        
                        case this.utilsService.manageWeb:
                            this.logService.log('user has ManageWebPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
                            try { 
                                this.uiStateService.updateUiState(this.utilsService.manageWeb, element.value)
                            } catch (e) {
                                this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                            }
                            
                            break;
                        case this.utilsService.manageList:
                            this.logService.log('user has ManageListPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
                            try {
                                this.uiStateService.updateUiState(this.utilsService.manageList, element.value)
                            } catch (e) {
                                this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                            }
                            
                            break;
                        case this.utilsService.viewList:
                            this.logService.log('user has ViewListPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
                            try {
                                this.uiStateService.updateUiState(this.utilsService.viewList, element.value)
                            } catch (e) {
                                this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                            }                                    

                            break;
                        case this.utilsService.addListItems:
                            this.logService.log('user has AddListItemsPermissions: ' + element.value, this.utilsService.infoStatus, true)
                            
                            try {
                                this.uiStateService.updateUiState(this.utilsService.addListItems, element.value)
                            } catch (e) {
                                this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                            }

                            break;
                        default:
                            this.logService.log('unable to determine permissions type', this.utilsService.errorStatus, false)
                            break;
                        }
                    })
                } else {
                    this.logService.log(data, this.utilsService.infoStatus, true);

                }
            },
            err => {
                this.logService.log(err, this.utilsService.errorStatus, false);
                try {
                    this.uiStateService.updateUiState(this.utilsService.message, 'error unable to check user permissions')
                    this.uiStateService.updateUiState(this.utilsService.uiState, this.utilsService.redStatus)
                    this.permissionsStream.error('error unable to check user permissions');
                } catch (e) {
                    this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                }
            },
            () => {
                this.logService.log('get permissions observer has completed', this.utilsService.infoStatus, true);
                this.permissionsStream.complete();
            }
        );
    }

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
        permissionsResults: {
            permission: '',
            result: false
        },
        listExistsResults: [],
        listsFailedToCheck: [],
        listXmlData: [],
        listFailedGetXml: [],
        missingLists: [],
        missingFields: [],
        fieldsWrongtype: [],
        fieldsRequired: []
    }


    let fieldExistsRsltsArray: Array<IFieldExists>
    let fieldsFailedToCheck: Array<string>
    
    let fieldDefinitionsArry: Array<any>
    let fieldsFailedToGetXml: Array<any>

    fieldsFailedToCheck = [];
    fieldExistsRsltsArray = [];
    fieldDefinitionsArry = [];
    fieldsFailedToGetXml = [];

    this.checkPermissionsHealthReport();

}

private checkPermissionsHealthReport (){
    let viewPermissions: Boolean
    //1.check permissions
    viewPermissions = this.uiStateService.getUiState('viewList');

    if (!viewPermissions) {
        this.healthReportStream.next('user does not have permissions to run the health report')
        this.healthReportStream.complete()
        this._healthReport.permissionsResults = {
            permission: 'viewList',
            result: false
        }
        return;
    } else {
        this.healthReportStream.next('user has permissions to view lists')
        this._healthReport.permissionsResults = {
            permission: 'viewList',
            result: true
        }
        this.checkListExistsHealthReport()
    }
}


private checkListExistsHealthReport() {
    //2.check Lists exist
    let listArry:Array<any>
   
    listArry = [this.utilsService.financeAppResourceData, 
                this.utilsService.financeAppMaterialData,
                this.utilsService.financeAppTotalsData]
    
    listArry.forEach(listName => {
        this.commonApiService.listExists(listName, this.utilsService.hostWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                    data.listName && 
                    data.value) {
                    this.healthReportStream.next('List ' + data.listName + ' exists: ' + data.value)   
                    if (data.value == true) {
                        //list exists so check fields
                        this.getFieldsHealthReport(data)
                    } else {
                        //check settings of app to see if script should auto create lists
                        //this.createList(data)
                    }
                    // add results to array
                    this._healthReport.listExistsResults.push(data)
                    
                }
                this.healthReportStream.next(data);

            },
            err => {
                this.logService.log(err, this.utilsService.errorStatus, false);
                this.healthReportStream.next(`unable to check if list ${listName} exists`)
                this._healthReport.listsFailedToCheck.push(listName);
                //this.provisionerStream.error(err)
            },
            () => {
                //update health report
                this.healthReportService.healthReport = this._healthReport;                
                this.healthReportStream.next('exiting check Resource list exists function call')
            }
        )
    })
    
}

private getFieldsHealthReport(listName){
    //let listFailedGetXml: Array<any>;
    this.commonApiService.getListXml(listName, this.utilsService.hostWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                    data.listName == listName && 
                    data.schemaXml) {
                    this.healthReportStream.next('List xml for ' + data.listName + ' recieved ')
                    this._healthReport.listXmlData.push(data)  
                    this.checkFieldsHealthReport(data)
                }
                this.healthReportStream.next(data);                
            },
            err => {
                this.logService.log(err, this.utilsService.errorStatus, false);
                this.healthReportStream.next(`unable to get schemaXml list ${listName}`)
                try {
                    this._healthReport.listFailedGetXml.push(listName);
                } catch (e) {
                    this.logService.log(e, this.utilsService.errorStatus, false);
                    return
                }
            },
            () => {
                this.healthReportStream.next('exiting check Resource list exists function call')
                //update health report
                this.healthReportService.healthReport = this._healthReport;
            }
        )
}

private checkFieldsHealthReport(data){
    let schemaXml = data.schemaXml;

    let listName = data.listName;
        
    let fieldsThatDontExist: Array<IFieldThatDoesntExist> = [];
    let fieldsSetRequired: Array<IFieldUpdate> = [];
    let fieldWrongType: Array<IFieldUpdate> = [];
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
                    fieldName: _element.Name,
                    oldSchema: 'Required="TRUE"',
                    newSchema: 'Required="FALSE'
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

    console.log('FIELDS THAT DONT EXIST')
    console.log(listDefintion)

    //add missing fields into healthreport
    listDefintion.forEach(field => {
        this._healthReport.missingFields.push ({
            listName: listName,
            fieldName: field.Name
        })

    })

    console.log('FIELDS OF WRONG TYPE')
    console.log(fieldWrongType)

    //add fields of wrong type into health report
    fieldWrongType.forEach((element:IFieldUpdate) => {
        this._healthReport.fieldsWrongtype.push(element);
    })
    console.log('FIELDS SET REQUIRED')
    console.log(fieldsSetRequired)

    //add fields set to requred into health report
    fieldsSetRequired.forEach((element:IFieldUpdate) => {
        this._healthReport.fieldsRequired.push(element);
    })

    //update health report
    this.healthReportService.healthReport = this._healthReport;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//ACTION HEALTH REPORT

public actionHealthReport(){
    this.checkPermissionsActionHealthReport();
}


//1. Check Permissions
private checkPermissionsActionHealthReport (){
    let managePermissions: Boolean
    //1.check permissions
    managePermissions = this.uiStateService.getUiState['manageList'];
    this.logService.log(`retrieving requistie permissions - manage List: ${managePermissions}`)
    
    if (!managePermissions) {
        this.actionHealthReportStream.next('user does not have permissions to run Action Health Report')
        this._actionHealthReportResults.permissionsResults = {
            permission: 'manageList',
            result: false
        }
        this.actionHealthReportStream.complete()
        return;
    } else {
        this.actionHealthReportStream.next('user has permissions to manage lists')
        this._actionHealthReportResults.permissionsResults = {
            permission: 'manageList',
            result: true
        }
        this.healthReportService.actionHealthReport = this._actionHealthReportResults
        this.actionHealthReportInit()
    }
}


//2 init action health report
private actionHealthReportInit() {
    //reset action health report results doucument
        // reset health report file
    this._actionHealthReportResults = {
        date: new Date(),
        permissionsResults: {
            permission: 'manageList',
            result: false
        },
        createListSuccess: [],
        createListsFailed: [],
        createListError: [],
        createFieldsSuccess: [],
        createFieldsFailed: [],
        createFieldsError: [],
        updateFieldsSuccess: [],
        updateFieldsFailed: [],
        updateFieldsError: []

    }
    this._actionHealthReportResults.date = new Date();
    
    //1. get data
    let healthReport = this.healthReportService.healthReport
    
    let listToCreate = healthReport.missingLists
    let fieldToCreate = healthReport.missingFields
    let fieldsSetRequired = healthReport.fieldsRequired
    let fieldsWrongType = healthReport.fieldsWrongtype

    //create lists
    listToCreate.forEach(listName => {
        this.createList(healthReport);
    })

    //Reorder create fields into groups of arrays
    let _fieldsToCreateOrdered = {};
    
    fieldToCreate.forEach((fieldSpec:IFieldThatDoesntExist) => {
        //NOTE IT IS MORE EFFICIENT TO PASS IN AN ARRAY OF FIELDS FOR EACH LIST TO REDUCE NUMBER OF API CALLS
        _fieldsToCreateOrdered[fieldSpec.listName] = _fieldsToCreateOrdered[fieldSpec.listName] || []
        _fieldsToCreateOrdered[fieldSpec.listName].push(fieldSpec)
    })

    //  now create fields passing in an array of each fields for each list
    for (let i in _fieldsToCreateOrdered) {
        if (_fieldsToCreateOrdered.hasOwnProperty(i)) {
            this.createFields(_fieldsToCreateOrdered[i], i)
        }
    }

    //update fields set to required
    fieldsSetRequired.forEach(fieldSpec => {
        this.updateFields(fieldSpec)
    })

    //update fields set to wrong type
    fieldsWrongType.forEach(fieldSpec => {
        this.updateFields(fieldSpec);
    })    
}


//3. Create Lists
private createList(listName) {
    this.logService.log('creating lists', this.utilsService.infoStatus, true);

        this.actionHealthReportStream.next('creating List ' + listName)
        this.logService.log('creating list: ' + listName, this.utilsService.infoStatus, true)
        this.commonApiService.createList(listName, 
                                        this.utilsService.hostWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                        data.listName && 
                        data.result) {
                        this.actionHealthReportStream.next('List ' + data.listName + ' created: ' + data.result)

                        this._actionHealthReportResults.createListSuccess.push(data)   
                    }              
            },
            err => {
                this.actionHealthReportStream.next('unable to create list: ' + listName)
                this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
                this.logService.log(err, this.utilsService.errorStatus, false);
                this._actionHealthReportResults.createListError.push({ listName: listName, error: err })
            },
            () => {
                this.healthReportService.actionHealthReport = this._actionHealthReportResults
                this.actionHealthReportStream.next('exiting create list function for ' + listName)
            }
        );
        
}

//4.create fields that don't exist
private createFields(fieldSpecArry: Array<IFieldThatDoesntExist>, listName: string){
    this.logService.log('creating fields', this.utilsService.infoStatus, true);

    let _fieldXml = []
    
    fieldSpecArry.forEach(element=>{
      this.listService.getFieldXml(listName, element.fieldName)  
    })

    //NOTE API CALL HERE HAS BEEN DESIGNED TO TAKE AN ARRAY OF FIELDS FOR EACH LIST TO REDUCE API CALLS
    this.commonApiService.addListFields(listName, _fieldXml, this.utilsService.hostWeb)
    
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                        data.listName && 
                        data.result) {
                            this.provisionerStream.next('Fields have been added to list: ' + data.listName + ' created: ' + data.result)
                        
                        if (data.result == true) {
                            this._actionHealthReportResults.createFieldsSuccess.push(data)
                        } else {
                            this._actionHealthReportResults.createFieldsFailed.push(data)
                        }   
                    }              
            },
            err => {
                this.provisionerStream.next('unable to create list: ' + listName)
                this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
                this.logService.log(err, this.utilsService.errorStatus, false);
                this._actionHealthReportResults.createFieldsError.push({
                    listName: listName,
                    error: err
                })
            },
            () => {
                this.healthReportService.actionHealthReport = this._actionHealthReportResults
                this.actionHealthReportStream.next('exiting create list function for ' + listName)
            }
        )
        
}

//5.update fields that have incorrect configuration
private updateFields(fieldSpec: IFieldUpdate){
    this.logService.log('updating fields', this.utilsService.infoStatus, true);
    this.commonApiService.updateField(fieldSpec.fieldName, fieldSpec.listName, this.utilsService.hostWeb, fieldSpec.oldSchema, fieldSpec.newSchema)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                        data.listName &&
                        data.fieldName && 
                        data.result) {
                            this.actionHealthReportStream.next('Fields have been updated to list: ' + data.listName + ' updated: ' + data.result)
                        

                        if (data.result == true) {
                            this._actionHealthReportResults.updateFieldsSuccess.push(data)
                        } else {
                            this._actionHealthReportResults.updateFieldsFailed.push(data)
                        }
                }                
            },
            err => {
                this.actionHealthReportStream.next('unable to update field: ' + fieldSpec.listName)
                this.logService.log('unable to create list: ' + fieldSpec.listName, this.utilsService.errorStatus, false);
                this.logService.log(err, this.utilsService.errorStatus, false);
                this._actionHealthReportResults.updateFieldsError.push({
                    listName: fieldSpec.listName,
                    fieldName: fieldSpec.fieldName,
                    error: err
                })
            },
            () => {
                this.healthReportService.actionHealthReport = this._actionHealthReportResults
                this.actionHealthReportStream.next('exiting update field function for ' + fieldSpec.listName)
            }
        )


}

///////////////////////////////////////////////////////////////////////////////////////
// PROVISIONER
public provisioner() {
    //check permissions
    //If list exists DELETE then RECREATE LISTS, otherwise CREATE
    this._provisionerReport = {
        date: new Date(),
        permissionsResults: {
            permission: 'viewList',
            result: false
        },
        listExistsSuccess: [],
        listExistsFailed: [],
        listExistsError: [],
        listDeleteSuccess: [],
        listDeleteFailed: [],
        listDeleteError: [],
        listCreateSuccess: [],
        listCreateFailed: [],
        listCreateError: []
    };
    
    this.provisionerStream.next('running check permissions function for provisioner')
    this.checkPermissionsProvisioner('manageList');
    
}

private checkPermissionsProvisioner (permissionLevel){
    let viewPermissions: Boolean
    //1.check permissions
    viewPermissions = this.uiStateService.getUiState(permissionLevel);
    this.provisionerStream.next(`user has view permissions: ${viewPermissions}`)
    if (!viewPermissions) {
        this.provisionerStream.next('user does not have permissions to run provisioner')
        this._provisionerReport.permissionsResults = {
            permission: 'manageList',
            result: false
        }
        this.healthReportService.provisionerReport = this._provisionerReport
        this.provisionerStream.complete()
        return;
    } else {
        this.provisionerStream.next('user has permissions to manage lists')
        this._provisionerReport.permissionsResults = {
            permission: 'manageList',
            result: true
        }
        this.healthReportService.provisionerReport = this._provisionerReport
        this.provisionerStream.next(`running check list exists function for provisioner`)
        this.checkListExistsProvisioner()
    }
}


private checkListExistsProvisioner () {
    //2.check Lists exist
    let listArry:Array<any>
    
    listArry = [this.utilsService.financeAppResourceData, 
                this.utilsService.financeAppMaterialData,
                this.utilsService.financeAppTotalsData]
    
    listArry.forEach(listName => {
        this.provisionerStream.next('')
        this.commonApiService.listExists(listName, this.utilsService.hostWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                    data.listName && 
                    data.value) {
                    this.provisionerStream.next('List ' + data.listName + ' exists: ' + data.value)   
                    if (data.value == true) {
                        this._provisionerReport.listExistsSuccess.push(data)
                        //list exists so delete it beofre trying to recreate it
                        this.provisionerStream.next(`running delete list function for list ${data.listName}`)
                        this.deleteThenCreateList(data.listName)
                    } else {
                        //just create list
                        this._provisionerReport.listExistsFailed.push(data)
                        this.provisionerStream.next(`running create list function for list ${data.listName}`)
                        this.createListProvisioner(data.listName)
                    }
                   
                }
                this.provisionerStream.next(data);
            },
            err => {
                this.logService.log(err, this.utilsService.errorStatus, false);
                this.provisionerStream.next(`unable to check if list ${listName} exists`)
                this.provisionerStream.next(
                    {
                        functionName: 'listExists',
                        listName: listName,
                        result: false
                    }
                )
                this._provisionerReport.listExistsError.push({
                    listName: listName,
                    error: err
                })
            },
            () => {
                this.provisionerStream.next('exiting check list exists function call')
            }
        )
    })
    
}

private deleteThenCreateList(listName) {
    this.commonApiService.deleteList(listName, this.utilsService.hostWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                        data.listName && 
                        data.result) {
                        
                        this.provisionerStream.next('List ' + data.listName + ' delete: ' + data.result)   
                        if (data.result == true) {
                            // now recreate list
                            this.provisionerStream.next(`running create list function for provisioner`)
                            this.createListProvisioner(data.listName);
                            this._provisionerReport.listDeleteSuccess.push(data)
                        } else {
                            this.provisionerStream.next(`failed delete list function for provisioner`)
                            this._provisionerReport.listDeleteFailed.push(data);
                        }
                    }
            },
            err => {
                this.provisionerStream.next('unable to delete list: ' + listName)
                this.provisionerStream.next(
                    {
                        functionName: 'deleteList',
                        listName: listName,
                        result: false
                    }
                )
                this.logService.log('unable to delete list: ' + listName, this.utilsService.errorStatus, false);
                this.logService.log(err, this.utilsService.errorStatus, false);
                this._provisionerReport.listDeleteError.push({
                    listName:listName,
                    error: err
                })
            },
            () => {
                this.provisionerStream.next('exiting delete list function for ' + listName)
            }
        )
}

private createListProvisioner(listName) {
    this.logService.log('creating lists', this.utilsService.infoStatus, true);

        this.provisionerStream.next('creating List ' + listName)
        this.logService.log('creating list: ' + listName, this.utilsService.infoStatus, true)
        this.commonApiService.createList(listName, 
                                        this.utilsService.hostWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                        data.listName && 
                        data.result) {
                        this.provisionerStream.next('List ' + data.listName + ' created: ' + data.result)
                        if (data.result == true) {
                            this._provisionerReport.listCreateSuccess.push(data)   
                        } else {
                            this._provisionerReport.listCreateFailed.push(data);
                        }
                        
                    }              
            },
            err => {
                this.provisionerStream.next('unable to create list: ' + listName)
                this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
                this.logService.log(err, this.utilsService.errorStatus, false);
                this._provisionerReport.listCreateError.push({ listName: listName, error: err })
                this.healthReportService.provisionerReport = this._provisionerReport
            },
            () => {
                this.healthReportService.provisionerReport = this._provisionerReport
                this.provisionerStream.next('exiting create list function for ' + listName)
            }
        );
        
}


///////////////////////////////////////////////////////////////////////////////////////
//SETTINGS LIST SCRIPT

// check settings list and fields exist, create if does not
public settingsListReport(){
    //reset settings report data
    this._settingsReport = {
        date: new Date(),
        permissionsResults: {
            permission: 'viewList',
            result: false
        },
        listExistsResults: [],
        listsFailedToCheck: [],
        listXmlData: [],
        listFailedGetXml: [],
        missingFields: [],
        fieldsWrongType: [],
        fieldsRequired: []

    };

 this.checkPermissionsSettingsList('manageList')
}

private checkPermissionsSettingsList(permissionLevel) {
    let managePermissions: Boolean
    //1.check permissions
    managePermissions = this.uiStateService.getUiState(permissionLevel);
    console.log(managePermissions)
    if (!managePermissions) {
        this.settingsStream.next('user does not have permissions to run Settings Report')
        this._settingsReport.permissionsResults = {
            permission: permissionLevel,
            result: false
        }
        //update settings report
        this.healthReportService.settingsReport = this._settingsReport
        this.settingsStream.complete()
        return;
    } else {
        this.settingsStream.next('user has permissions to manage lists')
        this._settingsReport.permissionsResults = {
            permission: permissionLevel,
            result: true
        }
        //update settings report
        this.healthReportService.settingsReport = this._settingsReport        
        this.settingsListInit()
    }    
}

private settingsListInit() {
    
    this.checkSettingsListExists()
}

private checkSettingsListExists() {
    //2.check Lists exist
    let listArry:Array<any>
    //let listExistsRsltsArry:Array<IListExists>;
    //let listsFailedToCheck: Array<string>

    //listExistsRsltsArry = [];
    //listsFailedToCheck = []; 
    
    listArry = [this.utilsService.financeAppSettingsData]
    
    listArry.forEach(listName => {
        this.commonApiService.listExists(listName, this.utilsService.appWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                    data.listName && 
                    data.value) {
                    this.settingsStream.next('List ' + data.listName + ' exists: ' + data.value)   
                    if (data.value == true) {
                        //list exists so check fields
                        this.getFieldsSettingsList(listName)
                    } else {
                        //check settings of app to see if script should auto create lists
                        this.createSettingsList(listName)
                    }
                    // add results to array
                    this._settingsReport.listExistsResults.push(data)
                    
                }
                this.settingsStream.next(data);

            },
            err => {
                this.logService.log(err, this.utilsService.errorStatus, false);
                this.settingsStream.next(`unable to check if list ${listName} exists`)
                this._settingsReport.listsFailedToCheck.push(listName);
                //update settings report
                this.healthReportService.settingsReport = this._settingsReport
            },
            () => {
                this.settingsStream.next('exiting check Resource list exists function call')
                //update settings report
                this.healthReportService.settingsReport = this._settingsReport                
            }
        )
    })
    
}
//DUPLICATE OF PREVIOUS FUNCITON REFACTORING REQUIRED
private createSettingsList(listName){
    this.logService.log('creating lists', this.utilsService.infoStatus, true);

        this.settingsStream.next('creating List ' + listName)
        this.logService.log('creating list: ' + listName, this.utilsService.infoStatus, true)
        this.commonApiService.createList(listName, 
                                        this.utilsService.appWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                        data.listName && 
                        data.result) {
                        this.settingsStream.next('List ' + data.listName + ' created: ' + data.result)

                        this._actionHealthReportResults.createListSuccess.push(data)   
                    }              
            },
            err => {
                this.settingsStream.next('unable to create list: ' + listName)
                this.logService.log('unable to create list: ' + listName, this.utilsService.errorStatus, false);
                this.logService.log(err, this.utilsService.errorStatus, false);
                this._actionHealthReportResults.createListError.push({ listName: listName, error: err })
                //update settings report
                this.healthReportService.settingsReport = this._settingsReport                
            },
            () => {
                this.settingsStream.next('exiting create list function for ' + listName)
                //update settings report
                this.healthReportService.settingsReport = this._settingsReport                
            }
        );    
}
//DUPLICATE OF EARLIER FUNCTION REFACTORING REQUIRED
private getFieldsSettingsList(listName){
    //let listFailedGetXml: Array<any>;
    this.commonApiService.getListXml(listName, this.utilsService.appWeb)
        .subscribe(
            data => {
                if (typeof(data) === 'object' && 
                    data.listName == listName && 
                    data.schemaXml) {
                    this.settingsStream.next('List xml for ' + data.listName + ' received ')
                    this._settingsReport.listXmlData.push(data)  
                    this.checkFieldsSettingsList(data)
                }
                this.settingsStream.next(data);                
            },
            err => {
                this.logService.log(err, this.utilsService.errorStatus, false);
                this.settingsStream.next(`unable to get schemaXml list ${listName}`)
                try {
                    this._settingsReport.listFailedGetXml.push(listName);
                } catch (e) {
                    this.logService.log(e, this.utilsService.errorStatus, false);
                    return
                }
                //update settings report
                this.healthReportService.settingsReport = this._settingsReport                
            },
            () => {
                this.settingsStream.next('exiting check Resource list exists function call')
                //update settings report
                this.healthReportService.settingsReport = this._settingsReport                
            }
        )
}
//DUPLICATE OF EARLIER FUNCTION, REFACTORING REQUIRED
private checkFieldsSettingsList(data) {
    let schemaXml = data.schemaXml;
    let listName = data.listName;
        
    let fieldsThatDontExist: Array<IFieldThatDoesntExist> = [];
    let fieldsSetRequired: Array<IFieldUpdate> = [];
    let fieldWrongType: Array<IFieldUpdate> = [];
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
                    fieldName: _element.Name,
                    oldSchema: 'Required="TRUE"',
                    newSchema: 'Required="FALSE'
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

    console.log('FIELDS THAT DONT EXIST')
    console.log(listDefintion)

    //add missing fields into healthreport
    listDefintion.forEach(field => {
        this._settingsReport.missingFields.push ({
            listName: listName,
            fieldName: field.Name
        })

    })

    console.log('FIELDS OF WRONG TYPE')
    console.log(fieldWrongType)

    //add fields of wrong type into health report
    fieldWrongType.forEach((element:IFieldUpdate) => {
        this._settingsReport.fieldsWrongType.push(element);
    })
    console.log('FIELDS SET REQUIRED')
    console.log(fieldsSetRequired)

    //add fields set to requred into health report
    fieldsSetRequired.forEach((element:IFieldUpdate) => {
        this._settingsReport.fieldsRequired.push(element);
    })

    //update settings report
    this.healthReportService.settingsReport = this._settingsReport
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

