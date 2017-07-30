import { SummaryComponent } from './summary.component'
import { HomeComponent } from './home/home.component'
import { DashboardComponent } from './dashboard/dashboard.component'

import { SummaryNavComponent } from './nav/summary-nav.component'

const summarySubRoutes = [
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: '',
        component: HomeComponent
    },
    //navigation
    {
        path: '',
        outlet: 'summarynav',
        component: SummaryNavComponent
    }
]

export const summaryRoutes = [
    {
        path: 'summary',
        component: SummaryComponent,
        children: summarySubRoutes
    }
]