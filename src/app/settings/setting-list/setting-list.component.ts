import { Component } from '@angular/core'
import { CommonApiService } from '../../shared/api-common.service'
import { UtilsService } from '../../shared/utils.service'
import { SettingsService } from '../../shared/settings.service'

@Component({
    selector: 'setting-list',
    templateUrl: './setting-list.component.html',
    styles: [``]
})
export class SettingListComponent {
public logs:Array<any>;
public output: Array<any>;

    constructor(private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private settingsService: SettingsService){
                    this.logs = [];
                    this.output =[];
                }


    createList(){
        this.commonApiService.createList(this.utilsService.financeAppSettingsData, 
                                        this.utilsService.appWeb)
        .subscribe(
            data => {
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                this.logs.push(_log);
            },
            err => {
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                this.logs.push(_log);
            },
            () => {
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                this.logs.push(_log);
            }
        );
    }

    updateList(){
        this.commonApiService.updateField('Title'
                                        , this.utilsService.financeAppSettingsData
                                        ,this.utilsService.appWeb
                                        ,'Required="TRUE"'
                                        ,'Required="FALSE" Hidden="TRUE"')
        .subscribe(
            data => {
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                this.logs.push(_log);
            },
            err => {
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                this.logs.push(_log);
            },
            () => {
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                this.logs.push(_log);
            }
        );                                            

    }

    deleteList() {
        var r = confirm("Warining: deleting this list will delete application data stored in this list");
        if (r == true) {
            this.commonApiService.deleteList(this.utilsService.financeAppSettingsData, 
                                        this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );    
        } else {
            return;
        }
    }

    readList() {
        this.commonApiService.readFields(this.utilsService.financeAppSettingsData, 
                                        this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    listExists() {
        this.commonApiService.listExists(this.utilsService.financeAppSettingsData,
                                        this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    fieldExists() {
        this.commonApiService.fieldExists(this.utilsService.financeAppSettingsData,
                                        'Title',
                                        this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    readField(){
        this.commonApiService.readField('Title',
                                    this.utilsService.financeAppSettingsData,
                                    this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    deleteField(){
        this.commonApiService.deleteField('Title',
                                this.utilsService.financeAppSettingsData,
                                this.utilsService.appWeb)
            .subscribe(
            data => {
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                this.logs.push(_log);
            },
            err => {
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                this.logs.push(_log);
            },
            () => {
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                this.logs.push(_log);
            }
        );
    }


    addItem(){
        this.commonApiService.addItem(this.utilsService.financeAppSettingsData,
                                this.utilsService.appWeb,
                                [{fieldName: 'Title', fieldValue: 'Garbage Title' },
                                {fieldName: 'ItemId', fieldValue: this.utilsService.generateItemId() }])
                                
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    updateItem(){
        this.commonApiService.updateItem(this.utilsService.financeAppSettingsData,
                                    this.utilsService.appWeb, 
                                    "1",
                                    [{fieldName: 'Title', fieldValue: 'Clean fragrant Title' }, 
                                    {fieldName: 'ItemId', fieldValue: this.utilsService.generateItemId() }]
                                    )
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    getItem(){
        this.commonApiService.getItem(this.utilsService.financeAppSettingsData,
                                    this.utilsService.generateXmlGetItemById(1),
                                    this.utilsService.appWeb)
           .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    getItems(){
        this.commonApiService.getItems(this.utilsService.financeAppSettingsData,
                                    this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    deleteItem(){
        this.commonApiService.deleteItem(this.utilsService.financeAppSettingsData,
                                    1,
                                    this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }

    deleteItems(){
        this.commonApiService.deleteItems(this.utilsService.financeAppSettingsData,
                                    this.utilsService.appWeb)
            .subscribe(
                data => {
                    console.log('next', data)
                    let _log = {
                        description: data,
                        type: 'info'
                    }
                    this.logs.push(_log);
                },
                err => {
                    console.log('error', err)
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    console.log('completed');
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
    }


    getSubscriber() {
        return {
            next(data){
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                this.logs.push(_log);
            },
            error(err){
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                this.logs.push(_log);
            },
            complete(){
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                this.logs.push(_log);
            }
        }
    }

    getCachedSettings(){
        let fieldValuesArray = this.settingsValuesArray()
        console.log(fieldValuesArray)
        fieldValuesArray.forEach(field => {
            this.output.push({
                fieldName: field['fieldName'],
                fieldValue: field['fieldValue']
            })
        })

    }

    settingsValuesArray(){
        let fieldValuesArray = []
        let settingsObject = this.settingsService.settings
        let keysArray = Object.keys(settingsObject);

        keysArray.forEach(key => {
            fieldValuesArray.push({
                fieldName: key,
                fieldValue: settingsObject[key]
            })
        })
        
        return fieldValuesArray
    }

    getCachedAppSettings(){
        let fieldValuesArray = this.appSettingsValuesArray()
        console.log(fieldValuesArray)
        fieldValuesArray.forEach(field => {
            this.output.push({
                fieldName: field['fieldName'],
                fieldValue: field['fieldValue']
            })
        })  
    }

    appSettingsValuesArray(){
        let fieldValuesArray = []
        let settingsObject = this.settingsService.appSettings
        let keysArray = Object.keys(settingsObject);

        keysArray.forEach(key => {
            fieldValuesArray.push({
                fieldName: key,
                fieldValue: settingsObject[key]
            })
        })
        
        return fieldValuesArray
    }

}