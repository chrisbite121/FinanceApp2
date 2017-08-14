// import { Injectable } from '@angular/core'
// import { LogService } from './log.service'
// import { ListService } from './list.service'
// import { UiStateService } from './ui-state.service'

// import { UtilsService } from './utils.service'

// import { Observable } from 'rxjs/Rx';
// import { Observer } from 'rxjs/Observer';

// declare var SP;
// declare var hostUrl;
// declare var appUrl;

// export interface IItemPropertyModel {
//     fieldName: string,
//     fieldValue: any
// }

// @Injectable()
// export class CommonApiService {
//     private _listDescription: string = 'Finance App List'
//     private hostUrl:string = '';
//     private appUrl:string = '';
//     private _error:string = 'error';
//     private _success:string = 'success';
//     private _info: string = 'info';

//     constructor(private logService: LogService,
//                 private listService: ListService,
//                 private utilsService: UtilsService,
//                 private uiStateService: UiStateService
//             ){

//                     this.hostUrl = hostUrl;
//                     this.appUrl = appUrl;

//                 }

//     getPermissions(contextType:string, listName:string):Observable<any>{
//         this.logService.log('Get permissions function called', this._info, true);
//         let permissions$ = new Observable(observer => {
//                 let clientContext = new SP.ClientContext.get_current();
//                 let context;

//                 if (contextType == this.utilsService.hostWeb) {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } else if (contextType == this.utilsService.appWeb){
//                     context = clientContext;
//                 } else {
//                     this.logService.log('unable to determine context type: Create List failed', this._error, false)
//                     observer.error('unable to determine context type: Create List failed')
//                 }

//                 let oList = context.get_web().get_lists().getByTitle(listName);

//                 context.load(oList, 'EffectiveBasePermissions');
//                 this.logService.log('executing JSOM query', this._info, true);
//                 context.executeQueryAsync(success, failure);

//                 function success(){
//                     let perms = oList.get_effectiveBasePermissions();
//                     let manageWeb = perms.has(SP.PermissionKind.manageWeb);
//                     let manageList = perms.has(SP.PermissionKind.manageList);
//                     let viewList = perms.has(SP.PermissionKind.viewListItems);
//                     let addListItems = perms.has(SP.PermissionKind.addListItems);
//                     let result =    `User has Manager Web permissions: ${manageWeb}, <br/> 
//                                     User has Manage List permissions: ${manageList}, <br/>
//                                     User has View List permissions: ${viewList}, <br/>
//                                     User has Add List Item permissions: ${addListItems}`
//                     this.logService.log(result, this._success, false);

//                     try {
//                         //update uiState
//                         this.uiStateService.updateUiState('manageWeb', manageWeb)
//                         this.uiStateService.updateUiState('manageList', manageList)
//                         this.uiStateService.updateUiState('viewList', viewList);
//                         this.uiStateService.updateUiState('addListItems', addListItems);
//                         this.logService.log('uiStateService updated with user permissions', this._info, true);
//                     } catch (e) { 
//                         this.logService.log("unable to update uiState with list permissions", this._error, false)
//                         this.logService.log(e, this._error, false);
//                         console.log(e);
//                     }


//                     observer.next(  {manageWeb: manageWeb, 
//                                     manageList: manageList,
//                                     viewList: viewList,
//                                     addListItems: addListItems});

//                     observer.complete();
//                 }   
//                 function failure(sender, args){
//                     let result = 'Request Failed. ' + args.get_message() + '<br/>' + args.get_stackTrace();
//                     this.logService.log(result, this._error, false);
//                     observer.next(result)
//                     observer.error(result);
//                 }         
//         })
//         return permissions$
//     }


//     deleteList(listName:string, contextType:string):Observable<any>{
//         this.logService.log('Delete list funtion called', this._info, true);
        
//          let deleteList$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('manageList')) {
//                 let errorMsg = `user does not have permissions to delete lists`
//                 this.logService.log(errorMsg, this._error, false);
//                 observer.error(errorMsg);
//             }
//             let clientContext = new SP.ClientContext.get_current();
//             let context;

//             if (contextType == this.utilsService.hostWeb) {
//                 context = new SP.AppContextSite(clientContext, this.hostUrl);
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: Create List failed', this._error, false)
//                 observer.error('unable to determine context type: Create List failed')
//             }

//             let oWebsite = context.get_web();

