import { Injectable } from '@angular/core'
import { LogService } from './log.service'
import { ListService } from './list.service'
import { UiStateService } from './ui-state.service'

import { UtilsService } from './utils.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

import {    IFieldExists,
            IFieldUpdateResult,
            IListExists,
            ISchemaFieldResult,
            ISchemaListResult,
            IItemPropertyModel,
            IUpdateItemResult,
            IDeleteItemResult } from '../model/data-validation.model'


declare var SP;
declare var hostUrl;
declare var appUrl;



interface IPermissionModel {
    permissionType: string,
    value: Boolean    
}




@Injectable()
export class CommonApiService {
    private _listDescription: string = 'Finance App List'
    private hostUrl:string = '';
    private appUrl:string = '';
    private _error:string = 'error';
    private _success:string = 'success';
    private _info: string = 'info';

    constructor(private logService: LogService,
                private listService: ListService,
                private utilsService: UtilsService,
                private uiStateService: UiStateService){

                    try {
                        this.hostUrl = hostUrl;
                        console.log(this.hostUrl);
                        this.appUrl = appUrl;
                        console.log(this.appUrl);
                    } catch (e) {
                        this.logService.log(e, this._error, false);
                    }
            
                }

    getPermissions(contextType:string, listName:string):Observable<any>{
        this.logService.log('Get permissions function called', this._info, true);
        let permissions$ = new Observable(observer => {
                observer.next('Get permissions function called');
                let clientContext
                try {
                    clientContext = new SP.ClientContext(this.appUrl);
                } catch (e) {
                    let errmsg = `Unable to create client context`
                    this.logService.log(errmsg, this._error, false);
                    observer.error(errmsg)
                    return;
                }

                let context;

                if (contextType == this.utilsService.hostWeb) {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } else if (contextType == this.utilsService.appWeb){
                    context = clientContext;
                } else {
                    this.logService.log('unable to determine context type: getListPermissions failed', this._error, false)
                    observer.error('unable to determine context type: getListPermissions failed')
                    return;
                }

                let oList;
                try {
                    oList = context.get_web().get_lists().getByTitle(listName);
                } catch (e) {
                    let errmsg = `error locating list ${listName} from context ${contextType} permissions object`
                    this.logService.log(errmsg, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.next(errmsg)
                    observer.error(e);
                    return;
                }

                try {
                    clientContext.load(oList, 'EffectiveBasePermissions');
                } catch(e) {
                    let errmsg = `error loading list permissions object`
                    this.logService.log(errmsg, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.next(errmsg)
                    observer.error(e);
                    return;
                }

                this.logService.log('executing JSOM query', this._info, true);
                clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

                function success(){
                    let perms = oList.get_effectiveBasePermissions();
                    let manageWeb = perms.has(SP.PermissionKind.manageWeb);
                    let manageList = perms.has(SP.PermissionKind.manageList);
                    let viewList = perms.has(SP.PermissionKind.viewListItems);
                    let addListItems = perms.has(SP.PermissionKind.addListItems);
                    let result =    `User has Manager Web permissions: ${manageWeb}, <br/> 
                                    User has Manage List permissions: ${manageList}, <br/>
                                    User has View List permissions: ${viewList}, <br/>
                                    User has Add List Item permissions: ${addListItems}`
                    this.logService.log(result, this._success, false);
                    observer.next(result);

                    try {
                        //update uiState
                        this.uiStateService.updateUiState('manageWeb', manageWeb)
                        this.uiStateService.updateUiState('manageList', manageList)
                        this.uiStateService.updateUiState('viewList', viewList);
                        this.uiStateService.updateUiState('addListItems', addListItems);
                        this.logService.log('uiStateService updated with user permissions', this._info, true);
                    } catch (e) { 
                        this.logService.log("unable to update uiState with list permissions", this._error, false)
                        this.logService.log(e, this._error, false);
                        observer.error(e);
                        return;
                    }


                    let resultsArry:IPermissionModel[] = [
                            {permissionType: 'manageWeb', value: manageWeb},
                            {permissionType: 'manageList', value: manageList},
                            {permissionType: 'viewList', value: viewList},
                            {permissionType: 'addListItems', value: addListItems},
                    ]
                    
                    observer.next(resultsArry);
                    observer.complete();
                    return;
                }   
                function failure(sender, args){
                    let result = 'Request Failed. ' + args.get_message() + '<br/>' + args.get_stackTrace();
                    this.logService.log(result, this._error, false);
                    observer.error(result);
                    return;
                }         
        })
        return permissions$
    }

    getWebPermissions(contextType:string, listName:string): Observable<any> {
        this.logService.log('Get Web permissions function called', this._info, true);
        let permissions$ = new Observable(observer => {
                observer.next('Get Web permissions function called');
                let clientContext
                try {
                    clientContext = new SP.ClientContext(this.appUrl);
                } catch (e) {
                    let errmsg = `Unable to create client context`
                    this.logService.log(errmsg, this._error, false);
                    observer.error(errmsg)
                    return;
                }
                let context;

                if (contextType == this.utilsService.hostWeb) {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } else if (contextType == this.utilsService.appWeb){
                    context = clientContext;
                } else {
                    this.logService.log('unable to determine context type: getpermissions', this._error, false)
                    observer.error('unable to determine context type: getpermissions')
                    return;
                }
                let web, ob, per;

                try {
                    observer.next('defining permissions object for getwebpermissions')
                    web = context.get_web();
                    ob = new SP.BasePermissions();
                    ob.set(SP.PermissionKind.manageWeb);
                    per = web.doesUserHavePermissions(ob);
                } catch (e) {
                    this.logService.log('unable to load define permissions object; getwebpermissions failed', this._error, false)
                    observer.error('unable to load define permissions object; getwebpermissions failed')
                    return;                    
                }

                this.logService.log('executing JSOM query', this._info, true);
                clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

                function success(){
                    let result = per.get_value();

                    try {
                        //update uiState
                        this.uiStateService.updateUiState('manageWeb', result)
                        this.logService.log('uiStateService updated with web permissions', this._info, true);
                    } catch (e) { 
                        this.logService.log("unable to update uiState with web permissions", this._error, false)
                        this.logService.log(e, this._error, false);
                        observer.error(e);
                        return;
                    }

                    observer.next('returning result...')
                    observer.next(  { manageWeb: result } );

                    observer.complete();
                    return;
                }   
                function failure(sender, args){
                    let result = 'Request Failed. ' + args.get_message() + '<br/>' + args.get_stackTrace();
                    this.logService.log(result, this._error, false);
                    observer.error(result);
                    return;
                }         
        })
        return permissions$
    }    


    deleteList(listName:string, contextType:string):Observable<any>{
        this.logService.log('Delete list funtion called', this._info, true);
        
         let deleteList$ = new Observable(observer => {
            observer.next('Delete List function called');
            if (!this.uiStateService.getUiState('manageList')) {
                let errorMsg = `user does not have permissions to delete lists`
                this.logService.log(errorMsg, this._error, false);
                observer.error(errorMsg);
                return;
            }
            
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                let errmsg = `Unable to create client context`
                this.logService.log(errmsg, this._error, false);
                observer.error(errmsg)
                return;
            }
            let context;

            if (contextType == this.utilsService.hostWeb) {
                context = new SP.AppContextSite(clientContext, this.hostUrl);
            } else if (contextType == this.utilsService.appWeb){
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }

            let oWebsite = context.get_web();

            let financeList = oWebsite.get_lists().getByTitle(listName);
            financeList.deleteObject();
            this.logService.log('executing JSOM query', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let resultMsg = 'list deleted successfully'
                this.logService.log(resultMsg, this._info, false);
                let result = {
                    apiCall: 'deleteList',
                    listName: listName,
                    result: true
                }
                observer.next(result);
                observer.complete();
                return;
            }

            function failure(sender, args) {
                let resultMsg = 'Request Failed. ' + args.get_message() + '<br/>' + args.get_stackTrace();
                this.logService.log(resultMsg, this._error, false);
                let result = {
                    apiCall: 'deleteList',
                    listName: listName,
                    result: false
                }
                observer.next(result)
                observer.complete();
                return;
            }
        })

        return deleteList$   
}

createList(listName:string, contextType:string):Observable<any>{
    this.logService.log('creatList function called', this._info, true);
    this.logService.log(`listName parameter: ${listName}.  contextType parameter: ${contextType}`, this._info, true);
    let createList$ = new Observable((observer:Observer<any>) => {
        observer.next('create list function called');

        if (!this.uiStateService.getUiState('manageList')) {
            let permissionMsg = `user does not have permissions to create lists`
            this.logService.log(permissionMsg, this._error, false);
            observer.error(permissionMsg); 
            return;
        }
        let clientContext
        try {
            clientContext = new SP.ClientContext(this.appUrl);
        } catch (e) {
            this.logService.log(`unable to create clientContext`, this._error, false);
            this.logService.log(e, this._error, false);
            observer.error(`unable to create clientContext`)
            return;
        }
            
        let context; 

        if (contextType == this.utilsService.hostWeb) {
            this.logService.log('contextType == this.utils.hostweb', this._info, true);
            try {
                context = new SP.AppContextSite(clientContext, this.hostUrl);
            } catch (e) {
                this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create hostweb clientContext`)
                return;
            }
        
        } else if (contextType == this.utilsService.appWeb){
            this.logService.log('contextType = appWeb', this._info, true)
            context = clientContext;
        } else {
            this.logService.log('unable to determine context type: Create List failed', this._error, false)
            observer.error('unable to determine context type: Create List failed')
            return;
        }

        let oWebsite, listCreationInfo, listInfo;

        try {
            this.logService.log('shaping listCreationInfomation', this._info, true);
            listCreationInfo = new SP.ListCreationInformation();
            listCreationInfo.set_title(listName);
            listCreationInfo.set_description(this._listDescription)
            listCreationInfo.set_templateType(SP.ListTemplateType.genericList);
            oWebsite = context.get_web();
            listInfo = oWebsite.get_lists().add(listCreationInfo);
        } catch(e) {
            this.logService.log('unable to load create and define base list creation Info', this._error, false)
            this.logService.log(e, this._error, false);
            observer.error('unable to load create and define base list creation Info'); 
            return;                       
        }
        
        let fieldSpecArray;
        try {
            this.logService.log('loading field definitions', this._info, true);
            //get field spec
            fieldSpecArray = this.listService.getFields(listName);
            //create field definitions
            fieldSpecArray.forEach((value, index, array)=>{
                listInfo.get_fields().addFieldAsXml(value, true, SP.AddFieldOptions.defaultValue);
            })
        } catch (e) {
            this.logService.log('unable to load field definition', this._error, false)
            this.logService.log(e, this._error, false);
            observer.error('unable to load field definition');
            return;
        }

        observer.next('attempting to execute JSOM query: list creation')
        this.logService.log('executing JSOM query: list creation', this._info, true);
        clientContext.load(listInfo);
        clientContext.executeQueryAsync(onListCreateSucceeded.bind(this), onListCreateFailed.bind(this));

        function onListCreateSucceeded() {
            let result = {
                listName: listName,
                result: true   
            };
            observer.next(result);
            this.logService.log(listName + 'list created', this._success, false);
            observer.complete();
            return;     
        }

        function onListCreateFailed(sender, args) {
            let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            observer.next(result);
            this.logService.log(result, this._error, false);
            observer.complete();
            return;
        }
    })

    return createList$

    }

    listExists(listName:string, contextType:string):Observable<any>{
        this.logService.log('check list Exists function called', this._info, true);

        let listExists$ = new Observable((observer:Observer<any>) => {
            observer.next('check list Exists funciton called')

            if (!this.uiStateService.getUiState('viewList')) {
                let permissionMsg = `user does not have permissions to check if list exists`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg)
                return;
            }
        let clientContext
        try {
            clientContext = new SP.ClientContext(this.appUrl);
        } catch (e) {
            this.logService.log(`unable to create clientContext`, this._error, false);
            this.logService.log(e, this._error, false);
            observer.error(`unable to create clientContext`)
            return;
        }
            
        let context; 

        if (contextType == this.utilsService.hostWeb) {
            this.logService.log('contextType == this.utils.hostweb', this._info, true);
            try {
                context = new SP.AppContextSite(clientContext, this.hostUrl);
            } catch (e) {
                this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create hostweb clientContext`)
                return;
            }
        
        } else if (contextType == this.utilsService.appWeb){
            this.logService.log('contextType = appWeb', this._info, true)
            context = clientContext;
        } else {
            this.logService.log('unable to determine context type: Create List failed', this._error, false)
            observer.error('unable to determine context type: Create List failed')
            return;
        }
            let web, listColl;

            try {
                this.logService.log('shaping JSOM query', this._info, true);
                web = context.get_web();

                listColl = web.get_lists();
                clientContext.load(listColl);
            } catch (e) {
                    this.logService.log('unable to load JSOM query', this._error, false)
                    this.logService.log(e, this._error, false);
                    observer.error('unable to load JSOM query'); 
                    return;                   
            }
            observer.next('attempting to execute JSOM query: check list exists')
            this.logService.log('executing JSOM query: check list exists', this._info, true);
            
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let listFlag = false;
                let listEnumerator;
                try {
                    listEnumerator = listColl.getEnumerator();
                } catch (e) {
                    this.logService.log('unable to create field Enumerator', this._error, false);
                    observer.error('unable to create fieldEnumerator');
                    return;                        
                }
                

                while (listEnumerator.moveNext()) {
                    let oList;
                    try {
                        oList = listEnumerator.get_current();
                        console.log(oList.get_title());
                        if (oList.get_title() == listName) {
                            listFlag = true;
                        }
                    } catch (e) {
                        this.logService.log('error encountered iterating through fields', this._error, false);
                        this.logService.log(e, this._error, false);
                        observer.error('error encountered iterating through fields');  
                        return;                          
                    }
                }
            
                
                let result: IListExists = {
                    apiCall: 'ListExists',
                    listName: listName,
                    value: listFlag
                }

                this.logService.log(result, this._success, false);
                observer.next(result);
                observer.complete()
                return;
               
            }

            function failure(sender, args) {
                let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
                this.logService.log(result, this._error, false);
                observer.next(result);
                observer.complete();
                return;
            }
        })
        return listExists$
    }

    readFields(listName:string, contextType:string):Observable<any>{
        this.logService.log('Read fields funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}`, this._info, true);
        let readFields$ = new Observable((observer:Observer<any>) => {
            observer.next('Read fields function called');

            if (!this.uiStateService.getUiState('viewList')) {
                let permissionMsg = `user does not have permissions to read list fields`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }

            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }
            let web, fields;
            try {
                this.logService.log('shaping JSOM query', this._info, true);
                web = context.get_web();
                fields = web.get_lists().getByTitle(listName).get_fields();
                clientContext.load(fields);
            } catch (e) {
                this.logService.log('unable to load required query', this._error, false)
                this.logService.log(e, this._error, false);
                observer.error('unable to load required query')
                return;
            }
            observer.next('attempting to execute JSOM query: read fields')
            this.logService.log('executing JSOM query: read fields', this._info, true);                 
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let fieldEnumerator;
                try {
                    fieldEnumerator = fields.getEnumerator();
                } catch (e) {
                    this.logService.log('unable to create field Enumerator', this._error, false);
                    observer.error('unable to create fieldEnumerator');
                    return;
                }                    
                while (fieldEnumerator.moveNext()) {
                    try {
                        let oField = fieldEnumerator.get_current();
                        this.logService.log(oField.get_title(), this._info, true);
                        let result = 'Field title ' + oField.get_title() + ' field internal name: ' + oField.get_internalName();
                        this.logService.log(result, this._info, true);
                        observer.next(result);
                    } catch (e) {
                        this.logService.log('error encountered iterating through fields', this._error, false);
                        this.logService.log(e, this._error, false);
                        observer.error('error encountered iterating through fields');
                        return;
                    }
                                        
                }
                this.logService.log('iterating through fields complete', this._info, true);
                observer.next('iterating through fields complete');
                observer.complete(); 
                return;
            }

            function failure(sender, args) {
                let result = 'failed to read field';
                this.logService.log(result, this._error, false);
                let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
                this.logService.log(apiResult, this._error, false);                    
                observer.next(result);
                observer.complete(); 
                return;               
            }            
        })
        return readFields$
    }

    fieldExists(listName:string, fieldName:string, contextType:string):Observable<any> {
        this.logService.log('Field Exists funtion called', this._info, true);
        this.logService.log(`listName: ${listName}, fieldName: ${fieldName}, contextType: ${contextType}`);
        let fieldExists$ = new Observable((observer: Observer<any>) => {
            observer.next('Field exists function called');

            if (!this.uiStateService.getUiState('viewList')) {
                let permissionMsg = `user does not have permissions to check if field exists`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }

            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }

            let web, fields;
            try {
                this.logService.log('shaping JSOM query', this._info, true);
                web = context.get_web();
                fields = web.get_lists().getByTitle(listName).get_fields();

                clientContext.load(fields);
            } catch (e) {
                this.logService.log('unable to load required query', this._error, false)
                this.logService.log(e, this._error, false)
                observer.error('unable to load required query')
                return
            }
            this.logService.log('executing JSOM query for function: fieldExists', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));
            
            function success() {
                this.logService.log(`successfully executed JSOM query to find field`)
                let fieldTitle = 'year';
                let fieldFlag = false;
                let fieldEnumerator
                try {
                    fieldEnumerator = fields.getEnumerator();
                } catch (e) {
                    this.logService.log('unable to create field Enumerator', this._error, false);
                    observer.error('unable to create fieldEnumerator');
                    return
                }

                while (fieldEnumerator.moveNext()) {
                    try {
                        let oField = fieldEnumerator.get_current();
                        this.logService.log('fieldName: ' + oField.get_title(),this._info, true);
                        if (oField.get_title() == fieldName) {
                            let result = `field: ${fieldName} found in list ${listName}`
                            this.logService.log(result, this._success, true)
                            fieldFlag = true;
                            observer.next(result);
                            observer.complete()
                            return;
                        }
                    } catch (e) {
                        this.logService.log('error encountered iterating through fields', this._error, false);
                        this.logService.log(e, this._error, false);
                        observer.error('error encountered iterating through fields');
                        return                            
                    }                        
                }

                let result:IFieldExists = {
                    fieldName: fieldName,
                    listName: listName,
                    value: fieldFlag
                }
                //`field ${fieldName} on list ${listName} does not exist`
                this.logService.log(result, this._success, false);
                observer.next(result);
                observer.complete()
                return;

            }
            function failure(sender, args) {
                let result = `error encountered when executing JSOM query to check if field ${fieldName} exists in list: ${listName}`;
                this.logService.log(result);
                let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
                this.logService.log(apiResult, this._error, false);                    
                observer.next(result);
                observer.complete()
                return;
            }
                        
        })
        return fieldExists$
    }

    readField(fieldName:string, listName:string, contextType:string):Observable<any>{
        this.logService.log('Read Field funtion called', this._info, true);
        this.logService.log(`fieldName Parameter: ${fieldName}, listName parameter ${listName}, contextType parameter: ${contextType}`, this._info, true);  
        let readField$ = new Observable((observer:Observer<any>) => {
            observer.next('Read Field function called');

            if (!this.uiStateService.getUiState('viewList')) {
                let permissionMsg = `user does not have permissions to read field`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
        let clientContext
        try {
            clientContext = new SP.ClientContext(this.appUrl);
        } catch (e) {
            this.logService.log(`unable to create clientContext`, this._error, false);
            this.logService.log(e, this._error, false);
            observer.error(`unable to create clientContext`)
            return;
        }
            
        let context; 

        if (contextType == this.utilsService.hostWeb) {
            this.logService.log('contextType == this.utils.hostweb', this._info, true);
            try {
                context = new SP.AppContextSite(clientContext, this.hostUrl);
            } catch (e) {
                this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create hostweb clientContext`)
                return;
            }
        
        } else if (contextType == this.utilsService.appWeb){
            this.logService.log('contextType = appWeb', this._info, true)
            context = clientContext;
        } else {
            this.logService.log('unable to determine context type: Create List failed', this._error, false)
            observer.error('unable to determine context type: Create List failed')
            return;
        }
            
            

        let web, field;
        try { 
                web = context.get_web();
                field = web.get_lists().getByTitle(listName).get_fields().getByInternalNameOrTitle(fieldName);
                clientContext.load(field, "SchemaXml");
        } catch (e) {
                this.logService.log('unable to load required query', this._error, false)
                this.logService.log(e, this._error, false)
                observer.error('unable to load required query')
                return;       
        }

        this.logService.log('executing JSOM query for function: readField', this._info, true);
        clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

        function success() {
            let result = `successfully read field ${fieldName} from list: ${listName}`;
            this.logService.log(result, this._success, true);
            let SchemaXml
            try {
                SchemaXml = field.get_schemaXml();
            } catch (e) {
                let result = `unable to get schemal XML for readField ${fieldName} on list ${listName}`
                this.logService.log(result, this._error, false);
                observer.error(result);
                return;
            }

            observer.next(result);
            
            let schemaObject:ISchemaFieldResult = {
                fieldName: fieldName,
                listName: listName,
                schemaXml: SchemaXml
            }
            observer.next(schemaObject);
            this.logService.log(SchemaXml, this._info, true);
            observer.complete();
            return;         
        }
        function failure(sender, args) {
            let result = `failed to read field ${fieldName} on list ${listName}`;
            this.logService.log(result, this._error, false);
            let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
            this.logService.log(apiResult, this._error, false);
            observer.next(result);
            observer.complete();
            return;      
        }
    })
    return readField$
    }

    deleteField(fieldName: string, listName: string, contextType: string): Observable<any>{
        this.logService.log('Delete Field function called', this._info, true);
        this.logService.log(`fieldName parameter: ${fieldName}, listName parameter: ${listName}, contextType parameter: ${contextType}`)

        let deleteField$ = new Observable((observer:Observer<any>) => {
            observer.next('deleteField function called');

            if (!this.uiStateService.getUiState('manageList')) {
                let permissionMsg = `user does not have permissions to delete field on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
        let clientContext
        try {
            clientContext = new SP.ClientContext(this.appUrl);
        } catch (e) {
            this.logService.log(`unable to create clientContext`, this._error, false);
            this.logService.log(e, this._error, false);
            observer.error(`unable to create clientContext`)
            return;
        }
            
        let context; 

        if (contextType == this.utilsService.hostWeb) {
            this.logService.log('contextType == this.utils.hostweb', this._info, true);
            try {
                context = new SP.AppContextSite(clientContext, this.hostUrl);
            } catch (e) {
                this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create hostweb clientContext`)
                return;
            }
        
        } else if (contextType == this.utilsService.appWeb){
            this.logService.log('contextType = appWeb', this._info, true)
            context = clientContext;
        } else {
            this.logService.log('unable to determine context type: Create List failed', this._error, false)
            observer.error('unable to determine context type: Create List failed')
            return;
        }      
            
            
            let web, oList, field;
            
            try {
                web = context.get_web();
                oList = web.get_lists().getByTitle(listName)
                field = oList.get_fields().getByInternalNameOrTitle(fieldName);
                field.deleteObject();
                oList.update();
            } catch (e) {
                this.logService.log('unable to load required query', this._error, false)
                this.logService.log(e, this._error, false)
                observer.error('unable to load required query') 
                return;                    
            }
            
            clientContext.load(oList);
            this.logService.log('executing JSOM query for function: deleteField', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let result = `Field ${fieldName} in list: ${listName} successfully deleted`;
                observer.next(result);
                this.logService.log(result, this._success, true);
                observer.complete()
                return;
            }

            function failure(sender, args) {
                let result = `failed to delete field: ${fieldName} from list: ${listName} `
                observer.next(result);
                this.logService.log(result, this._error, false);
                let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
                this.logService.log(apiResult, this._error, false);
                observer.complete()
                return;
            }
        })
        return deleteField$ 
    }

    updateField(fieldName: string, listName: string, contextType: string, oldSchema:string, newSchema:string):Observable<any>{
        this.logService.log('Update Field funtion called', this._info, true);
        this.logService.log(`fieldName parameter:  ${fieldName}, listName parameter: ${listName}, contextType parameter: ${contextType}, oldSchema parameter: ${oldSchema}, newSchema parameter: ${newSchema}`)

        let updateField$ = new Observable((observer:Observer<any>) => {
            observer.next('update field function called');

            if (!this.uiStateService.getUiState('manageList')) {
                let permissionMsg = `user does not have permissions to update a field on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }                      
            

            let web, field;
            try {
                this.logService.log(`attempting to load list query for function updateField`, this._info, true);
                web = context.get_web();
                field = web.get_lists().getByTitle(listName).get_fields().getByInternalNameOrTitle(fieldName);
                clientContext.load(field, "SchemaXml");
            } catch (e) {
                this.logService.log('unable to load required query', this._error, false)
                this.logService.log(e, this._error, false)
                observer.error('unable to load required query')
                return;     
            }

            this.logService.log('executing JSOM query for function: updateField', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let result = `successfully executed query to load schemaXml for function updateField for field ${fieldName} on list ${listName}`
                this.logService.log(result, this._success, true);
                observer.next(result);
                try {
                    this.logService.log(`attempting to load schemaXml query for function updateField`, this._info, true);
                    let schema = field.get_schemaXml();
                    var s1 = schema.replace(oldSchema, newSchema)
                    field.set_schemaXml(s1);

                    field.update();
                } catch (e) {
                    this.logService.log('unable to load required query', this._error, false)
                    this.logService.log(e, this._error, false)
                    observer.error('unable to load required query')
                    return;                     
                }
                clientContext.load(field);
                this.logService.log('executing JSOM query for function: updateField', this._info, true);
                clientContext.executeQueryAsync(success1.bind(this), failure1.bind(this));

                function success1() {
                    let resultMsg = `Field: ${fieldName} in list: ${listName} updated successfully`;
                    let result: IFieldUpdateResult = {
                        listName: listName,
                        fieldName: fieldName,
                        result: true
                    }
                    
                    observer.next(result);
                    this.logService.log(resultMsg, this._success, false);
                    observer.complete()
                    return;                
                }
                function failure1(sender, args) {
                    let resultMsg = `Failed to execute query to update field field ${fieldName} in list: ${listName}`;
                    this.logService.log(resultMsg, this._error, false);
                    let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
                    this.logService.log(apiResult, this._error, false);
                    let result: IFieldUpdateResult = {
                        listName: listName,
                        fieldName: fieldName,
                        result: true
                    }
                    
                    observer.complete()
                    return;                         
                }
            }

            function failure(sender, args) {
                let result = `Failed to execute query to update field field ${fieldName} in list: ${listName}`;
                let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
                observer.next(result);
                this.logService.log(result, this._error, false);
                this.logService.log(apiResult, this._error, false);
                observer.complete()
                return;                     
            }                            
        })
        return updateField$
    }

    addItem(listName: string, contextType: string, itemValues: Array<IItemPropertyModel>): Observable<any>{
        this.logService.log('Add Item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}, itemValues parameters: ${itemValues}`, this._info, true);

        let addItem$ = new Observable((observer:Observer<any>) => {
            observer.next('add Item function called');

            if (!this.uiStateService.getUiState('addListItems')) {
                let permissionMsg = `user does not have permissions to add a field on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
            
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }

            let list, itemCreateInfo, listItem
            try {
                this.logService.log('setting up itemCreationInformation object for function: addItem', this._info, true);
                list = context.get_web().get_lists().getByTitle(listName);

                itemCreateInfo = new SP.ListItemCreationInformation();
                listItem = list.addItem(itemCreateInfo);
            } catch (e) {
                this.logService.log('error setting up itemCreationInformation object for function: addItem', this._error, false);
                this.logService.log(e,this._error, false);
                observer.error('error setting up itemCreationInformation object for function: addItem')
                return;
            }
            
            try {
                this.logService.log('defining list item for function: addItem', this._info, true);
                
                itemValues.forEach(element => {
                    this.logService.log(`adding field to list ${listName} with values...`, this._info, true)
                    this.logService.log(String(element.fieldName) + ': ' + String(element.fieldValue), this._info, true);
                    listItem.set_item(element.fieldName, element.fieldValue);
                });
                listItem.update();
            } catch (e) {
                this.logService.log('error setting list item definition for function: addItem', this._error, false);
                observer.error('error setting list item definition for function: addItem')
                return;
            }


            try {
                this.logService.log('loading list item for function: addItem', this._info, true);
                clientContext.load(listItem);
            } catch (e) {
                this.logService.log(`unable to load list item in function: addItem in list ${listItem}`)
                this.logService.log(e,this._error, false);
                observer.error(`unable to load list item in function: addItem in list ${listItem}`);
                return;
            }
            

            this.logService.log('executing JSOM query for function: addItem', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let resultMsg = `Item successfully created in List: ${listName}`
                let result = {
                    apiCall: 'addItem',
                    listName: listName,
                    result: true
                }
                observer.next(result);
                this.logService.log(resultMsg, this._success, true);
                observer.complete()
                return;                
            }

            function failure(sender, args) {
                let apiResult = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
                let resultMsg = `Request failed to addItem to list ${listName}`
                let result = {
                    apiCall: 'addItem',
                    listName: listName,
                    result: false
                }

                observer.next(result);
                this.logService.log(resultMsg, this._error, false);
                this.logService.log(apiResult, this._error, false);
                observer.complete()
                return;
            }            
        })
        return addItem$
    }

    updateItem(listName: string, contextType: string, itemId: string, itemValues: Array<IItemPropertyModel>): Observable<any>{
        this.logService.log('Update Item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}, itemId parameter: ${itemId}, itemValues parameter: ${itemValues}`)

        let updateItem$ = new Observable((observer:Observer<any>) => {
            observer.next('update Item function called');

            if (!this.uiStateService.getUiState('addListItems')) {  
                let permissionMsg = `user does not have permissions to update an item on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }            
        
            let list, listItem;
            try {
                list = context.get_web().get_lists().getByTitle(listName);
                listItem = list.getItemById(itemId);
                itemValues.forEach((element, index, array) => {
                    listItem.set_item(element.fieldName, element.fieldValue);
                })
                listItem.update();
            } catch (e) {
                this.logService.log('error defining the update information for funciton: updateItem', this._error, false);
                this.logService.log(e,this._error, false);
                observer.error('error defining the update information for funciton: updateItem')
                return;
            }
            
            clientContext.load(listItem);
            this.logService.log('executing JSOM query for function: updateItem', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let resultMsg = 'updated list item successfully';
                let result:IUpdateItemResult = {
                    apiCall: 'updateItem',
                    listName: listName,
                    itemId: itemId,
                    result: true
                }
                observer.next(result);
                this.logService.log(resultMsg, this._success, false);
                observer.complete();
                return;
            }

            function failure(sender, args) {
                let apiResult = 'Failed to UPDATE ITEM: ' + args.get_message() + '  ' + args.get_stackTrace();
                this.logService.log(apiResult, this._error, false);
                let resultMsg = `Request failed to updateItem to list ${listName}`
                this.logService.log(resultMsg, this._error, false);
                let result:IUpdateItemResult = {
                    apiCall: 'updateItem',
                    listName: listName,
                    itemId: itemId,
                    result: true
                }
                observer.next(result);
                
                observer.complete();
                return;                
            }            
        })
        return updateItem$
    }

    getItem(listName: string, queryString: string, contextType: string): Observable<any>{
        this.logService.log('Get Item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, queryString parameter: ${queryString}, contextType parameter: ${contextType}`)

        let getItem$ = new Observable((observer:Observer<any>) => {
            observer.next('get Item function called');

            if (!this.uiStateService.getUiState('viewList')) { 
                let permissionMsg = `user does not have permissions to read an item on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed');
                return;
            }            
            
            let web, list, query, listItems;
            try {
                web = context.get_web();
                list = web.get_lists().getByTitle(listName);
                query = new SP.CamlQuery();
                query.set_viewXml(queryString);
                listItems = list.getItems(query);
                clientContext.load(listItems);
            } catch (e) {
                this.logService.log('error loading context information for function getItem', this._error, false);
                this.logService.log(e,this._error, false);
                observer.error('error loading context information for function getItem');
                return;
            }

            this.logService.log('executing JSOM query for function: getItem', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let listItemEnumerator, listItemCount, messageSuccess;
                messageSuccess = `executed query successfully for function getItem on list ${listName} with queryString ${queryString}`
                this.logService.log(messageSuccess, this._success, true);
                try {
                    listItemEnumerator = listItems.getEnumerator();
                } catch (e) {
                    this.logService.log(e, this._error, false);
                    observer.error(e);
                    return;
                }
                try {
                    listItemCount = String(listItems.get_count());
                    this.logService.log(`length of returned collection: ${listItemCount}`, this._info, true);
                } catch (e){
                    this.logService.log(e, this._error, false);
                    observer.error(e); 
                    return;                  
                }
            
                while (listItemEnumerator.moveNext()) {
                    let result, oListItem;
                    try {
                        oListItem = listItemEnumerator.get_current();
                        result = oListItem.get_fieldValues()
                        observer.next(result);
                        this.logService.log(result, this._info, true);
                    } catch (e) {
                        this.logService.log(e, this._error, false);
                        observer.error(e);                    
                    }
                }
                observer.complete();
            }

            function failure(sender, args) {
                let apiResult = 'Request Failed to get items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace()
                let result = `failed to execute query for getItem on list: ${listName} with queryString: ${queryString}`
                observer.next(result);
                this.logService.log(result, this._error, false);
                this.logService.log(apiResult, this._error, false);
                observer.complete(); 
                return;
            }            
        })
        return getItem$
        
    }

    getItems(listName: string, contextType: string): Observable<any>{
        this.logService.log('Get Items funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType paramter: ${contextType}`)

        let getItems$ = new Observable((observer:Observer<any>) => {
            observer.next('get items function called');

            if (!this.uiStateService.getUiState('viewList')) {
                let permissionMsg = `user does not have permissions to read items on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`);
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`);
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed');
                return;
            }


            let web, list, camlQuery, items
            try {
                web = context.get_web();
                list = web.get_lists().getByTitle(listName);
                camlQuery = new SP.CamlQuery();
                items = list.getItems(camlQuery);
                clientContext.load(items);
            } catch (e) {
                this.logService.log('error loading context information for function getItems', this._error, false);
                this.logService.log(e,this._error, false);
                observer.error('error loading context information for function getItems');
                return;
            }
            
            this.logService.log('executing JSOM query for function: getItems', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let itemEnumerator
                try {
                    itemEnumerator = items.getEnumerator();
                } catch (e) {
                    let errmsg = `error occured tyring to get enumerator for function getItems on list ${listName}`
                    this.logService.log(errmsg, this._error, false);
                    observer.error(errmsg);
                    return;
                }
                while (itemEnumerator.moveNext()) {
                    let oItem, fieldValues;
                    try{
                        oItem = itemEnumerator.get_current();
                        // note get_fieldValues returns json object
                        fieldValues = oItem.get_fieldValues();
                        this.logService.log(fieldValues, this._info, false);
                        observer.next({
                            listName: listName, 
                            result: true,
                            fieldValues: fieldValues
                        })
                    } catch (e) {
                        this.logService.log(`error occured while iterating through list items on list ${listName}`, this._error, false);
                        this.logService.log(e, this._error, false);
                        observer.error(e);
                        return;
                    }
                    
                    
                }
                observer.complete();
            }

            function failure(sender, args) {
                let result = 'Request Failed to get items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
                observer.next({
                    listName: listName,
                    result: false,
                    fieldValues: ''
                });
                this.logService.log(result, this._error, false);
                observer.complete();
                return;
            }            
        })
        return getItems$ 
    }

    deleteItem(listName: string, itemId: number, contextType: string):Observable<any>{
        this.logService.log('delete item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, itemId parameter: ${itemId}, contextType paramter: ${contextType}`)

        let deleteItem$ = new Observable((observer:Observer<any>) => {
            observer.next('deleteItem function called');

            if (!this.uiStateService.getUiState('manageList')) { 
                let permissionMsg = `user does not have permissions to delete items on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }

            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`);
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`);
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed');
                return;
            }
            
            let web, listItem;
            try {        
                web = context.get_web();
                listItem = web.get_lists().getByTitle(listName).getItemById(itemId);
                listItem.deleteObject();
            } catch (e) {
                this.logService.log('error loading context information for function deleteItem', this._error, false);
                this.logService.log(e,this._error, false);
                observer.error('error loading context information for function deleteItem');
                return;
            }
            this.logService.log('executing JSOM query for function: deleteItem', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let resultMsg = `Item with item id ${itemId} deleted successfully on list: ${listName}`
                let result: IDeleteItemResult = {
                    apiCall: 'deleteItem',
                    listName: listName,
                    itemId: String(itemId),
                    result: true
                }
                observer.next(result);
                this.logService.log(resultMsg, this._success, false);
                observer.complete();
                return;         
            }


            function failure(sender, args) {
                let resultMsg = `Failed to delete item ${itemId} on list ${listName}` + args.get_message() + ' <br/> ' + args.get_stackTrace()
                let result: IDeleteItemResult = {
                    apiCall: 'deleteItem',
                    listName: listName,
                    itemId: String(itemId),
                    result: true
                }                
                observer.next(result);
                this.logService.log(resultMsg, this._error, false);
                observer.complete();
                return;                 
            }         
        })
        return deleteItem$
    }

    deleteItems(listName: string, contextType:string):Observable<any> {
        this.logService.log('delete item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}`)

        let deleteItems$ = new Observable((observer:Observer<any>) => {
            observer.next('delete Items function called')

            if (!this.uiStateService.getUiState('manageList')) { 
                let permissionMsg = `user does not have permissions to delete items on a list`;
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`);
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`);
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed');
                return;
            }

            let list, query, items;
        
            try {
                list = context.get_web().get_lists().getByTitle(listName);
                query = new SP.CamlQuery();
                items = list.getItems(query);
                clientContext.load(items, "Include(Id)");
            } catch (e) {
                this.logService.log('error loading context information for function deleteItemS', this._error, false);
                this.logService.log(e,this._error, false);
                observer.error('error loading context information for function deleteItemS');
                return;
            }
            this.logService.log(`executing JSOM query for function: deleteItems on list ${listName}`, this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let itemEnumerator, simpleArray;
                simpleArray = [];
                
                try {
                    itemEnumerator = items.getEnumerator();
                } catch (e) {
                    let errmsg = `unable to get enumerator for function deleteItems`
                    this.logService.log(errmsg, this._error, false);
                    observer.error(errmsg);
                    return;
                }

                while (itemEnumerator.moveNext()) {
                    simpleArray.push(itemEnumerator.get_current());
                }
                for (let s in simpleArray) {
                    simpleArray[s].deleteObject();
                }

                this.logService.log('executing JSOM query for function: deleteItems', this._info, true);
                clientContext.executeQueryAsync(success2.bind(this), failure2.bind(this));

                function success2() {
                    let result = `all items deleted successfully from list ${listName}`
                    this.logService.log(result, this._success, true);
                    observer.next(result);
                    observer.complete();
                    return;                  
                };
                function failure2(sender, args) {
                    let result = `Request Failed to delete each item in function deleteItems in list ${listName} ` + args.get_message() + ' <br/> ' + args.get_stackTrace();
                    this.logService.log(result, this._error, false);
                    observer.next(result);
                    observer.complete();
                    return;
                }
            }


            function failure(sender, args) {
                let result = `failed to get list items in function deleteItems on list ${listName} ` + args.get_message() + ` <br/> ` + args.get_stackTrace()
                this.logService.log(result, this._error, false);
                observer.next(result);
                observer.complete();
                return;
                }
            });           
        return deleteItems$
    }

getListXml(listName: string, contextType: string):Observable<any>{
        this.logService.log('Update Field funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}`)

        let getListXml$ = new Observable((observer:Observer<any>) => {
            //observer.next('get list xml function called');

            if (!this.uiStateService.getUiState('viewList')) {
                let permissionMsg = `user does not have permissions to get list xml on a list`
                this.logService.log(permissionMsg, this._error, false);
                observer.error(permissionMsg);
                return;
            }
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
                
            let context; 

            if (contextType == this.utilsService.hostWeb) {
                this.logService.log('contextType == this.utils.hostweb', this._info, true);
                try {
                    context = new SP.AppContextSite(clientContext, this.hostUrl);
                } catch (e) {
                    this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                    this.logService.log(e, this._error, false);
                    observer.error(`unable to create hostweb clientContext`)
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: getListXml', this._error, false)
                observer.error('unable to determine context type: GetListXml')
                return;
            }                      
            

            let web, list
            try {
                this.logService.log(`attempting to load list query for function getListXml`, this._info, true);
                web = context.get_web();
                list = web.get_lists().getByTitle(listName);
                clientContext.load(list, "SchemaXml");
            } catch (e) {
                this.logService.log('unable to load required query', this._error, false)
                this.logService.log(e, this._error, false)
                observer.error('unable to load required query')
                return;     
            }

            this.logService.log('executing JSOM query for function: getListXml', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let resultMsg = `successfully executed query to load schemaXml for function getListXml on list ${listName}`
                this.logService.log(resultMsg, this._success, true);
                //observer.next(resultMsg);
                try {
                    this.logService.log(`attempting to load schemaXml query for function getListXml`, this._info, true);
                    let schema = list.get_schemaXml();
                    let result:ISchemaListResult = { apiCall: 'getListXml', listName: listName, result: true, schemaXml: schema }
                    observer.next(result);
                    observer.complete()
                    return;
                } catch (e) {
                    this.logService.log('unable to load required query', this._error, false)
                    this.logService.log(e, this._error, false)
                    observer.error('unable to load required query')
                    return;                     
                }
            }

            function failure(sender, args) {
                let resultMsg = `Failed to execute query to getListXml for list: ${listName}`;
                let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
                //observer.next(result);
                let result:ISchemaListResult = { apiCall: 'getListXml', listName: listName, result: false, schemaXml: '' }
                this.logService.log(resultMsg, this._error, false);
                this.logService.log(apiResult, this._error, false);
                observer.complete()
                return;                     
            }                            
        })
        return getListXml$
    }

addListFields(listName:string,fieldXml:Array<string>, contextType:string):Observable<any>{
    this.logService.log('addField function called', this._info, true);
    this.logService.log(`addField parameter: ${listName}.  contextType parameter: ${contextType}`, this._info, true);
    let addListField$ = new Observable((observer:Observer<any>) => {
        observer.next('addField to list function called');

        if (!this.uiStateService.getUiState('manageList')) {
            let permissionMsg = `user does not have permissions to create lists`
            this.logService.log(permissionMsg, this._error, false);
            observer.error(permissionMsg); 
            return;
        }
        let clientContext
        try {
            clientContext = new SP.ClientContext(this.appUrl);
        } catch (e) {
            this.logService.log(`unable to create clientContext`, this._error, false);
            this.logService.log(e, this._error, false);
            observer.error(`unable to create clientContext`)
            return;
        }
            
        let context; 

        if (contextType == this.utilsService.hostWeb) {
            this.logService.log('contextType == this.utils.hostweb', this._info, true);
            try {
                context = new SP.AppContextSite(clientContext, this.hostUrl);
            } catch (e) {
                this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create hostweb clientContext`)
                return;
            }
        
        } else if (contextType == this.utilsService.appWeb){
            this.logService.log('contextType = appWeb', this._info, true)
            context = clientContext;
        } else {
            this.logService.log('unable to determine context type: addField to list', this._error, false)
            observer.error('unable to determine context type: Add field to list')
            return;
        }
        
        let oList;
        try {
            oList = context.get_web().get_lists().getByTitle(listName)
        } catch (e) {
            this.logService.log('unable to load list', this._error, false)
            this.logService.log(e, this._error, false);
            observer.error('unable to load list'); 
            return;             
        }

        let fieldSpecArray;
        try {
            this.logService.log('loading field definitions', this._info, true);
            //create field definitions
            fieldXml.forEach((value, index, array)=>{
                oList.get_fields().addFieldAsXml(value, true, SP.AddFieldOptions.defaultValue);
            })
            oList.update();
        } catch (e) {
            this.logService.log('unable to load field definition', this._error, false)
            this.logService.log(e, this._error, false);
            observer.error('unable to load field definition');
            return;
        }

        observer.next('attempting to execute JSOM query: list creation')
        this.logService.log('executing JSOM query: list creation', this._info, true);
        clientContext.load(oList);
        clientContext.executeQueryAsync(onListCreateSucceeded.bind(this), onListCreateFailed.bind(this));

        function onListCreateSucceeded() {
            let result = 'field/s added to list' + listName;
            observer.next(result);
            this.logService.log(result, this._success, false);
            observer.complete();
            return;     
        }

        function onListCreateFailed(sender, args) {
            let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            observer.next(result);
            this.logService.log(result, this._error, false);
            observer.complete();
            return;
        }
    })

    return addListField$

    }    
}