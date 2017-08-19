import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { SharedModule } from '../shared/shared.module'

import { AgGridModule } from "ag-grid-angular/main";
import { NumericEditorComponent } from '../cell-editor/numeric-editor.component'

//components
import { Tab1Component } from './tab1.component'

import { ResourceComponent } from './resource/resource.component'
import { MaterialComponent } from './material/material.component'
import { TravelComponent } from './travel/travel.component'
// import { AggregateComponent } from './aggregate/aggregate.component'
import { TotalComponent } from './total/total.component'

import { Aggregate2Component } from './aggregate2/aggregate2.component'

import { Tab1NavComponent } from './nav/tab1-nav.component'

import  { tab1Routes } from './tab1.routes'

@NgModule({
    imports:  [CommonModule,
                FormsModule,
                SharedModule,
                AgGridModule.withComponents([
                    NumericEditorComponent
                ]),   
                RouterModule.forChild(tab1Routes),
                
    ],
    declarations: [
        Tab1Component,
        ResourceComponent,
        MaterialComponent,
        TravelComponent,
        Tab1NavComponent,
        // AggregateComponent,
        TotalComponent,
        Aggregate2Component,
        NumericEditorComponent
    ],
    exports: [ Tab1Component ]
})
export class Tab1Module {

}