//             let financeList = oWebsite.get_lists().getByTitle(listName);
//             financeList.deleteObject();
//             this.logService.log('executing JSOM query', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let result = 'list deleted successfully'
//                 this.logService.log(result, this._info, false);
//                 observer.next(result);
//                 observer.complete();
//             }

//             function failure(sender, args) {
//                 let result = 'Request Failed. ' + args.get_message() + '<br/>' + args.get_stackTrace();
//                 this.logService.log(result, this._error, false);
//                 observer.next(result)
//                 observer.error(result);
//             }
//         })

//         return deleteList$   
// }

// createList(listName:string, contextType:string):Observable<any>{
//     this.logService.log('creatList function called', this._info, true);
//     this.logService.log(`listName parameter: ${listName}.  contextType parameter: ${contextType}`, this._info, true);
//     let createList$ = new Observable(observer => {
//         if (!this.uiStateService.getUiState('manageList')) {
//             let permissionMsg = `user does not have permissions to create lists`
//             this.logService.log(permissionMsg, this._error, false);
//             observer.error(permissionMsg); 
//         }
//         let clientContext
//         try {
//             clientContext = new SP.ClientContext(this.appUrl);
//         } catch (e) {
//             this.logService.log(`unable to create clientContext`, this._error, false);
//             this.logService.log(e, this._error, false);
//             observer.error(`unable to create clientContext`)
//         }
        
//         let context; 

//         if (contextType == this.utilsService.hostWeb) {
//             this.logService.log(`contextType == hostWeb`, this._info, true);
//             try {
//                 context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 console.log(context)
//             } catch (e) {
//                 this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create hostweb clientContext`)
//             }
        
//         } else if (contextType == this.utilsService.appWeb){
//             context = clientContext;
//         } else {
//             this.logService.log('unable to determine context type: Create List failed', this._error, false)
//             observer.error('unable to determine context type: Create List failed')
//         }
//         let oWebsite, listCreationInfo, listInfo;
//         try {
//             this.logService.log('shaping listCreationInfomation', this._info, true);
//             listCreationInfo = new SP.ListCreationInformation();
//             listCreationInfo.set_title(listName);
//             listCreationInfo.set_description(this._listDescription)
//             listCreationInfo.set_templateType(SP.ListTemplateType.genericList);
//             oWebsite = context.get_web();
//             listInfo = oWebsite.get_lists().add(listCreationInfo);
//         } catch(e) {
//             this.logService.log('unable to load create and define base list creation Info', this._error, false)
//             this.logService.log(e, this._error, false);
//             observer.error('unable to load create and define base list creation Info');                         
//         }
        
//         let fieldSpecArray;
//         try {
//             this.logService.log('loading field definitions', this._info, true);
//             //get field spec
//             fieldSpecArray = this.listService.getFields(listName);
//             //create field definitions
//             fieldSpecArray.forEach((value, index, array)=>{
//                 listInfo.get_fields().addFieldAsXml(value, true, SP.AddFieldOptions.defaultValue);
//             })
//         } catch (e) {
//             this.logService.log('unable to load field definition', this._error, false)
//             this.logService.log(e, this._error, false);
//             observer.error('unable to load field definition');
//         }

//         observer.next('attempting to execute JSOM query: list creation')
//         this.logService.log('executing JSOM query: list creation', this._info, true);
//         clientContext.load(listInfo);
//         clientContext.executeQueryAsync(onListCreateSucceeded.bind(this), onListCreateFailed.bind(this));

//         function onListCreateSucceeded() {
//             let result = listName + 'list created';
//             observer.next(result);
//             this.logService.log(result, this._success, false);
//             observer.complete();     
//         }

//         function onListCreateFailed(sender, args) {
//             let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
//             observer.next(result);
//             this.logService.log(result, this._error, false);
//             observer.complete();
//         }
//     })

//     return createList$

//     }

//     listExists(listName:string, contextType:string):Observable<any>{
//         this.logService.log('check list Exists function called', this._info, true);

//         let listExists$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('viewList')) {
//                 let permissionMsg = `user does not have permissions to check if list exists`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg)
//             }
//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: Create List failed', this._error, false)
//                 observer.error('unable to determine context type: Create List failed')
//             }
//             let web, listColl;

//             try {
//                 this.logService.log('shaping JSOM query', this._info, true);
//                 web = context.get_web();

