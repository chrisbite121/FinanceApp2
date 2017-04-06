import { SettingsComponent } from './settings.component';
import { SettingsProvisionerComponent } from './provisioner/settings-provisioner.component';
import { SettingsMainComponent } from './main/settings-main.component';
import { SettingsResetComponent } from './reset/settings-reset.component';
import { SettingsMenuComponent } from './menu/settings-menu.component';
import { SettingsCalendarComponent } from './calendar/settings-calendar.component';
import { LoggerComponent } from './logger/logger.component'
import { MappingComponent } from './mapping/settings-mapping.component'
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
        path: '',
        component: SettingsMainComponent,
        outlet: 'settingsContent'
    },
    {
        path: 'map',
        component: MappingComponent,
        outlet: 'settingsContent'
    },    
    {
        path: '',
        component: SettingsMenuComponent,
        outlet: 'settingsMenu'
    }
]

export const settingsRoutes = [
    { 
        path: 'settings', 
        component: SettingsComponent,
        children: settingsSubRoutes 
    }
]