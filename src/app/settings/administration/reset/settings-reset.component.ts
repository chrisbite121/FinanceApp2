import { Component } from '@angular/core'
import { ScriptService } from '../../../service/scripts.service'
import { UtilsService } from '../../../service/utils.service'

@Component({
    selector: 'settings-reset',
    templateUrl: './settings-reset.component.html'
})
export class SettingsResetComponent{ 
    public logs: Array<any>

    constructor(private scriptService: ScriptService,
                private utilsService: UtilsService){}

resetAppWebLists(event){
    this.scriptService.resetLists(this.utilsService.appWeb)
        .subscribe(
            data => {console.log(data)},
            err => {console.log(err)},
            () => {console.log('reset app web lists complete')}
        )
}

resetHostWebLists(event){
    this.scriptService.resetLists(this.utilsService.hostWeb)
        .subscribe(
            data => {console.log(data)},
            err => {console.log(err)},
            () => {console.log('reset host web lists complete')}
        )
}



}