//                 listColl = web.get_lists();
//                 context.load(listColl);
//             } catch (e) {
//                     this.logService.log('unable to load JSOM query', this._error, false)
//                     this.logService.log(e, this._error, false);
//                     observer.error('unable to load JSOM query');                    
//             }
//             observer.next('attempting to execute JSOM query: check list exists')
//             this.logService.log('executing JSOM query: check list exists', this._info, true);
            
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let listFlag = false;
//                 let listEnumerator;
//                 try {
//                     listColl.getEnumerator();
//                 } catch (e) {
//                     this.logService.log('unable to create field Enumerator', this._error, false);
//                     observer.error('unable to create fieldEnumerator');                        
//                 }
                

//                 while (listEnumerator.moveNext()) {
//                     let oList;
//                     try {
//                         oList = listEnumerator.get_current();
//                         console.log(oList.get_title());
//                         if (oList.get_title() == listName) {
//                             listFlag = true;
//                         }
//                     } catch (e) {
//                         this.logService.log('error encountered iterating through fields', this._error, false);
//                         this.logService.log(e, this._error, false);
//                         observer.error('error encountered iterating through fields');                            
//                     }
//                 }

//                 if (listFlag) {
//                     let result = `List: ${listName} exists`
//                     this.logService.log(result, this._success, false);
//                     observer.next(result);
//                     observer.complete()
//                 } else {
//                     let result = `List: ${listName} does not exist`
//                     this.logService.log(result, this._error, false);
//                     observer.next(result);
//                     observer.complete();
//                 }
//             }

//             function failure(sender, args) {
//                 let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
//                 this.logService.log(result, this._error, false);
//                 observer.next(result);
//                 observer.complete();
//             }
//         })
//         return listExists$
//     }

//     readFields(listName:string, contextType:string):Observable<any>{
//         this.logService.log('Read fields funtion called', this._info, true);
      
//         let readFields$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('viewList')) {
//                 let permissionMsg = `user does not have permissions to read list fields`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }

//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, `error`, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, `error`, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: ReadField failed', this._error, false)
//                 observer.error('unable to determine context type: ReadField failed')
//             }
//             let web, fields;
//             try {
//                 this.logService.log('shaping JSOM query', this._info, true);
//                 web = context.get_web();
//                 fields = web.get_lists().getByTitle(listName).get_fields();
//                 context.load(fields);
//             } catch (e) {
//                 this.logService.log('unable to load required query', this._error, false)
//                 this.logService.log(e, this._error, false);
//                 observer.error('unable to load required query')
//             }
//             observer.next('attempting to execute JSOM query: read fields')
//             this.logService.log('executing JSOM query: read fields', this._info, true);                 
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let fieldEnumerator;
//                 try {
//                     fieldEnumerator = fields.getEnumerator();
//                 } catch (e) {
//                     this.logService.log('unable to create field Enumerator', this._error, false);
//                     observer.error('unable to create fieldEnumerator');
//                 }                    
//                 while (fieldEnumerator.moveNext()) {
//                     try {
//                         let oField = fieldEnumerator.get_current();
//                         this.logService.log(oField.get_title(), this._info, true);
//                         let result = 'Field title ' + oField.get_title() + ' field internal name: ' + oField.get_internalName();
//                         this.logService.log(result, this._info, true);
//                         observer.next(result);
//                     } catch (e) {
//                         this.logService.log('error encountered iterating through fields', this._error, false);
//                         this.logService.log(e, this._error, false);
//                         observer.error('error encountered iterating through fields');                            
//                     }
                                        
//                 }
//                 this.logService.log('iterating through fields complete', this._info, true);
//                 observer.next('iterating through fields complete');
//                 observer.complete(); 
//             }

//             function failure(sender, args) {
//                 let result = 'failed to read field';
//                 this.logService.log(result, this._error, false);
//                 let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
//                 this.logService.log(apiResult, this._error, false);                    
//                 observer.next(result);
//                 observer.complete();                
//             }            
//         })
//         return readFields$
//     }

//     fieldExists(listName:string, fieldName:string, contextType:string):Observable<any> {
//         this.logService.log('Field Exists funtion called', this._info, true);
        
//         let fieldExists$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('viewList')) {
//                 let permissionMsg = `user does not have permissions to check if field exists`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: FieldExists failed', this._error, false)
//                 observer.error('unable to determine context type: FieldExists failed')
//             }

