import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import 'rxjs/operator/mergeAll'


import { UtilsService } from './service/utils.service'
import { LogService } from './service/log.service'
import { ScriptService} from './service/scripts.service'
import { CommonApiService } from './service/api-common.service'
import { SettingsService } from './service/settings.service'
import { NotificationService } from './service/notification.service'
import { UiStateService } from './service/ui-state.service'
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})
export class AppComponent  { 
  constructor(private utilsService: UtilsService,
              private logService: LogService,
              private scriptService: ScriptService,
              private commonApiService: CommonApiService,
              private settingsService: SettingsService,
              private notificationService: NotificationService,
              private uiStateService: UiStateService){
                
                if (this.settingsService.sharePointMode) {
                    this.initSharePointApplication()
                    this.getSharePointPermissions()
                } else {
                    this.logService.log('Application is not in sharepoint mode', this.utilsService.infoStatus, false)
                    // grid components need to know if init call complete before they attempt to load data
                    this.settingsService.initAppComplete = true;
                }
              }

                
    //1 init app checks and loads settings, logs, workdays, if settings set to auto run health report run that also
    //2 getAppData gets application data - don't bother checking if list exists
    //3 update health report to check user permissions to modidfy api calls and scripts to disregard permission checks.

    initSharePointApplication() {
        this.logService.log('initSharePointApplication Called', this.utilsService.infoStatus, false)
        this.scriptService.initApp()
        .subscribe(
                data => {
                    this.logService.log(data, this.utilsService.infoStatus, true)
                    console.log(data);

                },
                err => {
                    this.logService.log(err, this.utilsService.errorStatus, false);
                    console.error(err)
                },
                () => {
                    this.logService.log('initialisation call complete - loading app data', this.utilsService.infoStatus, false)
                    this.scriptService.loadAppData([this.utilsService.financeAppResourceData,
                        this.utilsService.financeAppMaterialData,
                        this.utilsService.financeAppTotalsData,
                        this.utilsService.financeAppSummaryData], this.settingsService.year)
                            .subscribe(data => console.log(data),
                                        err => console.log(err),
                                        () => { // grid components need to know if init call complete before they attempt to load data
                                                this.logService.log('init app call complete, loading app data', this.utilsService.infoStatus, true)
                                                this.settingsService.initAppComplete = true;
                                                this.uiStateService.updateMessage('Init App Complete', 'complete')
                                                    .subscribe()
                                             }
                                    )
                    
                }
        )
    }
    
    getSharePointPermissions(){
        this.logService.log(`getSharePointPermissions Called`, this.utilsService.infoStatus, false)

        //get permissions and update settings service
        this.commonApiService.getPermissions(this.utilsService.hostWeb, 
                            this.utilsService.financeAppResourceData)
        .subscribe(
            data => {
                    if (typeof(data) == 'object' &&
                    data.hasOwnProperty('apiCall') &&
                    data.hasOwnProperty('result') &&
                    data.hasOwnProperty('listName') &&
                    data.apiCall == this.utilsService.apiCallGetPermissions &&
                    data.apiCall == this.utilsService.financeAppResourceData) {

                    for (let key in data) {
                        if (data.hasOwnProperty(key)) {
                            switch (key) {
                            case this.utilsService.manageWeb:
                                this.logService.log('user has ManageWebPermissions: ' + data[key], this.utilsService.infoStatus, true)
                                
                                try { 
                                    this.settingsService.manageWeb = data[key]
                                } catch (e) {
                                    this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                                }
                                
                                break;
                            case this.utilsService.manageList:
                                this.logService.log('user has ManageListPermissions: ' + data[key], this.utilsService.infoStatus, true)
                                
                                try {
                                    this.settingsService.manageList = data[key]
                                } catch (e) {
                                    this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                                }
                                
                                break;
                            case this.utilsService.viewList:
                                this.logService.log('user has ViewListPermissions: ' + data[key], this.utilsService.infoStatus, true)
                                
                                try {
                                    this.settingsService.viewList = data[key];
                                } catch (e) {
                                    this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                                }                                    

                                break;
                            case this.utilsService.addListItems:
                                this.logService.log('user has AddListItemsPermissions: ' + data[key], this.utilsService.infoStatus, true)
                                
                                try {
                                    this.settingsService.addListItems = data[key]
                                } catch (e) {
                                    this.logService.log('error updaing uiState Service', this.utilsService.errorStatus, false)
                                }

                                break;
                            default:
                                this.logService.log('unable to determine permissions type', this.utilsService.errorStatus, false)
                                break;
                            }
                        }
                    }
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