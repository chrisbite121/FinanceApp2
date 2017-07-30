// import { Component, ViewChild, ElementRef } from '@angular/core'
// import { CommonApiService } from '../../../service/api-common.service'
// import { UtilsService } from '../../../service/utils.service'
// import { ListService } from '../../../service/list.service'
// import { ScriptService } from '../../../service/scripts.service'
// import { HealthReportService } from '../../../service/health-report.service'

// import { FabricTableWrapperComponent } from '../../../office-fabric/table/fabric.table.wrapper.component'

// import { Observable } from 'rxjs/Rx';
// import { Observer } from 'rxjs/Observer';

// @Component({
//     selector: 'resource-list2',
//     templateUrl: './resource-list.component.html',
//     styleUrls: [`./resource-list.component.css`]
// })
// export class ResourceListComponent {
// public logs:Array<any>;
// public createFieldName: string;
// public createFieldTypeValue: string;
// public fieldNames: Array<string>
// public itemIds: Array<string>
// public deleteFieldName: string;
// public deleteItemId: string;

// public fieldBoolean: boolean
// public itemBoolean: boolean
// public updateItemField: string;
// public updateItemId: string;
// public updateItemValue: any;

// public updateFieldTypeId: string;
// public updateFieldTypeValue: string;

// public getFieldXmlId:string
// public fieldTypeOptions: Array<string>

//     @ViewChild(FabricTableWrapperComponent) ofTable: FabricTableWrapperComponent

//     constructor(private commonApiService: CommonApiService,
//                 private utilsService: UtilsService,
//                 private scriptService: ScriptService,
//                 private el: ElementRef,
//                 private listService: ListService,
//                 private healthReportService: HealthReportService){
//                     this.logs = [];
//                     this.createFieldTypeValue = 'Text'
//                     this.createFieldName = ''
//                     this.fieldNames = ['select'];
//                     this.itemIds = ['select'];
//                     this.deleteFieldName = ''
//                     this.deleteItemId = ''
//                     this.getFieldXmlId = ''
//                     this.fieldBoolean = true
//                     this.itemBoolean = true
//                     this.fieldTypeOptions = ['Text', 'Number', 'Currency', 'Note', 'Boolean', 'DateTime']
//                     this.updateFieldTypeValue = this.fieldTypeOptions[0] || undefined
                    
//                 }

//     createList(event){
//         this.commonApiService.createList(this.utilsService.financeAppResourceData, 
//                                         this.utilsService.hostWeb)
//         .subscribe(
//             data => {
//                 console.log('next', data)
//                 let _log = {
//                     description: data,
//                     type: 'info'
//                 }
//                 this.logs.push(_log);
//             },
//             err => {
//                 console.log('error', err)
//                 let _log = {
//                     description: err,
//                     type: 'error'
//                 }
//                 this.logs.push(_log);
//             },
//             () => {
//                 console.log('completed');
//                 let _log = {
//                     description: 'completed',
//                     type: 'complete'
//                 }
//                 this.logs.push(_log);
//             }
//         );
//     }

//     updateList(event){
//         this.commonApiService.updateField('Title'
//                                         , this.utilsService.financeAppResourceData
//                                         ,this.utilsService.hostWeb
//                                         ,'Required="TRUE"'
//                                         ,'Required="FALSE" Hidden="TRUE"')
//         .subscribe(
//             data => {
//                 console.log('next', data)
//                 let _log = {
//                     description: data,
//                     type: 'info'
//                 }
//                 this.logs.push(_log);
//             },
//             err => {
//                 console.log('error', err)
//                 let _log = {
//                     description: err,
//                     type: 'error'
//                 }
//                 this.logs.push(_log);
//             },
//             () => {
//                 console.log('completed');
//                 let _log = {
//                     description: 'completed',
//                     type: 'complete'
//                 }
//                 this.logs.push(_log);
//             }
//         );                                            

//     }

//     deleteList(event) {
//         var r = confirm("Warining: deleting this list will delete application data stored in this list");
//         if (r == true) {
//             this.commonApiService.deleteList(this.utilsService.financeAppResourceData, 
//                                         this.utilsService.hostWeb)
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );    
//         } else {
//             return;
//         }
//     }