//             let web, fields;
//             try {
//                 this.logService.log('shaping JSOM query', this._info, true);
//                 web = context.get_web();
//                 fields = web.get_lists().getByTitle(listName).get_fields();

//                 context.load(fields);
//             } catch (e) {
//                 this.logService.log('unable to load required query', this._error, false)
//                 this.logService.log(e, this._error, false)
//                 observer.error('unable to load required query')
//             }
//             this.logService.log('executing JSOM query for function: fieldExists', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 this.logService.log(`successfully executed JSOM query to find field`)
//                 let fieldTitle = 'year';
//                 let fieldFlag = false;
//                 let fieldEnumerator
//                 try {
//                     fieldEnumerator = fields.getEnumerator();
//                 } catch (e) {
//                     this.logService.log('unable to create field Enumerator', this._error, false);
//                     observer.error('unable to create fieldEnumerator');
//                 }

//                 while (fieldEnumerator.moveNext()) {
//                     try {
//                         let oField = fieldEnumerator.get_current();
//                         this.logService.log('fieldName: ' + oField.get_title(),this._info, true);
//                         if (oField.get_title() == fieldName) {
//                             let result = `field: ${fieldName} found in list ${listName}`
//                             this.logService.log(result, this._success, true)
//                             fieldFlag = true;
//                             observer.next(result);
//                             observer.complete()
//                         }
//                     } catch (e) {
//                         this.logService.log('error encountered iterating through fields', this._error, false);
//                         this.logService.log(e, this._error, false);
//                         observer.error('error encountered iterating through fields');                            
//                     }                        
//                 }

//                 if (!fieldFlag) {
//                     let result = `field ${fieldName} on list ${listName} does not exist`
//                     this.logService.log(result, this._success, false);
//                     observer.next(result);
//                     observer.complete()
//                 } else {
//                     let result = `Unable to determine if field ${fieldName} in list: ${listName} exists`
//                     this.logService.log(result, this._error ,false);
//                     observer.error(result);
//                 }
//             }
//             function failure(sender, args) {
//                 let result = `error encountered when executing JSOM query to check if field ${fieldName} exists in list: ${listName}`;
//                 this.logService.log(result);
//                 let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
//                 this.logService.log(apiResult, this._error, false);                    
//                 observer.next(result);
//                 observer.complete()
//             }
                        
//         })
//         return fieldExists$
//     }

//     readField(fieldName:string, listName:string, contextType:string):Observable<any>{
//         this.logService.log('Read Field funtion called', this._info, true);
          
//         let readField$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('viewList')) {
//                 let permissionMsg = `user does not have permissions to read field`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: ReadField failed', this._error, false)
//                 observer.error('unable to determine context type: ReadField failed')
//             }
            
            

//             let web, field;
//             try { 
//                     web = context.get_web();
//                     field = web.get_lists().getByTitle('FinanceData').get_fields().getByInternalNameOrTitle('year');
//                     context.load(field, "SchemaXml");
//             } catch (e) {
//                     this.logService.log('unable to load required query', this._error, false)
//                     this.logService.log(e, this._error, false)
//                     observer.error('unable to load required query')                
//             }

//             this.logService.log('executing JSOM query for function: readField', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let result = `successfully read field ${fieldName} from list: ${listName}`;
//                 this.logService.log(result, this._success, true);
//                 let SchemaXml
//                 try {
//                     SchemaXml = field.get_schemaXml();
//                 } catch (e) {
//                     let result = `unable to get schemal XML for readField ${fieldName} on list ${listName}`
//                     this.logService.log(result, this._error, false);
//                     observer.error(result);
//                 }

//                 observer.next(result);
//                 console.log(SchemaXml);
//                 this.logService.log(SchemaXml, this._info, true);
//                 observer.complete();         
//             }
//             function failure(sender, args) {
//                 let result = `failed to read field ${fieldName} on list ${listName}`;
//                 this.logService.log(result, this._error, false);
//                 let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
//                 this.logService.log(apiResult, this._error, false);
//                 observer.next(result);
//                 observer.complete();      
//             }
//         })
//         return readField$
//     }

//     deleteField(fieldName: string, listName: string, contextType: string): Observable<any>{
//         this.logService.log('Delete Field function called', this._info, true);
         
//         let deleteField$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('manageList')) {
//                 let permissionMsg = `user does not have permissions to delete field on a list`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: deleteField failed', this._error, false)
//                 observer.error('unable to determine context type: deleteField failed')
//             }          
            
            
//             let web, field;
            
