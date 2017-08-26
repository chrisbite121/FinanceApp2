import { Injectable } from '@angular/core'
import { LogService } from './log.service'
import { ListService } from './list.service'

import { UtilsService } from './utils.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

import {    IFieldExists,
            IFieldUpdateResult,
            IListExists,
            IFieldSchemaReportResult,
            IListSchemaReportResult,
            IItemPropertyModel,
            IUpdateItemResult,
            IDeleteItemResult,
            ICreateListResult,
            IReportResult,
            IReportItemResult,
            IReadFieldResult,
            IReadListResult,
            IGetItemsResult,
            IAddItemResult } from '../model/data-validation.model'


declare var SP;
declare var hostUrl;
declare var appUrl;


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
                private utilsService: UtilsService){

            try{
                this.hostUrl = hostUrl;
            } catch (e) {
                this.logService.log(e, this._error, false);
            }

            try{
                this.appUrl = appUrl;
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
                    let result =    `permissions breakdown for list: ${listName}: <br/>
                                    User has Manager Web permissions: ${manageWeb}, <br/> 
                                    User has Manage List permissions: ${manageList}, <br/>
                                    User has View List permissions: ${viewList}, <br/>
                                    User has Add List Item permissions: ${addListItems}`
                    this.logService.log(result, this._success, false);
                    observer.next(result);

                    let permissions = {
                        apiCall: this.utilsService.apiCallGetPermissions,
                        listName: listName,
                        result: true,
                        manageWeb: manageWeb,
                        viewList: viewList,
                        addListItems: addListItems
                    }

                    observer.next(permissions)

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
           
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                let errmsg = `Unable to create client context`
                this.logService.log(errmsg, this._error, false);

                let reportResult:IReportResult = {
                    reportHeading: this.utilsService.apiCallDeleteList,
                    reportResult: this.utilsService.errorStatus,
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                }
                observer.next(reportResult)

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
                    apiCall: this.utilsService.apiCallDeleteList,
                    listName: listName,
                    result: true
                }
                observer.next(result);

                let reportResult:IReportResult = {
                    reportHeading: this.utilsService.apiCallDeleteList,
                    reportResult: this.utilsService.successStatus,
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                }
                observer.next(reportResult)


                observer.complete();
                return;
            }

            function failure(sender, args) {
                let resultMsg = 'Request Failed. ' + args.get_message() + '<br/>' + args.get_stackTrace();
                this.logService.log(resultMsg, this._error, false);
                let result = {
                    apiCall: this.utilsService.apiCallDeleteList,
                    listName: listName,
                    result: false
                }
                observer.next(result)

                let reportResult:IReportResult = {
                    reportHeading: this.utilsService.apiCallDeleteList,
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                }
                observer.next(reportResult)

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

            let reportResult = {
                reportHeading: this.utilsService.apiCallCreateList,
                reportResult: this.utilsService.errorStatus,
                description: `error creating list - ${listName}`,
                fieldName: this.utilsService.NaStatus,
            }
            observer.next(reportResult)

            observer.error('unable to load field definition');
            return;
        }

        //observer.next('attempting to execute JSOM query: list creation')
        this.logService.log('executing JSOM query: list creation', this._info, true);
        clientContext.load(listInfo);
        clientContext.executeQueryAsync(onListCreateSucceeded.bind(this), onListCreateFailed.bind(this));

        function onListCreateSucceeded() {
            let result: ICreateListResult = {
                apiCall: this.utilsService.apiCallCreateList,
                listName: listName,
                result: true   
            };
            observer.next(result);

            let reportResult = {
                reportHeading: this.utilsService.apiCallCreateList,
                reportResult: this.utilsService.successStatus,
                description: `success creating list - ${listName}`,
                fieldName: this.utilsService.NaStatus,
            }
            observer.next(reportResult)

            this.logService.log(listName + 'list created', this._success, false);
            observer.complete();
            return;     
        }

        function onListCreateFailed(sender, args) {
            let resultMsg = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            
            let result: ICreateListResult = {
                apiCall: this.utilsService.apiCallCreateList,
                listName: listName,
                result: false
            };            
            observer.next(result);

            let reportResult = {
                reportHeading: this.utilsService.apiCallCreateList,
                reportResult: this.utilsService.failStatus,
                description: `failed creating list - ${listName}`,
                fieldName: this.utilsService.NaStatus,
            }
            observer.next(reportResult)

            this.logService.log(resultMsg, this._error, false);
            observer.complete();
            return;
        }
    })

    return createList$

}