//     readList(event) {
//         let _fieldNames = []

//         this.commonApiService.readFields(this.utilsService.financeAppResourceData, 
//                                         this.utilsService.hostWeb)
//             .subscribe(
//                 data => {
//                     if (typeof(data) == 'object' &&
//                         data.hasOwnProperty('fieldTitle')) {
//                             let indexValue = _fieldNames.findIndex(element => {return element == data.fieldTitle})
//                             if(indexValue == -1) {
//                                 _fieldNames.push(data.fieldTitle)
//                             }
//                         }
                    
//                     typeof(data) == 'object' ? this.logs.push(JSON.stringify(data)) : this.logs.push(data)
//                 },
//                 err => {
//                     console.log('error', err)

//                     typeof(err) == 'object' ? this.logs.push(JSON.stringify(err)) : this.logs.push(err)
//                 },
//                 () => {
//                     console.log('completed');

//                     if (_fieldNames.length > 0) {
//                         this.reRenderFieldDropdown(_fieldNames)
//                     }

//                     this.logs.push('read list completed');
//                 }
//             );
//     }

//     listExists(event) {
//         this.commonApiService.listExists(this.utilsService.financeAppResourceData,
//                                         this.utilsService.hostWeb)
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );
//     }

//     fieldExists(event) {
//         this.commonApiService.fieldExists(this.utilsService.financeAppResourceData,
//                                         'Title',
//                                         this.utilsService.hostWeb)
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );
//     }

//     readField(event){
//         this.commonApiService.readField('Title',
//                                     this.utilsService.financeAppResourceData,
//                                     this.utilsService.hostWeb)
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );
//     }

//     createFieldNameSet(event){
//         this.createFieldName = event
//     }

//     createFieldTypeSelect(event){
//         this.createFieldTypeValue = event
//     }

//     updateFieldTypeNameSelect(event){
//         this.updateFieldTypeId = event
//     }

//     updateFieldTypeSelect(event){
//         this.updateFieldTypeValue = event
//     }

    
//     deleteFieldSelect(event){
//         this.deleteFieldName = event;
//     }

//     deleteItemSelect(event){
//         this.deleteItemId = event;
//     }

//     updateitemIdSelect(event){
//         this.updateItemId = event.toString()
//     }

//     updateItemFieldSelect(event){
//         this.updateItemField = event
//     }

//     updateItemSet(event){
//         this.updateItemValue = event
//     }

//     createField(event){
//         if(!this.createFieldTypeValue && this.createFieldName) {
//             return
//         }

//         let listName = this.utilsService.financeAppResourceData
        
//         let fieldDefinition = `<Field DisplayName="${this.createFieldName}" Name="${this.createFieldName}" Type="${this.createFieldTypeValue}"/>`        

//         this.commonApiService.addField(listName, this.utilsService.hostWeb, fieldDefinition, this.createFieldTypeValue)
//             .subscribe(
//                 data => {
//                    console.log(data)
//                 },
//                 err => {
//                     console.log(err)
//                 },
//                 () => {
//                     console.log('create field apiCall complete')
//                 }
//             )
//     }

//     updateField(event, attribute){
//         if (!this.updateFieldTypeId || !this.updateFieldTypeValue) {
//             return
//         }
//         let _newSchema = `${attribute}="${this.updateFieldTypeValue}"`
//     console.log(_newSchema)
//         this.scriptService.updateField(this.updateFieldTypeId,
//                                         this.utilsService.financeAppResourceData,
//                                         'Type',
//                                         _newSchema)
//             .subscribe(
//                 data => {
//                     if(typeof(data)=='object' &&
//                         data.hasOwnProperty('reportHeading') &&
//                         data.hasOwnProperty('reportResult') &&
//                         data.hasOwnProperty('listName') &&
//                         data.hasOwnProperty('fieldName')
//                         ) {
//                             console.log(`field: ${data.fieldName} 
//                                         in list ${data.listName} 
//                                         update attempt was: ${data.reportResult}`)
//                         } else {
//                             console.log(data)
//                         }
//                 }, err => {
//                     console.log(err)
//                 }, () =>{
//                     console.log('COMPLETED')
//                 }
//             )
//     }


