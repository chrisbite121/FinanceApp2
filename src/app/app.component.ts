import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import 'rxjs/operator/mergeAll'


import { UtilsService } from './shared/utils.service'
import { LogService } from './shared/log.service'
import { ScriptService} from './shared/scripts.service'
import { CommonApiService } from './shared/api-common.service'
import { SettingsService } from './shared/settings.service'
import { NotificationService } from './shared/notification.service'

@Component({
  selector: 'my-app',
  template: `
    <nav-bar></nav-bar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent  { 
  constructor(private utilsService: UtilsService,
              private logService: LogService,
              private scriptService: ScriptService,
              private commonApiService: CommonApiService,
              private settingsService: SettingsService,
              private notificationService: NotificationService){

                
                //1 init app checks and loads settings and logs, if settings set to auto run health report run that also
                //2 getAppData gets application data - don't bother checking if list exists
                //3 update health report to check user permissions to modidfy api calls and scripts to disregard permission checks.


                this.scriptService.initApp()
                    .subscribe(
                          data => {
                              // if settings list doesn't exist need to prompt user
                              //if data lists don't exist need to prompt user
                              //if process settings data fails
                              //if create log list fails
                              //if get data fails
                              this.logService.log(data, this.utilsService.infoStatus, true)
                          },
                          err => {
                            this.logService.log(err, this.utilsService.errorStatus, false);
                          },
                          () => {
                            this.logService.log(`init app call complete`, this.utilsService.infoStatus, true);
                          }
                    )

                  this.scriptService.loadAppData(true, true, true)
                    .subscribe(
                      data => {

                      },
                      err => {
                        this.logService.log(err, this.utilsService.errorStatus, false);
                      },
                      () => {
                        this.logService.log(`load App data complete`, this.utilsService.infoStatus, true);
                      }

                    )

                  this.commonApiService.getPermissions(this.utilsService.hostWeb, 
                                        this.utilsService.financeAppResourceData)
                    .subscribe(
                        data => {
                            this.logService.log('Observer.next is array:  ' + String(Array.isArray(data)), this.utilsService.infoStatus, true);
                            if (Array.isArray(data)) {
                                console.log('receiving permissions results array')
                                console.error(data);
                                data.forEach(element => {
                                    this.logService.log(element, this.utilsService.infoStatus, true);
                                    switch (element.permissionType) {
                                    
                                    case this.utilsService.manageWeb:
                                        this.logService.log('user has ManageWebPermissions: ' + element.value, this.utilsService.infoStatus, true)
                                        
                                        try { 
                                            this.settingsService.manageWeb = element.value
                                        } catch (e) {
                                            this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                                        }
                                        
                                        break;
                                    case this.utilsService.manageList:
                                        this.logService.log('user has ManageListPermissions: ' + element.value, this.utilsService.infoStatus, true)
                                        
                                        try {
                                            this.settingsService.manageList = element.value
                                        } catch (e) {
                                            this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                                        }
                                        
                                        break;
                                    case this.utilsService.viewList:
                                        this.logService.log('user has ViewListPermissions: ' + element.value, this.utilsService.infoStatus, true)
                                        
                                        try {
                                            this.settingsService.viewList = element.value;
                                        } catch (e) {
                                            this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                                        }                                    

                                        break;
                                    case this.utilsService.addListItems:
                                        this.logService.log('user has AddListItemsPermissions: ' + element.value, this.utilsService.infoStatus, true)
                                        
                                        try {
                                            this.settingsService.addListItems = element.value
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
                                this.notificationService.send('error unable to check user permissions',this.utilsService.message, this.utilsService.redStatus)
                            } catch (e) {
                                this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                            }
                        },
                        () => {
                            this.logService.log('get permissions observer has completed', this.utilsService.infoStatus, true);
                        }
                    );
              }

}