addField(listName:string, contextType:string, fieldDefinition:string, fieldType: string):Observable<any>{
    this.logService.log('creatList function called', this._info, true);
    this.logService.log(`listName parameter: ${listName}.  contextType parameter: ${contextType}`, this._info, true);
    let createList$ = new Observable((observer:Observer<any>) => {

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

        let oWebsite, list, field, newField;

        try {
            list = context.get_web().get_lists().getByTitle(listName)

        } catch(e) {
            this.logService.log('unable to load list', this._error, false)
            this.logService.log(e, this._error, false);
            observer.error('unable to load create and define base list creation Info'); 
            return;                       
        }
        let spFieldType;
        try {
            this.logService.log('loading field definition', this._info, true);
            field = list.get_fields().addFieldAsXml(fieldDefinition, true, SP.AddFieldOptions.defaultValue)
            
            fieldType = fieldType.toLowerCase()

            switch (fieldType) {
                case 'text':
                    spFieldType = SP.FieldText
                break;
                case 'number':
                    spFieldType = SP.FieldNumber
                break
                default:
                    spFieldType = SP.FieldText
                break
            }

            newField = clientContext.castTo(field, spFieldType)
            newField.update()
        } catch (e) {
            this.logService.log('unable to load field definition', this._error, false)
            this.logService.log(e, this._error, false);

            let fieldName = fieldDefinition.match(/Name="[a-zA-Z]*"/)[0]
            if(typeof fieldName == 'string' && fieldName.length > 6) {
                fieldName = fieldName.substring(5,-1)
            }

            let reportResult: IReportResult = {
                reportHeading: this.utilsService.apiCallAddField,
                reportResult: this.utilsService.errorStatus,
                listName: listName,
                fieldName: fieldName? fieldName : 'unknown'
            }
            observer.next(reportResult)

            observer.error('unable to load field definition');
            return;
        }

        this.logService.log('executing JSOM query: field update', this._info, true);
        clientContext.load(field);
        clientContext.executeQueryAsync(onListCreateSucceeded.bind(this), onListCreateFailed.bind(this));

        function onListCreateSucceeded() {
            let result = {
                apiCall: this.utilsService.apiCallAddField,
                fieldDefinition: fieldDefinition,
                listName: listName,
                result: true   
            };
            observer.next(result);

            let reportResult: IReportResult = {
                reportHeading: this.utilsService.apiCallAddField,
                reportResult: this.utilsService.successStatus,
                listName: listName,
                fieldName: this.utilsService.NaStatus,
            }
            observer.next(reportResult)

            this.logService.log(listName + 'list created', this._success, false);
            observer.complete();
            return;     
        }

        function onListCreateFailed(sender, args) {
            let resultMsg = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            
            let result: ICreateListResult = {
                apiCall: this.utilsService.apiCallAddField,
                listName: listName,
                result: false
            };            
            observer.next(result);

            let reportResult: IReportResult = {
                reportHeading: this.utilsService.apiCallAddField,
                reportResult: this.utilsService.failStatus,
                listName: listName,
                fieldName: this.utilsService.NaStatus,
            }
            observer.next(reportResult)

            this.logService.log(resultMsg, this._error, false);
            observer.complete();
            return;
        }
    })

    return createList$

    }

    listExists(listName:string, contextType:string):Observable<any>{
        this.logService.log('check list Exists function called', this._info, true);

        let listExists$ = new Observable((observer:Observer<any>) => {

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
            this.logService.log('unable to determine context type: List Exists failed', this._error, false)
            observer.error('unable to determine context type: List Exists failed')
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
            //observer.next('attempting to execute JSOM query: check list exists')
            this.logService.log('executing JSOM query: check list exists', this._info, true);
            
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let reportResult: string = this.utilsService.failStatus
                let listFlag = false
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
                        if (oList.get_title() == listName) {
                            //set report result to success if exists
                            reportResult = this.utilsService.successStatus;
                            listFlag = true
                        }
                    } catch (e) {
                        this.logService.log('error encountered iterating through fields', this._error, false);
                        this.logService.log(e, this._error, false);
                        this.utilsService.errorStatus

                        let result = {
                            reportHeading: this.utilsService.apiCallListExists,
                            reportResult: this.utilsService.errorStatus,
                            listName: listName,
                            fieldName: this.utilsService.NaStatus
                        }
                        observer.next(result);

                        observer.error('error encountered iterating through fields');  
                        return;                          
                    }
                }
                
                let reportData  = {
                    reportHeading: this.utilsService.apiCallListExists,
                    listName: listName,
                    reportResult: reportResult,
                    description: `list ${listName} exists - : ${listFlag}`,
                }

                observer.next(reportData);
                
                let result = {
                    apiCall: this.utilsService.apiCallListExists,
                    listName: listName,
                    result: true,
                    listExists: listFlag
                }

                observer.next(result);

                this.logService.log(result, this._success, false);
                
                observer.complete()
                return;
               
            }

            function failure(sender, args) {
                let result: IReportResult = {
                    reportHeading: this.utilsService.apiCallListExists,
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                 }

                observer.next(result);


                let resultMsg = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
                this.logService.log(resultMsg, this._error, false);
                
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
                        let oField, oTitle, oInternalName, oTypeKind, oRequired, oReadOnly;
                        if (typeof fieldEnumerator.get_current == 'function') {
                            oField = fieldEnumerator.get_current();
                            if(typeof oField.get_title == 'function'){
                                oTitle = oField.get_title()
                                this.logService.log(oTitle, this._info, true);
                            }

                            if (typeof oField.get_internalName == 'function') {
                                oInternalName = oField.get_internalName()
                            }

                            if (typeof oField.get_fieldTypeKind == 'function') {
                                oTypeKind = oField.get_fieldTypeKind()
                            }

                            if (typeof oField.get_required == 'function') {
                                oRequired = oField.get_required()
                            }

                            if (typeof oField.get_readOnlyField == 'function') {
                                oReadOnly = oField.get_readOnlyField()
                            }
                        }
                        
                        let result = 
                            {
                                listName: listName,
                                fieldTitle: oTitle,
                                internalName: oInternalName,
                                type: oTypeKind,
                                required: oRequired,
                                readOnly: oReadOnly
                            }

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
                let apiResult = args.get_message() + ' -  STACKTRACE: ' + args.get_stackTrace();
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
                    result: fieldFlag
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
            
            let schemaObject:IReadFieldResult = {
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

                    let reportResult: IReportResult = {
                        reportHeading: this.utilsService.apiCallUpdateField,
                        reportResult: this.utilsService.errorStatus,
                        listName: listName,
                        fieldName: fieldName
                    }
                    observer.next(reportResult);

                    observer.error('unable to load required query')
                    return;                     
                }
                clientContext.load(field);
                this.logService.log('executing JSOM query for function: updateField', this._info, true);
                clientContext.executeQueryAsync(success1.bind(this), failure1.bind(this));

                function success1() {
                    let resultMsg = `Field: ${fieldName} in list: ${listName} updated successfully`;

                    let result: IFieldUpdateResult = {
                        apiCall: this.utilsService.apiCallUpdateField,
                        listName: listName,
                        fieldName: fieldName,
                        result: true
                    }
                    observer.next(result);

                    let reportResult: IReportResult = {
                        reportHeading: this.utilsService.apiCallUpdateField,
                        reportResult: this.utilsService.successStatus,
                        listName: listName,
                        fieldName: fieldName
                    }
                    observer.next(reportResult);


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
                        apiCall: this.utilsService.apiCallUpdateField,
                        listName: listName,
                        fieldName: fieldName,
                        result: true
                    }
                    observer.next(result);

                    let reportResult: IReportResult = {
                        reportHeading: this.utilsService.apiCallUpdateField,
                        reportResult: this.utilsService.successStatus,
                        listName: listName,
                        fieldName: fieldName
                    }
                    observer.next(reportResult);                    
                    
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
        //this.logService.log('Add Item funtion called', this._info, true);
        //this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}, itemValues parameters: ${itemValues}`, this._info, true);

        let addItem$ = new Observable((observer:Observer<any>) => {

            let clientContext, context, list, itemCreateInfo, listItem, itemId;

            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.error(`unable to create clientContext`)
                return;
            }
            
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
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: Create List failed', this._error, false)
                observer.error('unable to determine context type: Create List failed')
                return;
            }

            try {
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
                this.logService.log(`adding field to list ${listName} with values...`, this._info, true)
                itemValues.forEach(element => {
                    if (element.fieldName == 'ItemId') {
                        itemId = element.fieldValue
                    }
                    this.logService.log(String(element.fieldName) + ': ' + String(element.fieldValue), this._info, true);
                    listItem.set_item(element.fieldName, element.fieldValue);

                });
                
            } catch (e) {
                this.logService.log('error setting list item definition for function: addItem', this._error, false);
                observer.error('error setting list item definition for function: addItem')
                return;
            }


            try {
                listItem.update();
                clientContext.load(listItem);
            } catch (e) {
                this.logService.log(`unable to load list item in function: addItem in list ${listItem}`)
                this.logService.log(e,this._error, false);
                observer.error(`unable to load list item in function: addItem in list ${listItem}`);
                return;
            }
            
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let ID = listItem.get_id();
                let resultMsg = `Item successfully created in List: ${listName} with ID ${ID}`
                
                let result:IAddItemResult = {
                    apiCall: this.utilsService.apiCallAddItem,
                    listName: listName,
                    itemId: itemId,
                    ID: ID,
                    result: true
                }
                observer.next(result);

                let reportResult = {
                    reportHeading: this.utilsService.apiCallAddItem,
                    reportResult: this.utilsService.successStatus,
                    listName: listName,
                    itemId: itemId,
                    ID: ID,
                    itemValues: itemValues
                }
                observer.next(reportResult)                

                this.logService.log(resultMsg, this._success, true);
                observer.complete()
                return;                
            }

            function failure(sender, args) {
                let apiResult = 'Request Failed. ' + args.get_message() + '.  StackTrace: ' + args.get_stackTrace();
                let resultMsg = `Request failed to addItem to list ${listName}`

                console.log(itemId);
                let result:IAddItemResult = {
                    apiCall: this.utilsService.apiCallAddItem,
                    listName: listName,
                    itemId: itemId,
                    ID: null,
                    result: false
                }
                observer.next(result);                

                let reportResult:IReportItemResult = {
                    reportHeading: this.utilsService.apiCallAddItem,
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    itemValues: itemValues
                }
                observer.next(reportResult)                   


                this.logService.log(resultMsg, this._error, false);
                this.logService.log(apiResult, this._error, false);
                observer.complete()
                return;
            }            
        })
        return addItem$
    }

    addItems(listName: string, contextType: string, items: Array<Array<IItemPropertyModel>>): Observable<any>{
        this.logService.log('Add Item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}, number of items ${items.length}`, this._info, true);

        let addItem$ = new Observable((observer:Observer<any>) => {

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

            
            let list = context.get_web().get_lists().getByTitle(listName);
            //iterate through items to be added
            items.forEach(item => {

                let itemCreateInfo, listItem
                try {
                    this.logService.log('setting up itemCreationInformation object for function: addItems', this._info, true);
                    itemCreateInfo = new SP.ListItemCreationInformation();
                    listItem = list.addItem(itemCreateInfo);
                } catch (e) {
                    this.logService.log('error setting up itemCreationInformation object for function: addItem', this._error, false);
                    this.logService.log(e,this._error, false);
                    observer.error('error setting up itemCreationInformation object for function: addItem')
                    return;
                }
                
                try {
                    this.logService.log('defining list item for function: addItems', this._info, true);
                    
                    //iterate through the field values for each item
                    item.forEach(element => {
                        listItem.set_item(element.fieldName, element.fieldValue);
                        listItem.update();
                        context.load(listItem);
                    });
                    
                } catch (e) {
                    this.logService.log('error setting list item definition for function: addItems', this._error, false);
                    observer.error('error setting list item definition for function: addItem')
                    return;
                }
            })
            
            this.logService.log('executing JSOM query for function: addItems', this._info, true);
            clientContext.executeQueryAsync(success.bind(this), failure.bind(this));

            function success() {
                let resultMsg = `Item successfully created in List: ${listName}`
                let result = {
                    apiCall: this.utilsService.apiCallAddItems,
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
                    apiCall: this.utilsService.apiCallAddItems,
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

    updateItem(listName: string, contextType: string, ID: string, itemValues: Array<IItemPropertyModel>): Observable<any>{
        this.logService.log('Update Item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType parameter: ${contextType}, ID parameter: ${ID}`)
        this.logService.log(`updaing field to list ${listName} with values...`, this._info, true)
        itemValues.forEach(element => {
            this.logService.log(String(element.fieldName) + ': ' + String(element.fieldValue), this._info, true);
        })

        let updateItem$ = new Observable((observer:Observer<any>) => {

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
                listItem = list.getItemById(ID);
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
                // let currentID = listItem.get_id();

                let resultMsg =`updated item successfully on list ${listName} with ID ${ID}`;
                let result:IUpdateItemResult = {
                    apiCall: this.utilsService.apiCallUpdateItem,
                    listName: listName,
                    ID: ID,
                    result: true
                }
                observer.next(result);

                let reportResult = {
                    reportHeading: this.utilsService.apiCallUpdateItem,
                    reportResult: this.utilsService.successStatus,
                    description: resultMsg,
                    listName: listName,
                    itemValues: itemValues
                }
                observer.next(reportResult)

                this.logService.log(resultMsg, this._success, false);
                observer.complete();
                return;
            }

            function failure(sender, args) {
                //let ID = listItem.get_id();

                let apiResult = 'Failed to UPDATE ITEM: ' + args.get_message() + '  ' + args.get_stackTrace();
                this.logService.log(apiResult, this._error, false);

                let resultMsg = `Request failed to updateItem to list ${listName} with ID ${ID}`
                this.logService.log(resultMsg, this._error, false);

                let result:IUpdateItemResult = {
                    apiCall: this.utilsService.apiCallUpdateItem,
                    listName: listName,
                    ID: null,
                    result: false
                }
                observer.next(result);
                
                let reportResult = {
                    reportHeading: this.utilsService.apiCallUpdateItem,
                    reportResult: this.utilsService.failStatus,
                    description: resultMsg,
                    listName: listName,
                    itemValues: itemValues
                }
                observer.next(reportResult)

                observer.complete();
                return;                
            }            
        })
        return updateItem$
    }

    getItem(listName: string, queryString: string, contextType: string, include?: string): Observable<any>{
        this.logService.log('Get Item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, queryString parameter: ${queryString}, contextType parameter: ${contextType}`)

        let getItem$ = new Observable((observer:Observer<any>) => {
            
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
                this.logService.log('unable to determine context type: get item failed', this._error, false)
                observer.error('unable to determine context type: get item failed');
                return;
            }            
            
            let web, list, query, listItems;
            try {
                web = context.get_web();
                list = web.get_lists().getByTitle(listName);
                query = new SP.CamlQuery();
                query.set_viewXml(queryString);
                listItems = list.getItems(query);

                if (include) {
                    clientContext.load(listItems, include);
                } else {
                    clientContext.load(listItems);
                }

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
            
                let resultArry:Array<Object> = [];

                while (listItemEnumerator.moveNext()) {
                    let result, oListItem;
                    try {
                        oListItem = listItemEnumerator.get_current();
                        result = oListItem.get_fieldValues()

                        resultArry.push(result);
                        this.logService.log(result, this.utilsService.infoStatus, true);
                    } catch (e) {
                        this.logService.log(e, this._error, false);
                        observer.error(e);                    
                    }
                }

                let reportResult = {
                    reportHeading: this.utilsService.apiCallGetItem,
                    reportResult: this.utilsService.successStatus,
                    descrption: 'item retrieved successfully',
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                }
                observer.next(reportResult)
                
                let result: IGetItemsResult = {
                    apiCall: this.utilsService.apiCallGetItem,
                    listName: listName,
                    result: true,
                    data: resultArry
                }
                observer.next(result)
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

    getItems(listName: string, contextType: string, include?: string, camlQueryString?: string): Observable<any>{
        this.logService.log('Get Items funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, contextType paramter: ${contextType}`)

        let getItems$ = new Observable((observer:Observer<any>) => {
            observer.next({
                functionCall: 'getItems',
                message: `get items function called on list ${listName}`
            });
            
            let clientContext
            try {
                clientContext = new SP.ClientContext(this.appUrl);
            } catch (e) {
                this.logService.log(`unable to create clientContext`, this._error, false);
                this.logService.log(e, this._error, false);
                observer.next({
                    reportHeading: 'getItems',
                    reportResult: this.utilsService.errorStatus,
                    listName: listName,
                    message: `unable to create clientContext on list ${listName}`
                });
                observer.complete()
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
                    observer.next({
                        reportHeading: 'getItems',
                        reportResult: this.utilsService.errorStatus,
                        listName: listName,
                        message: `unable to create hostweb clientContext on list ${listName}`
                    });
                    observer.complete()
                    return;
                }
            
            } else if (contextType == this.utilsService.appWeb){
                this.logService.log('contextType = appWeb', this._info, true)
                context = clientContext;
            } else {
                this.logService.log('unable to determine context type: get items failed', this._error, false)
                observer.next({
                    reportHeading: 'getItems',
                    reportResult: this.utilsService.errorStatus,
                    listName: listName,
                    message: `unable to determine context type: get items failed on list ${listName}`
                });
                observer.complete()
                return;
            }

            let web, list, camlQuery, items
            try {
                web = context.get_web();
                list = web.get_lists().getByTitle(listName);
                camlQuery = new SP.CamlQuery();
                if(camlQueryString) {
                    try {
                        camlQuery.set_viewXml(camlQueryString)
                    } catch (e) {
                        this.logService.log(JSON.stringify(e), this._error, false)
                    }
                }
                
                items = list.getItems(camlQuery);

                if (include) {
                    clientContext.load(items, include);
                } else {
                    clientContext.load(items);
                }
                
            } catch (e) {
                this.logService.log('error loading context information for function getItems', this._error, false);
                this.logService.log(JSON.stringify(e),this._error, false);
                observer.next({
                    reportHeading: 'getItems',
                    reportResult: this.utilsService.errorStatus,
                    listName: listName,
                    message: `error loading context information for function getItems on list ${listName}`
                });
                observer.complete()                
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
                    observer.next({
                        reportHeading: 'getItems',
                        reportResult: this.utilsService.errorStatus,
                        listName: listName,
                        message: errmsg
                    });
                    observer.complete()     
                    return;
                }
                let oItem, fieldValues;
                let resultArry = [];                
                while (itemEnumerator.moveNext()) {

                    try{
                        oItem = itemEnumerator.get_current();
                        // note get_fieldValues returns json object
                        fieldValues = oItem.get_fieldValues();
                        this.logService.log(fieldValues, this.utilsService.infoStatus, true);
                        resultArry.push(fieldValues);


                    } catch (e) {
                        this.logService.log(`error occured while iterating through list items on list ${listName}`, this._error, false);
                        this.logService.log(e, this._error, false);

                        let reportResult: IReportResult = {
                            reportHeading: this.utilsService.apiCallGetItems,
                            reportResult: this.utilsService.errorStatus,
                            listName: listName,
                            fieldName: this.utilsService.NaStatus
                        }
                        observer.next(reportResult)

                        observer.complete();
                        return;
                    }
                }

                let reportResult: IReportResult = {
                    reportHeading: this.utilsService.apiCallGetItems,
                    reportResult: this.utilsService.successStatus,
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                }
                observer.next(reportResult)
                
                let result: IGetItemsResult = {
                    apiCall: this.utilsService.apiCallGetItems,
                    listName: listName,
                    result: true,
                    data: resultArry
                }
                observer.next(result)

                observer.complete();
            }

            function failure(sender, args) {
                let result = 'Request Failed to get items, message from api: ' + args.get_message();

                let reportResult: IReportResult = {
                    reportHeading: this.utilsService.apiCallGetItems,
                    reportResult: this.utilsService.errorStatus,
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                }
                observer.next(reportResult)

                this.logService.log(result, this._error, false);
                observer.complete();
                
                return;
            }            
        })
        return getItems$ 
    }

    deleteItem(listName: string, ID: number, contextType: string):Observable<any>{
        this.logService.log('delete item funtion called', this._info, true);
        this.logService.log(`listName parameter: ${listName}, itemId parameter: ${ID}, contextType parameter: ${contextType}`)

        let deleteItem$ = new Observable((observer:Observer<any>) => {

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
                listItem = web.get_lists().getByTitle(listName).getItemById(ID);
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
                let ID = listItem.get_id();
                let resultMsg = `Item with item id ${ID} deleted successfully on list: ${listName}`
                let result: IDeleteItemResult = {
                    apiCall: this.utilsService.apiCallDeleteItem,
                    listName: listName,
                    ID: ID,
                    result: true
                }
                observer.next(result);

                let reportResult = {
                    reportHeading: this.utilsService.apiCallDeleteItem,
                    reportResult: this.utilsService.successStatus,
                    listName: listName,
                    ID: ID
                }
                observer.next(reportResult)

                this.logService.log(resultMsg, this._success, false);
                observer.complete();
                return;         
            }


            function failure(sender, args) {
                let resultMsg = `Failed to delete item ${ID} on list ${listName}` + args.get_message() + ' <br/> ' + args.get_stackTrace()
                let result: IDeleteItemResult = {
                    apiCall: this.utilsService.apiCallDeleteItem,
                    listName: listName,
                    ID: null,                                    
                    result: false
                }                
                observer.next(result);

                let reportResult = {
                    reportHeading: this.utilsService.apiCallDeleteItem,
                    reportResult: this.utilsService.failStatus,
                    listName: listName
                }
                observer.next(reportResult)

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
                this.logService.log('contextType = host web', this._info, true);
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

                let reportResult:IListSchemaReportResult = {
                    reportHeading: this.utilsService.apiCallListXmlData,
                    reportResult: this.utilsService.errorStatus,
                    listName: listName,
                    schemaXml: ''
                }
                observer.next(reportResult)

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
                    
                    let result:IReadListResult = { 
                        apiCall: this.utilsService.apiCallListXmlData, 
                        listName: listName, 
                        result: true, 
                        schemaXml: schema 
                    }
                    observer.next(result);
                    
                    let reportResult:IListSchemaReportResult = {
                        reportHeading: this.utilsService.apiCallListXmlData,
                        reportResult: this.utilsService.successStatus,
                        listName: listName,
                        schemaXml: schema                      
                    }
                    observer.next(reportResult)
                    
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

                let result:IReadListResult = { 
                    apiCall: 'getListXml', 
                    listName: listName, 
                    result: false, 
                    schemaXml: '' 
                }
                observer.next(result);

                let reportResult:IListSchemaReportResult = {
                    reportHeading: this.utilsService.apiCallListXmlData,
                    reportResult: this.utilsService.failStatus,
                    listName: listName,
                    schemaXml: ''
                }
                observer.next(reportResult)

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

            let reportResult: IReportResult = {
                reportHeading: this.utilsService.apiCallAddFields,
                reportResult: this.utilsService.errorStatus,
                listName: listName,
                fieldName: this.utilsService.NaStatus
            }
            observer.next(reportResult)

            observer.error('unable to load field definition');
            return;
        }

        observer.next('attempting to execute JSOM query: list creation')
        this.logService.log('executing JSOM query: list creation', this._info, true);
        clientContext.load(oList);
        clientContext.executeQueryAsync(onListCreateSucceeded.bind(this), onListCreateFailed.bind(this));

        function onListCreateSucceeded() {
            let resultMsg = 'field/s added to list' + listName;
            
            let reportResult: IReportResult = {
                reportHeading: this.utilsService.apiCallAddFields,
                reportResult: this.utilsService.successStatus,
                listName: listName,
                fieldName: this.utilsService.NaStatus
            }
            observer.next(reportResult)

            this.logService.log(resultMsg, this._success, false);
            observer.complete();
            return;     
        }

        function onListCreateFailed(sender, args) {
            let resultMsg = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            
            this.logService.log(resultMsg, this._error, false);

            let reportResult: IReportResult = {
                reportHeading: this.utilsService.apiCallAddFields,
                reportResult: this.utilsService.failStatus,
                listName: listName,
                fieldName: this.utilsService.NaStatus
            }
            observer.next(reportResult)


            observer.complete();
            return;
        }
    })

    return addListField$

}

getItemCount(listName: string, contextType: string): Observable<any>{
        this.logService.log('Get Item Count funtion called', this._info, true);

        let getItem$ = new Observable((observer:Observer<any>) => {

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
                messageSuccess = `executed query successfully for function getItem Count on list ${listName}`
                this.logService.log(messageSuccess, this._success, true);

                try {
                    listItemCount = String(listItems.get_count());
                } catch (e){
                    this.logService.log(e, this._error, false);
                    observer.error(JSON.stringify(e)); 
                    return;                  
                }
            
                let reportResult: IReportResult = {
                    reportHeading: this.utilsService.apiCallGetItemCount,
                    reportResult: this.utilsService.successStatus,
                    listName: listName,
                    fieldName: this.utilsService.NaStatus
                }
                observer.next(reportResult)
                
                let result: IGetItemsResult = {
                    apiCall: this.utilsService.apiCallGetItemCount,
                    listName: listName,
                    result: true,
                    data: listItemCount
                }
                observer.next(result)
                observer.complete();
            }

            function failure(sender, args) {
                let apiResult = 'Request Failed to get items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace()
                let result = `failed to execute query for getItem Count on list: ${listName}`
                observer.next(result);
                this.logService.log(result, this._error, false);
                this.logService.log(apiResult, this._error, false);
                observer.complete(); 
                return;
            }            
        })
        return getItem$
        
    }

}