//             try {
//                 web = context.get_web();
//                 field = web.get_lists().getByTitle(listName).get_fields().getByInternalNameOrTitle(fieldName);
//                 field.deleteObject();
//             } catch (e) {
//                 this.logService.log('unable to load required query', this._error, false)
//                 this.logService.log(e, this._error, false)
//                 observer.error('unable to load required query')                     
//             }

//             this.logService.log('executing JSOM query for function: deleteField', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let result = `Field ${fieldName} in list: ${listName} successfully deleted`;
//                 observer.next(result);
//                 this.logService.log(result, this._success, true);
//                 observer.complete()
//             }

//             function failure(sender, args) {
//                 let result = `failed to delete field: ${fieldName} from list: ${listName} `
//                 observer.next(result);
//                 this.logService.log(result, this._error, false);
//                 let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
//                 this.logService.log(apiResult, this._error, false);
//                 observer.complete()   
//             }
//         })
//         return deleteField$ 
//     }

//     updateField(fieldName: string, listName: string, contextType: string, oldSchema:string, newSchema:string):Observable<any>{
//         this.logService.log('Update Field funtion called', this._info, true);
                
//         let updateField$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('manageList')) {
//                 let permissionMsg = `user does not have permissions to update a field on a list`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: update field failed', this._error, false)
//                 observer.error('unable to determine context type: Update Field failed')
//             }            
            

//             let web, field;
//             try {
//                 this.logService.log(`attempting to load list query for function updateField`, this._info, true);
//                 web = context.get_web();
//                 field = web.get_lists().getByTitle(listName).get_fields().getByInternalNameOrTitle(fieldName);
//                 context.load(field, "SchemaXml");
//             } catch (e) {
//                 this.logService.log('unable to load required query', this._error, false)
//                 this.logService.log(e, this._error, false)
//                 observer.error('unable to load required query')     
//             }

//             this.logService.log('executing JSOM query for function: updateField', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let result = `successfully executed query to load schemaXml for function updateField for field ${fieldName} on list ${listName}`
//                 this.logService.log(result, this._success, true);
//                 observer.next(result);
//                 try {
//                     this.logService.log(`attempting to load schemaXml query for function updateField`, this._info, true);
//                     let schema = field.get_schemaXml();
//                     var s1 = schema.replace(oldSchema, newSchema)
//                     field.set_schemaXml(s1);

//                     field.update();
//                 } catch (e) {
//                     this.logService.log('unable to load required query', this._error, false)
//                     this.logService.log(e, this._error, false)
//                     observer.error('unable to load required query')                     
//                 }

//                 this.logService.log('executing JSOM query for function: updateField', this._info, true);
//                 context.executeQueryAsync(success1, failure1);

//                 function success1() {
//                     let result = `Field: ${fieldName} in list: ${listName} updated successfully`;
//                     observer.next(result);
//                     this.logService.log(result, this._success, false);
//                     observer.complete()                   
//                 }
//                 function failure1(sender, args) {
//                     let result = `Failed to execute query to update field field ${fieldName} in list: ${listName}`;
//                     this.logService.log(result, this._error, false);
//                     let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
//                     this.logService.log(apiResult, this._error, false);
//                     observer.next(result);
                    
                    
//                     observer.complete()                         
//                 }
//             }

//             function failure(sender, args) {
//                 let result = `Failed to execute query to update field field ${fieldName} in list: ${listName}`;
//                 let apiResult = args.get_message() + '-  STACKTRACE:' + args.get_stackTrace();
//                 observer.next(result);
//                 this.logService.log(result, this._error, false);
//                 this.logService.log(apiResult, this._error, false);
//                 observer.complete()                     
//             }                            
//         })
//         return updateField$
//     }

//     addItem(listName: string, contextType: string, itemValues: Array<IItemPropertyModel>): Observable<any>{
//         this.logService.log('Add Item funtion called', this._info, true);
                
//         let addItem$ = new Observable(observer=>{
//             if (!this.uiStateService.getUiState('addListItems')) {
//                 let permissionMsg = `user does not have permissions to add a field on a list`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: add item failed', this._error, false)
//                 observer.error('unable to determine context type: add item failed')
//             }

