import { Component, ViewChild, ElementRef, Input } from '@angular/core'
import { CommonApiService } from '../../../service/api-common.service'
import { UtilsService } from '../../../service/utils.service'
import { ListService } from '../../../service/list.service'
import { ScriptService } from '../../../service/scripts.service'
import { HealthReportService } from '../../../service/health-report.service'

import { FabricTableWrapperComponent } from '../../../office-fabric/table/fabric.table.wrapper.component'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

@Component({
    selector: 'list-manager-api',
    templateUrl: './list-manager-api.component.html',
    styleUrls: [`./list-manager-api.component.css`]
})
export class ListManagerApiComponent {
public logs:Array<any>;
public createFieldName: string;
public createFieldTypeValue: string;
public fieldNames: Array<string>
public itemIds: Array<string>
public deleteFieldName: string;
public deleteItemId: string;

public fieldBoolean: boolean
public itemBoolean: boolean
public updateItemField: string;
public updateItemId: string;
public updateItemValue: any;

public updateFieldTypeId: string;
public updateFieldTypeValue: string;

public getFieldXmlId:string
public fieldTypeOptions: Array<string>

public yearOptions:Array<number>
public selectedYear: number

    @Input() listName: string
    @ViewChild(FabricTableWrapperComponent) ofTable: FabricTableWrapperComponent

    constructor(private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private scriptService: ScriptService,
                private el: ElementRef,
                private listService: ListService,
                private healthReportService: HealthReportService){
                    this.logs = [];
                    this.createFieldTypeValue = 'Text'
                    this.createFieldName = ''
                    this.fieldNames = ['select'];
                    this.itemIds = ['select'];
                    this.deleteFieldName = ''
                    this.deleteItemId = ''
                    this.getFieldXmlId = ''
                    this.fieldBoolean = true
                    this.itemBoolean = true
                    this.fieldTypeOptions = ['Text', 'Number', 'Currency', 'Note', 'Boolean', 'DateTime']
                    this.updateFieldTypeValue = this.fieldTypeOptions[0] || undefined
                    this.yearOptions = [2017,2018,2019,2020,2021]
                    this.selectedYear = (this.yearOptions && Array.isArray(this.yearOptions))
                                        ? this.yearOptions[0]
                                        : 2017
                }
    createList(event){
        this.commonApiService.createList(this.listName, 
                                        this.listService.getListContext(this.listName))
        .subscribe(
            data => {
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                this.log(_log);
            },
            err => {
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                this.log(_log);
            },
            () => {
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                this.log(_log);
            }
        );
    }

    updateList(event){
        this.commonApiService.updateField('Title'
                                        , this.listName
                                        ,this.listService.getListContext(this.listName)
                                        ,'Required="TRUE"'
                                        ,'Required="FALSE" Hidden="TRUE"')
        .subscribe(
            data => {
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                this.log(_log);
            },
            err => {
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                this.log(_log);
            },
            () => {
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                this.log(_log);
            }
        );                                            

    }

