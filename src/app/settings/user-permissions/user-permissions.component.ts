import { Component } from '@angular/core'
import { UtilsService } from '../../service/utils.service'
import { CommonApiService } from '../../service/api-common.service'
import { UiStateService } from '../../service/ui-state.service'
import { LogService } from '../../service/log.service'
import { ListService } from '../../service/list.service'
import { Observable } from 'rxjs/Rx';
@Component({
    selector: 'permissions',
    templateUrl: './user-permissions.component.html',
    styles: [``]
})
export class UserPermissionsComponent {
    public logs: Array<any>

    constructor(private utilsService: UtilsService,
                private commonApiService: CommonApiService,
                private logService: LogService,
                private uiStateService: UiStateService,
                private listService: ListService ) {
        this.logs = [];
    }

    getPermissions(event){
            Observable.from([
                    this.commonApiService.getPermissions(this.listService.getListContext(this.utilsService.financeAppResourceData),
                                            this.utilsService.financeAppResourceData),
                    this.commonApiService.getPermissions(this.listService.getListContext(this.utilsService.financeAppMaterialData),
                                        this.utilsService.financeAppMaterialData),
                    this.commonApiService.getPermissions(this.listService.getListContext(this.utilsService.financeAppTotalsData),
                                        this.utilsService.financeAppTotalsData),
                    this.commonApiService.getPermissions(this.listService.getListContext(this.utilsService.financeAppSettingsData),
                                        this.utilsService.financeAppSettingsData),
                    this.commonApiService.getPermissions(this.listService.getListContext(this.utilsService.financeAppLogsData),
                                        this.utilsService.financeAppLogsData),
                    this.commonApiService.getPermissions(this.listService.getListContext(this.utilsService.financeAppWorkingDaysData),
                                        this.utilsService.financeAppWorkingDaysData),
                    this.commonApiService.getPermissions(this.listService.getListContext(this.utilsService.financeAppSummaryData),
                                        this.utilsService.financeAppSummaryData)
            ]).mergeAll()
            .subscribe(
            data => {
                 if (typeof(data) == 'object' &&
                    data.hasOwnProperty('apiCall') &&
                    data.hasOwnProperty('result') &&
                    data.hasOwnProperty('listName') &&
                    data['apiCall'] == this.utilsService.apiCallGetPermissions) {

                    for (let key in data) {
                        if (data.hasOwnProperty(key)) {
                            switch (key) {
                            case this.utilsService.manageWeb:
                                this.logs.push('user has ManageWebPermissions: ' + data[key], this.utilsService.infoStatus, true)
                                break;
                            case this.utilsService.manageList:
                                this.logs.push(`${data['listName']}: user has ManageListPermissions: ` + data[key], this.utilsService.infoStatus, true)
                                break;
                            case this.utilsService.viewList:
                                this.logs.push(`${data['listName']}: user has ViewListPermissions: ` + data[key], this.utilsService.infoStatus, true)
                                break;
                            case this.utilsService.addListItems:
                                this.logs.push(`${data['listName']}: user has AddListItemsPermissions: ` + data[key], this.utilsService.infoStatus, true)
                                break;
                            default:
                                break;
                            }
                        }
                    }
                } else {
                    if(typeof(data) == 'object'){
                        for (let key in data) {
                            this.logs.push(`${key} : ${data[key]}`)
                        }
                        console.log(data)
                    } else {
                        this.logs.push(data, this.utilsService.infoStatus, true);
                    }
                }
            },
            err => {
                this.logs.push(err, this.utilsService.errorStatus, false);
                try {
                    this.logs.push('error unable to check user permissions',this.utilsService.message, this.utilsService.redStatus)
                } catch (e) {
                    this.logs.push('error updaing uiState Service', this.utilsService.errorStatus, false)
                }
            },
            () => {
                this.logs.push('get permissions observer has completed', this.utilsService.infoStatus, true);
            }
        )
    }


    // getWebPermissions(){
    //         this.commonApiService.getWebPermissions(this.utilsService.hostWeb, 
    //                                         this.utilsService.financeAppResourceData)
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


}