//             let list, itemCreateInfo, listItem
//             try {
//                 this.logService.log('setting up itemCreationInformation object for function: addItem', this._info, true);
//                 list = context.get_web().get_lists().getByTitle(listName);

//                 itemCreateInfo = new SP.ListItemCreationInformation();
//                 listItem = list.addItem(itemCreateInfo);
//             } catch (e) {
//                 this.logService.log('error setting up itemCreationInformation object for function: addItem', this._error, false);
//                 this.logService.log(e,this._error, false);
//                 observer.error()
//             }
            
//             try {
//                 this.logService.log('defining list item for function: addItem', this._info, true);
                
//                 itemValues.forEach(element => {
//                     listItem.set_item(element.fieldName, element.fieldValue);
//                 });
//                 listItem.update();
//             } catch (e) {
//                 this.logService.log('error setting list item definition for function: addItem', this._error, false);
//                 observer.error()
//             }


//             try {
//                 this.logService.log('loading list item for function: addItem', this._info, true);
//                 context.load(listItem);
//             } catch (e) {
//                 this.logService.log(`unable to load list item in function: addItem in list ${listItem}`)
//                 this.logService.log(e,this._error, false);
//                 observer.error();
//             }
            

//             this.logService.log('executing JSOM query for function: addItem', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let result = `Item successfully created in List: ${listName}`
//                 observer.next(result);
//                 this.logService.log(result, this._success, true);
//                 observer.complete()                 
//             }

//             function failure(sender, args) {
//                 let apiResult = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
//                 let result = `Request failed to addItem to list ${listName}`
                
//                 observer.next(result);
//                 this.logService.log(result, this._error, false);
//                 this.logService.log(apiResult, this._error, false);
//                 observer.complete() 
//             }            
//         })
//         return addItem$
//     }

//     updateItem(listName: string, contextType: string, itemId: string, itemValues: Array<IItemPropertyModel>): Observable<any>{
//         this.logService.log('Update Item funtion called', this._info, true);
           
//         let updateItem$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('addListItems')) {  
//                 let permissionMsg = `user does not have permissions to update an item on a list`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: update item failed', this._error, false)
//                 observer.error('unable to determine context type: Update item failed')
//             }
        
//             let list, listItem;
//             try {
//                 list = context.get_web().get_lists().getByTitle(listName);
//                 listItem = list.getItemById(itemId);
//                 itemValues.forEach((element, index, array) => {
//                     listItem.set_item(element.fieldName, element.fieldValue);
//                 })
//                 listItem.update();
//             } catch (e) {
//                 this.logService.log('error defining the update information for funciton: updateItem', this._error, false);
//                 this.logService.log(e,this._error, false);
//                 observer.error()
//             }
            
//             this.logService.log('executing JSOM query for function: updateItem', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let result = 'updated list item successfully';
//                 observer.next(result);
//                 this.logService.log(result, this._success, false);
//                 observer.complete();
//             }

//             function failure(sender, args) {
//                 let apiResult = 'Failed to UPDATE ITEM: ' + args.get_message() + '  ' + args.get_stackTrace();
//                 this.logService.log(apiResult, this._error, false);
//                 let result = `Request failed to updateItem to list ${listName}`
//                 this.logService.log(result, this._error, false);
//                 observer.next(result);
                
//                 observer.complete();                
//             }            
//         })
//         return updateItem$
//     }

//     getItem(listName: string, itemId: string, contextType: string): Observable<any>{
//         this.logService.log('Get Item funtion called', this._info, true);
                 
//         let getItem$ = new Observable(observer=> {
//             if (!this.uiStateService.getUiState('viewList')) { 
//                 let permissionMsg = `user does not have permissions to read an item on a list`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext;
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: get item failed', this._error, false)
//                 observer.error('unable to determine context type: Get item failed')
//             }
            
//             let web, list, queryString, query, listItems;
//             try {
//                 web = context.get_web();
//                 list = web.get_lists().getByTitle(listName);
//                 queryString = `<View><Query><Where><Eq><FieldRef Name='ID' /><Value Type='Number'>${itemId}</Value></Eq></Where></Query></View>`;
//                 query = new SP.CamlQuery();
//                 query.set_viewXml(queryString);
//                 listItems = list.getItems(query);
//                 context.load(listItems);
//             } catch (e) {
//                 this.logService.log('error loading context information for function getItem', this._error, false);
//                 this.logService.log(e,this._error, false);
//                 observer.next('error loading context information for function getItem');
//                 observer.error()
//             }

