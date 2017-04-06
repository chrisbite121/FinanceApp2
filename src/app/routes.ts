import { Routes } from  '@angular/router'

import { SummaryComponent } from './summary/summary.component'
 import { Tab1Component } from  './tab1/tab1.component'
 import { Error404Component } from './errors/404.component'



export const appRoutes = [
     { path: 'summary', component: SummaryComponent },
     { path: 'tab1', component: Tab1Component },
     { path: '404', component: Error404Component },
     { path: '', redirectTo: '/summary', pathMatch: 'full'}
]