import { Tab1Component } from './tab1.component'

import { ResourceComponent } from './resource/resource.component'
import { MaterialComponent } from './material/material.component'
import { TravelComponent } from './travel/travel.component'
import { Tab1NavComponent } from './nav/tab1-nav.component'
// import { AggregateComponent } from './aggregate/aggregate.component'
import  { TotalComponent } from './total/total.component'
import { Aggregate2Component } from './aggregate2/aggregate2.component'
import { WorkResourceComponent } from './work-resource/work-resource.component'

const tab1SubRoutes = [
    {
        path: 'resource',
        component: ResourceComponent
    },
    {
        path: 'material',
        component: MaterialComponent
    },
    {
        path: 'travel',
        component: TravelComponent
    },
    {
        path: 'aggregate',
        component: Aggregate2Component
    },     
    {
        path: 'total',
        component: TotalComponent
    }, 
    {
        path: 'work',
        component: WorkResourceComponent
    },     
    {
        path: '',
        component: ResourceComponent
    },

    //navigation
    {
        path: '',
        outlet: 'tab1nav',
        component: Tab1NavComponent
    }, 
    

]

export const tab1Routes = [
    {
        path: 'tab1',
        component: Tab1Component,
        children: tab1SubRoutes
    }
]