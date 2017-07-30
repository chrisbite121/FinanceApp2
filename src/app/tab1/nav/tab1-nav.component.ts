import { Component, OnInit } from '@angular/core'
import { FabricPivotWrapperComponent } from '../../office-fabric/pivot/fabric.pivot.wrapper.component'

import { pivotGrid } from './tab1-nav.config'

@Component({
    selector: 'tab1nav',
    templateUrl: './tab1-nav.component.html',
    styleUrls: ['./tab1-nav.component.css']
})
export class Tab1NavComponent {
    public navArray: Array<Object>

    constructor() {
        this.navArray = pivotGrid
    }
}