import { Component } from '@angular/core'
import { FabricPivotWrapperComponent } from '../../office-fabric/pivot/fabric.pivot.wrapper.component'

import { adminConfig } from './administration.config'

@Component({
    selector: 'administration',
    templateUrl: './administration.component.html'
})
export class AdministrationComponent {
    public dataArray: Array<Object>

    constructor(){
        this.dataArray = adminConfig
    }
}