//     deleteField(event){
//         if(!this.deleteFieldName) {
//             return
//         }

//         this.commonApiService.deleteField(this.deleteFieldName,
//                                 this.utilsService.financeAppResourceData,
//                                 this.utilsService.hostWeb)
//             .subscribe(
//             data => {
//                 console.log('next', data)
//                 let _log = {
//                     description: data,
//                     type: 'info'
//                 }
//                 this.logs.push(_log);
//             },
//             err => {
//                 console.log('error', err)
//                 let _log = {
//                     description: err,
//                     type: 'error'
//                 }
//                 this.logs.push(_log);
//             },
//             () => {
//                 console.log('completed');
//                 let _log = {
//                     description: 'completed',
//                     type: 'complete'
//                 }
//                 this.logs.push(_log);
//             }
//         );
//     }


//     addItem(event){
//         this.commonApiService.addItem(this.utilsService.financeAppResourceData,
//                                 this.utilsService.hostWeb,
//                                 [{fieldName: 'Title', fieldValue: 'Placeholder Title' },
//                                 {fieldName: 'ItemId', fieldValue: this.utilsService.generateItemId() }])
                                
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );
//     }

//     updateItem(event){
//         this.commonApiService.updateItem(this.utilsService.financeAppResourceData,
//                                     this.utilsService.hostWeb, 
//                                     this.updateItemId,
//                                     [{ fieldName: this.updateItemField,
//                                      fieldValue: this.updateItemValue }]
//                                     )
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );
//     }

//     getItem(event){
//         this.commonApiService.getItem(this.utilsService.financeAppResourceData,
//                                     this.utilsService.generateXmlGetFirstXItems(1),
//                                     this.utilsService.hostWeb,
//                                     this.utilsService.includeFields(
//                                         this.listService.getArrayFieldNames(this.utilsService.financeAppResourceData)))
//            .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );
//     }

//     getItems(event){
//         this.commonApiService.getItems(this.utilsService.financeAppResourceData,
//                                     this.utilsService.hostWeb,
//                                     this.utilsService.includeFields(
//                                     this.listService.getArrayFieldNames(this.utilsService.financeAppResourceData)),
//                                     this.utilsService.genCamlQuery())
//             .subscribe(
//                 data => {
//                     if (typeof(data) == 'object' &&
//                         data.hasOwnProperty('apiCall') &&
//                         data.hasOwnProperty('listName') &&
//                         data.hasOwnProperty('result') &&
//                         data.hasOwnProperty('data')) {

//                         let result = data.data
//                         let _itemIds:Array<any> = []                        
//                          if (Array.isArray(data.data)) {
//                              result.forEach(item => {
//                                  if (typeof(item) == 'object'){
//                                     //construct item ID dropdown

//                                      if(item.hasOwnProperty('ID')) {
//                                          _itemIds.push(item.ID.toString())
//                                      }
//                                  }
//                                  console.log(item)
//                              })
//                              if(_itemIds.length > 0) {
//                                  this.reRenderItemDropdown(_itemIds.reverse())
//                              }
//                          }

//                     } else {
//                         console.log('next', data)
//                         this.logs.push(data);                        
//                     }

//                 },
//                 err => {
//                     console.log('error', err)
//                     this.logs.push(err);
//                 },
//                 () => {
//                     console.log('get items call completed');
//                     this.logs.push('get items call completed');
//                 }
//             );
//     }

//     deleteItem(event){
//         this.commonApiService.deleteItem(this.utilsService.financeAppResourceData,
//                                     +this.deleteItemId,
//                                     this.utilsService.hostWeb)
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     this.logs.push('delete item call completed');
//                 }
//             );
//     }

