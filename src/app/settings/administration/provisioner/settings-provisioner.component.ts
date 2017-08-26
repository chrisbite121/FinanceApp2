import { Component } from  '@angular/core'
import { ScriptService } from '../../../service/scripts.service'
import { UtilsService } from '../../../service/utils.service'

@Component({
    selector: 'settings-provisioner',
    templateUrl: './settings-provisioner.component.html'
})
export class SettingsProvisionerComponent { 

    public logs: Array<any> = []

    constructor(private scriptService: ScriptService,
                private utilsService: UtilsService){}

provisionHostLists(event){
    this.scriptService.provisioner(
            [this.utilsService.financeAppResourceData, 
            this.utilsService.financeAppMaterialData,
            this.utilsService.financeAppTotalsData,
            this.utilsService.financeAppLogsData,
            this.utilsService.financeAppSettingsData,
            this.utilsService.financeAppWorkingDaysData,
            this.utilsService.financeAppSummaryData])
        .subscribe(
            data => {
                console.log(data)
                this.logs.push(data)
            },
            err => {
                console.log(err)
                this.logs.push(err)
            },
            () => {
                let _msg = 'provisioner host lists script complete'
                console.log(_msg)
                this.logs.push(_msg)
            }
        )
}

provisionAppLists(event){
    this.scriptService.initApp()
    .subscribe(
        data => {
            console.log(data)
            this.logs.push(data)
        },
        err => {
            console.log(err)
            this.logs.push(err)
        },
        () => {
            let _msg = 'provision App lists script complete'
            console.log(_msg)
            this.logs.push(_msg)
        }
    )
}

}