    deleteList(event) {
        var r = confirm("Warining: deleting this list will delete application data stored in this list");
        if (r == true) {
            this.commonApiService.deleteList(this.listName, 
                                        this.listService.getListContext(this.listName))
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );    
        } else {
            return;
        }
    }

    readList(event) {
        let _fieldNames = []

        this.commonApiService.readFields(this.listName, 
                                        this.listService.getListContext(this.listName))
            .subscribe(
                data => {
                    if (typeof(data) == 'object' &&
                        data.hasOwnProperty('fieldTitle')) {
                            let indexValue = _fieldNames.findIndex(element => {return element == data.fieldTitle})
                            if(indexValue == -1) {
                                _fieldNames.push(data.fieldTitle)
                            }
                        }
                    
                    this.log(data)
                },
                err => {
                    console.log('error', err)

                    this.log(err)
                },
                () => {
                    console.log('completed');

                    if (_fieldNames.length > 0) {
                        this.reRenderFieldDropdown(_fieldNames)
                    }

                    this.log('read list completed');
                }
            );
    }

    listExists(event) {
        this.commonApiService.listExists(this.listName,
                                        this.listService.getListContext(this.listName))
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );
    }

    fieldExists(event) {
        this.commonApiService.fieldExists(this.listName,
                                        'Title',
                                        this.listService.getListContext(this.listName))
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );
    }

    readField(event){
        this.commonApiService.readField('Title',
                                    this.listName,
                                    this.listService.getListContext(this.listName))
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );
    }

    createFieldNameSet(event){
        this.createFieldName = event
    }

    createFieldTypeSelect(event){
        this.createFieldTypeValue = event
    }

    updateFieldTypeNameSelect(event){
        this.updateFieldTypeId = event
    }

    updateFieldTypeSelect(event){
        this.updateFieldTypeValue = event
    }

    
    deleteFieldSelect(event){
        this.deleteFieldName = event;
    }

    deleteItemSelect(event){
        this.deleteItemId = event;
    }

    updateitemIdSelect(event){
        this.updateItemId = event.toString()
    }

    updateItemFieldSelect(event){
        this.updateItemField = event
    }

    updateItemSet(event){
        this.updateItemValue = event
    }

    createField(event){
        if(!this.createFieldTypeValue && this.createFieldName) {
            return
        }

        let listName = this.listName
        
        let fieldDefinition = `<Field DisplayName="${this.createFieldName}" Name="${this.createFieldName}" Type="${this.createFieldTypeValue}"/>`        

        this.commonApiService.addField(listName, this.listService.getListContext(this.listName), fieldDefinition, this.createFieldTypeValue)
            .subscribe(
                data => {
                   console.log(data)
                },
                err => {
                    console.log(err)
                },
                () => {
                    console.log('create field apiCall complete')
                }
            )
    }

    updateField(event, attribute){
        if (!this.updateFieldTypeId || !this.updateFieldTypeValue) {
            return
        }
        let _newSchema = `${attribute}="${this.updateFieldTypeValue}"`
    console.log(_newSchema)
        this.scriptService.updateField(this.updateFieldTypeId,
                                        this.listName,
                                        'Type',
                                        _newSchema)
            .subscribe(
                data => {
                    if(typeof(data)=='object' &&
                        data.hasOwnProperty('reportHeading') &&
                        data.hasOwnProperty('reportResult') &&
                        data.hasOwnProperty('listName') &&
                        data.hasOwnProperty('fieldName')
                        ) {
                            console.log(`field: ${data.fieldName} 
                                        in list ${data.listName} 
                                        update attempt was: ${data.reportResult}`)
                        } else {
                            console.log(data)
                        }
                }, err => {
                    console.log(err)
                }, () =>{
                    console.log('COMPLETED')
                }
            )
    }


    deleteField(event){
        if(!this.deleteFieldName) {
            return
        }

        this.commonApiService.deleteField(this.deleteFieldName,
                                this.listName,
                                this.listService.getListContext(this.listName))
            .subscribe(
            data => {
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                this.log(_log);
            },
            err => {
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                this.log(_log);
            },
            () => {
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                this.log(_log);
            }
        );
    }


    addItem(event){
        this.commonApiService.addItem(this.listName,
                                this.listService.getListContext(this.listName),
                                [{fieldName: 'Title', fieldValue: 'Placeholder Title' },
                                {fieldName: 'ItemId', fieldValue: this.utilsService.generateItemId() }])
                                
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );
    }

    updateItem(event){
        this.commonApiService.updateItem(this.listName,
                                    this.listService.getListContext(this.listName), 
                                    this.updateItemId,
                                    [{ fieldName: this.updateItemField,
                                     fieldValue: this.updateItemValue }]
                                    )
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );
    }

    getItem(event){
        this.commonApiService.getItem(this.listName,
                                    this.utilsService.generateXmlGetFirstXItems(1),
                                    this.listService.getListContext(this.listName),
                                    this.utilsService.includeFields(
                                        this.listService.getArrayFieldNames(this.listName)))
           .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );
    }

    getItems(event){
        this.commonApiService.getItems(this.listName,
                                    this.listService.getListContext(this.listName),
                                    this.utilsService.includeFields(
                                    this.listService.getArrayFieldNames(this.listName)),
                                    this.utilsService.genCamlQuery())
            .subscribe(
                data => {
                    if (typeof(data) == 'object' &&
                        data.hasOwnProperty('apiCall') &&
                        data.hasOwnProperty('listName') &&
                        data.hasOwnProperty('result') &&
                        data.hasOwnProperty('data')) {

                        let result = data.data
                        let _itemIds:Array<any> = []                        
                         if (Array.isArray(data.data)) {
                             result.forEach(item => {
                                 if (typeof(item) == 'object'){
                                    //construct item ID dropdown

                                     if(item.hasOwnProperty('ID')) {
                                         _itemIds.push(item.ID.toString())
                                     }
                                 }
                                 console.log(item)
                             })
                             if(_itemIds.length > 0) {
                                 this.reRenderItemDropdown(_itemIds.reverse())
                             }
                         }

                    } else {
                        console.log('next', data)
                        this.log(data);                        
                    }

                },
                err => {
                    console.log('error', err)
                    this.log(err);
                },
                () => {
                    console.log('get items call completed');
                    this.log('get items call completed');
                }
            );
    }

    deleteItem(event){
        this.commonApiService.deleteItem(this.listName,
                                    +this.deleteItemId,
                                    this.listService.getListContext(this.listName))
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    this.log('delete item call completed');
                }
            );
    }

    deleteItems(event){
        this.commonApiService.deleteItems(this.listName,
                                    this.listService.getListContext(this.listName))
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.log(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.log(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.log(_log);
                }
            );
    }

    checkListConfig(event) {
        this.scriptService.healthReport([this.listName])
            .subscribe(
                data => {
                    if (typeof(data) == 'object' &&
                    data.hasOwnProperty('functionCall') &&
                    data.hasOwnProperty('result') &&
                    data.functionCall == 'updateHealthReport' &&
                    data.result == true) {
                        console.log(this.healthReportService.healthReport)
                    } else {
                        console.log(data)
                    }
                }, err => {
                    console.log(err)
                },
                () => {
                    console.log('COMPLETE')
                    console.log(this.healthReportService.healthReport)
                }
            )
    }

    actionListConfig(event){
        this.scriptService.actionHealthReport([this.listName])
            .subscribe(
                data => {
                    if (typeof(data) == 'object' &&
                    data.hasOwnProperty('functionCall') &&
                    data.hasOwnProperty('result') &&
                    data.functionCall == 'updateHealthReport' &&
                    data.result == true) {
                        console.log(this.healthReportService.actionHealthReport)
                    } else {
                        console.log(data)
                    }
                }, err => {
                    console.log(err)
                },
                () => {
                    console.log('COMPLETE')
                    console.log(this.healthReportService.actionHealthReport)
                }
            )
    }

    deleteHealthReport(event){
        this.healthReportService
            .resetHealthReport([this.listName])
            .subscribe(
                data => {
                    console.log(data)
                },
                err => {
                    console.log(err)
                },
                () => {
                    console.log('COMPLETE')
                }
            )
    }

    getFieldXmlSelect(event){
        console.log(event)
        this.getFieldXmlId = event

    }

    getFieldXml(event){
        this.commonApiService
            .readField(
                this.getFieldXmlId, 
                this.listName,
                this.listService.getListContext(this.listName))
            .subscribe(
                data => console.log(data),
                err => console.log(err),
                () => console.log('COMPLETE')
            )
    }



    reRenderFieldDropdown(data: Array<string>){
        this.fieldNames = data;
      
        this.fieldBoolean=false
        setTimeout(()=> this.fieldBoolean=true, 5);

        this.deleteItemId = this.fieldNames[0]
        this.updateFieldTypeId = this.fieldNames[0]
        this.getFieldXmlId = this.fieldNames[0]
    }
    
    reRenderItemDropdown(data: Array<string>) {
        this.itemIds = data;

        this.itemBoolean = false;
        setTimeout(() => this.itemBoolean=true, 5)
        
        // set selected value to first in array
        this.updateItemId = this.itemIds[0]
    }

    getItemsByYearSelect(event){
        console.log(event)
        if(event && typeof(event)=='number') {
            this.selectedYear = event
        }
    }

    getItemsByYear(event){
        console.log(`getItemsByYear selected`)
        if(this.selectedYear && typeof(this.selectedYear) == 'number') {
            let config = {
                value: this.selectedYear,
                fieldRef: 'Year',
                type: 'Number',
            }

            this.commonApiService.getItems(
                                            this.listName, 
                                            this.listService.getListContext(this.listName),
                                            this.utilsService.includeFields(
                                                this.listService.getArrayFieldNames(
                                                    this.listName)),
                                            this.utilsService.genCamlQuery(config)
                                            )
                                        .subscribe(this.getSubscriber())
        }
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

    log(data){
        if (typeof(data) == 'object') {
            this.logs.push(JSON.stringify(data))
        } else {
            this.logs.push(data)
        }
    }
}