//     deleteItems(event){
//         this.commonApiService.deleteItems(this.utilsService.financeAppResourceData,
//                                     this.utilsService.hostWeb)
//             .subscribe(
//                 data => {
//                     console.log('next', data)
//                     let _log = {
//                         description: data,
//                         type: 'info'
//                     }
//                     this.logs.push(_log);
//                 },
//                 err => {
//                     console.log('error', err)
//                     let _log = {
//                         description: err,
//                         type: 'error'
//                     }
//                     this.logs.push(_log);
//                 },
//                 () => {
//                     console.log('completed');
//                     let _log = {
//                         description: 'completed',
//                         type: 'complete'
//                     }
//                     this.logs.push(_log);
//                 }
//             );
//     }

//     checkListConfig(event) {
//         this.scriptService.healthReport([this.utilsService.financeAppResourceData])
//             .subscribe(
//                 data => {
//                     if (typeof(data) == 'object' &&
//                     data.hasOwnProperty('functionCall') &&
//                     data.hasOwnProperty('result') &&
//                     data.functionCall == 'updateHealthReport' &&
//                     data.result == true) {
//                         console.log(this.healthReportService.healthReport)
//                     } else {
//                         console.log(data)
//                     }
//                 }, err => {
//                     console.log(err)
//                 },
//                 () => {
//                     console.log('COMPLETE')
//                     console.log(this.healthReportService.healthReport)
//                 }
//             )
//     }

//     actionListConfig(event){
//         this.scriptService.actionHealthReport([this.utilsService.financeAppResourceData])
//             .subscribe(
//                 data => {
//                     if (typeof(data) == 'object' &&
//                     data.hasOwnProperty('functionCall') &&
//                     data.hasOwnProperty('result') &&
//                     data.functionCall == 'updateHealthReport' &&
//                     data.result == true) {
//                         console.log(this.healthReportService.actionHealthReport)
//                     } else {
//                         console.log(data)
//                     }
//                 }, err => {
//                     console.log(err)
//                 },
//                 () => {
//                     console.log('COMPLETE')
//                     console.log(this.healthReportService.actionHealthReport)
//                 }
//             )
//     }

//     deleteHealthReport(event){
//         this.healthReportService
//             .resetHealthReport([this.utilsService.financeAppResourceData])
//             .subscribe(
//                 data => {
//                     console.log(data)
//                 },
//                 err => {
//                     console.log(err)
//                 },
//                 () => {
//                     console.log('COMPLETE')
//                 }
//             )
//     }

//     getFieldXmlSelect(event){
//         console.log(event)
//         this.getFieldXmlId = event

//     }

//     getFieldXml(event){
//         this.commonApiService
//             .readField(
//                 this.getFieldXmlId, 
//                 this.utilsService.financeAppResourceData,
//                 this.listService.getListContext(this.utilsService.financeAppResourceData))
//             .subscribe(
//                 data => console.log(data),
//                 err => console.log(err),
//                 () => console.log('COMPLETE')
//             )
//     }



//     reRenderFieldDropdown(data: Array<string>){
//         this.fieldNames = data;
      
//         this.fieldBoolean=false
//         setTimeout(()=> this.fieldBoolean=true, 5);

//         this.deleteItemId = this.fieldNames[0]
//         this.updateFieldTypeId = this.fieldNames[0]
//         this.getFieldXmlId = this.fieldNames[0]
//     }
    
//     reRenderItemDropdown(data: Array<string>) {
//         this.itemIds = data;

//         this.itemBoolean = false;
//         setTimeout(() => this.itemBoolean=true, 5)
        
//         // set selected value to first in array
//         this.updateItemId = this.itemIds[0]
//     }

//     getSubscriber() {
//         return {
//             next(data){
//                 console.log('next', data)
//                 let _log = {
//                     description: data,
//                     type: 'info'
//                 }
//                 this.addLog(_log)
//             },
//             error(err){
//                 console.log('error', err)
//                 let _log = {
//                     description: err,
//                     type: 'error'
//                 }
//                 this.logs.push(_log);
//             },
//             complete(){
//                 console.log('completed');
//                 let _log = {
//                     description: 'completed',
//                     type: 'complete'
//                 }
//                 this.logs.push(_log);
//             }
//         }
//     }
// }