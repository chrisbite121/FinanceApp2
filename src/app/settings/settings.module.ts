import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'

//bootstrap
import { BsDropdownModule } from 'ng2-bootstrap/dropdown';
import { ModalModule } from 'ng2-bootstrap/modal';

import { SettingsComponent } from './settings.component';
import { SettingsResetComponent } from './reset/settings-reset.component';
import { SettingsProvisionerComponent } from './provisioner/settings-provisioner.component';
import { SettingsMainComponent } from './main/settings-main.component';
import { SettingsMenuComponent } from './menu/settings-menu.component';
import { SettingsCalendarComponent } from './calendar/settings-calendar.component';
import { LoggerComponent } from './logger/logger.component';
import { MappingComponent } from './mapping/settings-mapping.component';
import { LookFeelComponent } from './look-feel/look-feel.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { TotalListComponent } from './total-list/total-list.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { SettingListComponent } from './setting-list/setting-list.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { ScriptsComponent } from './scripts/scripts.component'
import { ApiLoggerComponent } from './shared/api-logger.component';

import { settingsRoutes } from './settings.routes';

@NgModule({
    imports:  [CommonModule,
                RouterModule.forChild(settingsRoutes),
                FormsModule,
                BsDropdownModule.forRoot(),
                ModalModule.forRoot()],
    declarations: [ 
        SettingsComponent,
        
        SettingsResetComponent,
        SettingsMainComponent,
        SettingsProvisionerComponent,
        SettingsMenuComponent,
        SettingsCalendarComponent,
        LoggerComponent,
        MappingComponent,
        LookFeelComponent,
        ResourceListComponent,
        TotalListComponent,
        MaterialListComponent,
        ApiLoggerComponent,
        SettingListComponent,
        UserPermissionsComponent,
        ScriptsComponent
     ],
    exports: [ SettingsComponent ]
})
export class SettingsModule {

}