import { Component } from '@angular/core'
import { FabricPivotWrapperComponent } from '../../office-fabric/pivot/fabric.pivot.wrapper.component'

import { pivotSummary } from './summary-nav.config'

@Component({
    selector: 'summary-nav',
    templateUrl: 'summary-nav.component.html',
    styleUrls: ['./summary-nav.component.css']
})
export class SummaryNavComponent {
    public navArray: Array<Object>

    constructor(){
        this.navArray = pivotSummary
    }
}