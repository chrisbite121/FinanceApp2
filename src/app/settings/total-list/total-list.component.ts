import { Component } from '@angular/core'
import { CommonApiService } from '../../shared/api-common.service'
import { UtilsService } from '../../shared/utils.service'

@Component({
    selector: 'toal-list',
    templateUrl: './total-list.component.html',
    styles: [``]
})
export class TotalListComponent {

    public logs:Array<any>;

    constructor(private commonApiService: CommonApiService,
                private utilsService: UtilsService){
                    this.logs = [];
                }


    createList(){
        this.commonApiService.createList(this.utilsService.financeAppTotalsData, 
                                        this.utilsService.hostWeb)
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
                                        , this.utilsService.financeAppTotalsData
                                        ,this.utilsService.hostWeb
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
            this.commonApiService.deleteList(this.utilsService.financeAppTotalsData, 
                                        this.utilsService.hostWeb)
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
        this.commonApiService.readFields(this.utilsService.financeAppTotalsData, 
                                        this.utilsService.hostWeb)
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
        this.commonApiService.listExists(this.utilsService.financeAppTotalsData,
                                        this.utilsService.hostWeb)
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
        this.commonApiService.fieldExists(this.utilsService.financeAppTotalsData,
                                        'Title',
                                        this.utilsService.hostWeb)
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
                                    this.utilsService.financeAppTotalsData,
                                    this.utilsService.hostWeb)
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
                                this.utilsService.financeAppTotalsData,
                                this.utilsService.hostWeb)
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
        this.commonApiService.addItem(this.utilsService.financeAppTotalsData,
                                this.utilsService.hostWeb,
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
        this.commonApiService.updateItem(this.utilsService.financeAppTotalsData,
                                    this.utilsService.hostWeb, 
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
        this.commonApiService.getItem(this.utilsService.financeAppTotalsData,
                                    this.utilsService.generateXmlGetItemById(1),
                                    this.utilsService.hostWeb)
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
        this.commonApiService.getItems(this.utilsService.financeAppTotalsData,
                                    this.utilsService.hostWeb)
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
        this.commonApiService.deleteItem(this.utilsService.financeAppTotalsData,
                                    1,
                                    this.utilsService.hostWeb)
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
        this.commonApiService.deleteItems(this.utilsService.financeAppTotalsData,
                                    this.utilsService.hostWeb)
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
}