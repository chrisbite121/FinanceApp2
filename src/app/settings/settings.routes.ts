import { SettingsComponent } from './settings.component';

import { SettingsMainComponent } from './main/settings-main.component';

// import { SettingsMenuComponent } from './menu/settings-menu.component';
import { SettingsWorkDaysComponent } from './workdays/workdays.component';
import { LoggerComponent } from './logger/logger.component'
import { LogListComponent } from './list-manager/log-list/log-list.component'
import { LookFeelComponent } from './look-feel/look-feel.component'
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { TestComponent } from './test/test.component'

import { AdministrationComponent } from './administration/administration.component'
import { SettingsProvisionerComponent } from './administration/provisioner/settings-provisioner.component';
import { SettingsResetComponent } from './administration/reset/settings-reset.component';
import { HealthReportComponent } from './administration/healthreport/healthreport.component'
import { DataComponent } from './administration/data/data.component'
import { CachedComponent } from './administration/cached/cached.component'


import { ListManagerComponent } from './list-manager/list-manager.component'
import { ResourceListComponent } from './list-manager/resource-list/resource-list.component'
import { TotalListComponent } from './list-manager/total-list/total-list.component';
import { MaterialListComponent } from './list-manager/material-list/material-list.component';
import { SettingListComponent } from './list-manager/setting-list/setting-list.component';
import { WorkdaysListComponent } from './list-manager/workdays-list/workdays-list.component';
import { SummaryListComponent } from './list-manager/summary-list/summary-list.component'


const settingsSubRoutes = [
    {
        path: 'settings',
        component: SettingsMainComponent,
        outlet: 'settingsContent'
    },

    {
        path: 'workdays',
        component: SettingsWorkDaysComponent,
        outlet: 'settingsContent'
    },    
    {
        path: 'logger',
        component: LoggerComponent,
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
        path: 'userpermissions',
        component: UserPermissionsComponent,
        outlet: 'settingsContent'
    },

    {
        path: 'administration',
        component: AdministrationComponent,
        outlet: 'settingsContent',
        children: [
            {
                path: 'provision',
                component: SettingsProvisionerComponent,
            },
            {
                path: 'reset',
                component: SettingsResetComponent,
            },
            {
                path: 'healthreport',
                component: HealthReportComponent,
            },
            {
                path: 'cached',
                component: CachedComponent,
            },
            {
                path: 'data',
                component: DataComponent,
            }                                  
        ]
    },
    {
        path: 'listmanager',
        component: ListManagerComponent,
        outlet: 'settingsContent',
        children: [
            {
                path: '',
                component: ResourceListComponent,
            },
            {
                path: 'resourcelist',
                component: ResourceListComponent,
            },
            {
                path: 'materialslist',
                component: MaterialListComponent,
            }, 
            {
                path: 'totalslist',
                component: TotalListComponent,
            }, 
            {
                path: 'summarylist',
                component: SummaryListComponent,
            },             
            {
                path: 'settingslist',
                component: SettingListComponent,
            },
            {
                path: 'workdayslist',
                component: WorkdaysListComponent,
            },            
            {
                path: 'loglist',
                component: LogListComponent
            }
        ]
    },
    {
        path: 'test',
        component: TestComponent,
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