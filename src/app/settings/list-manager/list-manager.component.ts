import { Component } from '@angular/core'
import { FabricPivotWrapperComponent } from '../../office-fabric/pivot/fabric.pivot.wrapper.component'

import { lmConfig } from './list-manager.config'

@Component({
    selector: 'list-manager',
    templateUrl: './list-manager.component.html'
})
export class ListManagerComponent {
    public dataArray: Array<Object>

    constructor(){
        this.dataArray = lmConfig
    }
}