//             this.logService.log('executing JSOM query for function: getItem', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let listItemEnumerator, listItemCount, messageSuccess;
//                 messageSuccess = `executed query successfully for function getItem on list ${listName} and item ${itemId}`
//                 this.logService.log(messageSuccess, this._success, true);
//                 try {
//                     listItemEnumerator = listItems.getEnumerator();
//                 } catch (e) {
//                     this.logService.log(e, this._error, false);
//                     observer.error(e);
//                 }
//                 try {
//                     listItemCount = String(listItems.get_count());
//                     this.LogService.log(`length of returned collection: ${listItemCount}`, this._info, true);
//                 } catch (e){
//                     this.logService.log(e, this._error, false);
//                     observer.error(e);                    
//                 }
            
//                 while (listItemEnumerator.moveNext()) {
//                     let result, oListItem;
//                     try {
//                         oListItem = listItemEnumerator.get_current();
//                         result = oListItem.get_fieldValues()
//                         observer.next(result);
//                         this.logService.log(result, this._info, true);
//                     } catch (e) {
//                         this.logService.log(e, this._error, false);
//                         observer.error(e);                    
//                     }
//                 }
//                 observer.complete();
//             }

//             function failure(sender, args) {
//                 let apiResult = 'Request Failed to get items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace()
//                 let result = `failed to execute query for getItem on list: ${listName} with itemId: ${itemId}`
//                 observer.next(result);
//                 this.logService.log(result, this._error, false);
//                 this.logService.log(apiResult, this._error, false);
//                 observer.complete(); 
//             }            
//         })
//         return getItem$
        
//     }

//     getItems(listName: string, contextType: string): Observable<any>{
//         this.logService.log('Get Items funtion called', this._info, true);
                      
//         let getItems$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('viewList')) {
//                 let permissionMsg = `user does not have permissions to read items on a list`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext;
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: get item failed', this._error, false)
//                 observer.error('unable to determine context type: Get item failed')
//             }

//             let web, list, camlQuery, items
//             try {
//                 web = context.get_web();
//                 list = web.get_lists().getByTitle(listName);
//                 camlQuery = new SP.CamlQuery();
//                 items = list.getItems(camlQuery);
//                 context.load(items);
//             } catch (e) {
//                 this.logService.log('error loading context information for function getItems', this._error, false);
//                 this.logService.log(e,this._error, false);
//                 observer.error('error loading context information for function getItems')
//             }
            
//             this.logService.log('executing JSOM query for function: getItems', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let itemEnumerator
//                 try {
//                     itemEnumerator = items.getEnumerator();
//                 } catch (e) {
//                     let errmsg = `error occured tyring to get enumerator for function getItems on list ${listName}`
//                     this.logService.log(errmsg, this._error, false);
//                     observer.error(errmsg);
//                 }
//                 while (itemEnumerator.moveNext()) {
//                     let oItem, fieldValues;
//                     try{
//                         oItem = itemEnumerator.get_current();
//                         // note get_fieldValues returns json object
//                         fieldValues = oItem.get_fieldValues();
//                         this.logService.log(fieldValues, this._info, false);
//                         observer.next(fieldValues)
//                     } catch (e) {
//                         this.logService.log(`error occured while iterating through list items on list ${listName}`, this._error, false);
//                         this.logService.log(e, this._error, false);
//                         observer.error(e);    
//                     }
                    
                    
//                 }
//                 observer.complete();
//             }

//             function failure(sender, args) {
//                 let result = 'Request Failed to get items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
//                 observer.next(result);
//                 this.logService.log(result, this._error, false);
//                 observer.complete(); 
//             }            
//         })
//         return getItems$ 
//     }

//     deletItem(listName: string, itemId: number, contextType: string):Observable<any>{
//         this.logService.log('delete item funtion called', this._info, true);
                  
//         let deleteItem$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('manageList')) { 
//                 let permissionMsg = `user does not have permissions to delete items on a list`
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext;
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: delete item failed', this._error, false)
//                 observer.error('unable to determine context type: Get item failed')
//             }
            
