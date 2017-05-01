import { Component } from '@angular/core'

import { CommonApiService } from '../../shared/api-common.service'
import { UtilsService } from '../../shared/utils.service'
import { ScriptService } from '../../shared/scripts.service'

@Component({
    selector: 'processes',
    templateUrl: './process.component.html',
    styles: [``]
})
export class ProcessComponent {

    constructor(private commonApiService: CommonApiService,
                private utilsService: UtilsService,
                private scriptService: ScriptService){

    }
}