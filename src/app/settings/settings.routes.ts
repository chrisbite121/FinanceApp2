import { SettingsComponent } from './settings.component';
import { SettingsProvisionerComponent } from './provisioner/settings-provisioner.component';
import { SettingsMainComponent } from './main/settings-main.component';
import { SettingsResetComponent } from './reset/settings-reset.component';
// import { SettingsMenuComponent } from './menu/settings-menu.component';
import { SettingsCalendarComponent } from './calendar/settings-calendar.component';
import { LoggerComponent } from './logger/logger.component'
import { MappingComponent } from './mapping/settings-mapping.component'
import { LookFeelComponent } from './look-feel/look-feel.component'
import { ResourceListComponent } from './resource-list/resource-list.component'
import { TotalListComponent } from './total-list/total-list.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { SettingListComponent } from './setting-list/setting-list.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { ScriptsComponent } from './scripts/scripts.component'

const settingsSubRoutes = [
    {
        path: 'settings',
        component: SettingsMainComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'provision',
        component: SettingsProvisionerComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'reset',
        component: SettingsResetComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'calendar',
        component: SettingsCalendarComponent,
        outlet: 'settingsContent'
    },    
    {
        path: 'logger',
        component: LoggerComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'map',
        component: MappingComponent,
        outlet: 'settingsContent'
    },
    {
        path: '',
        component: SettingsMainComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'lookandfeel',
        component: LookFeelComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'resourcelist',
        component: ResourceListComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'materialslist',
        component: MaterialListComponent,
        outlet: 'settingsContent'
    }, 
    {
        path: 'totalslist',
        component: TotalListComponent,
        outlet: 'settingsContent'
    }, 
    {
        path: 'settingslist',
        component: SettingListComponent,
        outlet: 'settingsContent'
    }, 
    {
        path: 'userpermissions',
        component: UserPermissionsComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'scripts',
        component: ScriptsComponent,
        outlet: 'settingsContent'
    }          

    // {
    //     path: '',
    //     component: SettingsMenuComponent,
    //     outlet: 'settingsMenu'
    // },        

  
]

export const settingsRoutes = [
    { 
        path: 'settings', 
        component: SettingsComponent,
        children: settingsSubRoutes 
    }
]