//             let web, listItem;
//             try {        
//                 web = context.get_web();
//                 listItem = web.get_lists().getByTitle(listName).getItemById(itemId);
//                 listItem.deleteObject();
//             } catch (e) {
//                 this.logService.log('error loading context information for function deleteItem', this._error, false);
//                 this.logService.log(e,this._error, false);
//                 observer.error('error loading context information for function deleteItem')
//             }
//             this.logService.log('executing JSOM query for function: deleteItem', this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let result = `Item with item id ${itemId} deleted successfully on list: ${listName}`
//                 observer.next(result);
//                 this.logService.log(result, this._success, false);
//                 observer.complete();                 
//             }


//             function failure(sender, args) {
//                 let result = `Failed to delete item ${itemId} on list ${listName}` + args.get_message() + ' <br/> ' + args.get_stackTrace()
//                 observer.next(result);
//                 this.logService.log(result, this._error, false);
//                 observer.complete();                  
//             }         
//         })
//         return deleteItem$
//     }

//     deleteItems(listName: string, contextType:string):Observable<any> {
//         this.logService.log('delete item funtion called', this._info, true);
                 
//         let deleteItems$ = new Observable(observer => {
//             if (!this.uiStateService.getUiState('manageList')) { 
//                 let permissionMsg = `user does not have permissions to delete items on a list`;
//                 this.logService.log(permissionMsg, this._error, false);
//                 observer.error(permissionMsg);
//             }
//             let clientContext;
//             try {
//                 clientContext = new SP.ClientContext(this.appUrl);
//             } catch (e) {
//                 this.logService.log(`unable to create clientContext`, this._error, false);
//                 this.logService.log(e, this._error, false);
//                 observer.error(`unable to create clientContext`)
//             }
                
//             let context; 

//             if (contextType == this.utilsService.hostWeb) {
//                 try {
//                     context = new SP.AppContextSite(clientContext, this.hostUrl);
//                 } catch (e) {
//                     this.logService.log(`unable to create hostweb clientcontext`, this._error, false);
//                     this.logService.log(e, this._error, false);
//                     observer.error(`unable to create hostweb clientContext`)
//                 }
            
//             } else if (contextType == this.utilsService.appWeb){
//                 context = clientContext;
//             } else {
//                 this.logService.log('unable to determine context type: delete items failed', this._error, false)
//                 observer.error('unable to determine context type: delete items failed')
//             }

//             let list, query, items;
        
//             try {
//                 list = context.get_web().get_lists().getByTitle('FinanceData');
//                 query = new SP.CamlQuery();
//                 items = list.getItems(query);
//                 context.load(items, "Include(Id)");
//             } catch (e) {
//                 this.logService.log('error loading context information for function deleteItemS', this._error, false);
//                 this.logService.log(e,this._error, false);
//                 observer.error('error loading context information for function deleteItemS')
//             }
//             this.logService.log(`executing JSOM query for function: deleteItems on list ${listName}`, this._info, true);
//             context.executeQueryAsync(success, failure);

//             function success() {
//                 let itemEnumerator, simpleArray;
//                 simpleArray = [];
                
//                 try {
//                     itemEnumerator = items.getEnumerator();
//                 } catch (e) {
//                     let errmsg = `unable to get enumerator for function deleteItems`
//                     this.logService.log(errmsg, this._error, false);
//                     observer.error(errmsg);
//                 }

//                 while (itemEnumerator.moveNext()) {
//                     simpleArray.push(itemEnumerator.get_current());
//                 }
//                 for (let s in simpleArray) {
//                     simpleArray[s].deleteObject();
//                 }

//                 this.logService.log('executing JSOM query for function: deleteItems', this._info, true);
//                 context.executeQueryAsync(success2, failure2);

//                 function success2() {
//                     let result = `all items deleted successfully from list ${listName}`
//                     this.logService.log(result, this._success, true);
//                     observer.next(result);
//                     observer.complete();                   
//                 };
//                 function failure2(sender, args) {
//                     let result = `Request Failed to delete each item in function deleteItems in list ${listName} ` + args.get_message() + ' <br/> ' + args.get_stackTrace();
//                     this.logService.log(result, this._error, false);
//                     observer.next(result);
//                     observer.complete(); 
//                 }
//             }


//             function failure(sender, args) {
//                 let result = `failed to get list items in function deleteItems on list ${listName} ` + args.get_message() + ` <br/> ` + args.get_stackTrace()
//                 this.logService.log(result, this._error, false);
//                 observer.next(result);
//                 observer.complete(); 
//                 }
//             });           
//         return deleteItems$
//     }    
// }