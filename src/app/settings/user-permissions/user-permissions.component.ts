import { Component } from '@angular/core'
import { UtilsService } from '../../shared/utils.service'
import { CommonApiService } from '../../shared/api-common.service'
import { UiStateService } from '../../shared/ui-state.service'
import { LogService } from '../../shared/log.service'

@Component({
    selector: 'permissions',
    templateUrl: './user-permissions.component.html',
    styles: [``]
})
export class UserPermissionsComponent {
    private logs: Array<any>

    constructor(private utilsService: UtilsService,
                private commonApiService: CommonApiService,
                private logService: LogService,
                private uiStateService: UiStateService ) {
        this.logs = [];
    }

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
                            let _log = {
                                description: element.permissionType + ' : ' + element.value,
                                type: 'info'
                            }
                            this.logs.push(_log);

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
                            case this.utilsService.viewList:
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
                        let _log = {
                            description: data,
                            type: 'info'
                        }
                        this.logs.push(_log);
                    }
                },
                err => {
                    this.logService.log(err, this.utilsService.errorStatus, false);
                    
                    try {
                        this.uiStateService.updateUiState(this.utilsService.message, 'error unable to check user permissions')
                        this.uiStateService.updateUiState(this.utilsService.uiState, this.utilsService.redStatus)
                    } catch (e) {
                        this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                    }                    
                    
                    let _log = {
                        description: err,
                        type: 'error'
                    }
                    this.logs.push(_log);
                },
                () => {
                    this.logService.log('get permissions observer has completed', this.utilsService.infoStatus, true);
                    let _log = {
                        description: 'completed',
                        type: 'complete'
                    }
                    this.logs.push(_log);
                }
            );
        }

    getWebPermissions(){
            this.commonApiService.getWebPermissions(this.utilsService.hostWeb, 
                                            this.utilsService.financeAppResourceData)
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


}