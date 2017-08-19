import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { SharedModule } from '../shared/shared.module'

import { SettingsComponent } from './settings.component';

import { SettingsMainComponent } from './main/settings-main.component';
import { SettingsMenuComponent } from './menu/settings-menu.component';
import { SettingsWorkDaysComponent } from './workdays/workdays.component';
import { LoggerComponent } from './logger/logger.component';
import { LogListComponent } from './list-manager/log-list/log-list.component';
import { LookFeelComponent } from './look-feel/look-feel.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { TestComponent } from './test/test.component'

import { AdministrationComponent } from './administration/administration.component'
import { SettingsResetComponent } from './administration/reset/settings-reset.component';
import { SettingsProvisionerComponent } from './administration/provisioner/settings-provisioner.component';
import { HealthReportComponent } from './administration/healthreport/healthreport.component'
import { DataComponent } from './administration/data/data.component'
import { CachedComponent } from './administration/cached/cached.component'
import { NotificationComponent } from './administration/notification/notification.component'

import { ApiLoggerComponent } from './shared/api-logger.component';

import { ListManagerComponent } from './list-manager/list-manager.component'
import { ListManagerApiComponent } from './list-manager/shared/list-manager-api.component'
import { ResourceListComponent } from './list-manager/resource-list/resource-list.component';
import { TotalListComponent } from './list-manager/total-list/total-list.component';
import { MaterialListComponent } from './list-manager/material-list/material-list.component';
import { SettingListComponent } from './list-manager/setting-list/setting-list.component';
import { WorkdaysListComponent } from './list-manager/workdays-list/workdays-list.component';
import { SummaryListComponent } from './list-manager/summary-list/summary-list.component';


import { settingsRoutes } from './settings.routes';

@NgModule({
    imports:  [CommonModule,
                RouterModule.forChild(settingsRoutes),
                FormsModule,
               SharedModule],
    declarations: [ 
        SettingsComponent,
        
        SettingsMainComponent,
        SettingsProvisionerComponent,
        SettingsMenuComponent,
        SettingsWorkDaysComponent,
        LoggerComponent,
        LogListComponent,
        LookFeelComponent,
        ApiLoggerComponent,
        UserPermissionsComponent,
        TestComponent,

        AdministrationComponent,
        SettingsResetComponent,
        HealthReportComponent,
        CachedComponent,
        DataComponent,
        NotificationComponent,

        ListManagerComponent,
        ListManagerApiComponent,
        ResourceListComponent,
        TotalListComponent,
        MaterialListComponent,
        SettingListComponent,
        WorkdaysListComponent,
        SummaryListComponent
     ],
    exports: [ SettingsComponent ]
})
export class SettingsModule {

}