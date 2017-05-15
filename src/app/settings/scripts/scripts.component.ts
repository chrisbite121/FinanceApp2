import { Component } from '@angular/core'
import { ScriptService } from '../../shared/scripts.service'
import { HealthReportService } from '../../shared/health-report.service'
import { DataContextService } from '../../shared/data-context.service'
import { UiStateService } from '../../shared/ui-state.service'
import { CommonApiService } from '../../shared/api-common.service'
import { UtilsService } from '../../shared/utils.service'

@Component({
    selector: 'scripts',
    templateUrl: './scripts.component.html',
    styles: [``]
})
export class ScriptsComponent {
    public logs:Array<any> = []
    constructor(private scriptService: ScriptService,
                private healthReportService: HealthReportService,
                private dataContextService: DataContextService,
                private commonApiService: CommonApiService,
                private utilsService: UtilsService) {

        this.scriptService.getScriptsDataStream().subscribe(this.getSubscriber());
        
        //end constructor
    }

    /*
        Contents:

        1. get permissions
        2. Health Report
        3. Action Health report
        4. Provisioner
        5. Settings Check

        6. get data
        7. submit data
    */

    getHealthReport(){
        this.scriptService.healthReport()
    }

    actionHealthReport(){
        this.scriptService.actionHealthReport()
    }

    getPermissions(){
        this.commonApiService.getPermissions(this.utilsService.hostWeb, 
                            this.utilsService.financeAppResourceData)
        
    }

    checkSettings(){
        this.scriptService.settingsListReport();
    }

    initProvisioner(){
        this.scriptService.provisioner().subscribe(this.getSubscriber());
    }

    saveAppData() {
        this.scriptService.saveAppData().subscribe(this.getSubscriber())
    }

    loadAppData(){
        this.scriptService.loadAppData(true, true, true).subscribe(this.getSubscriber())
    }

   showHealthReport(){
        console.log(this.healthReportService.healthReport)
    }

    showResourceData(){
        let resourceData = this.dataContextService.resourceData
        console.log(resourceData)

        resourceData.forEach(element => {
            this.logs.push(JSON.stringify(element))
        })
    }

    showMaterialData(){
        let materialData = this.dataContextService.materialData
        console.log(materialData)

        materialData.forEach(element => {
            this.logs.push(JSON.stringify(element))
        })
    }

    showTotalsData(){
        let totalData = this.dataContextService.totalsData
        console.log(totalData)

        totalData.forEach(element => {
            this.logs.push(JSON.stringify(element))
        })
        
    }

    initApp() {
        // this.scriptService.initApp()
        //     .subscribe(this.getSubscriber())
    }

    getSubscriber() {
        return {
            next(data){
                console.log('next', data)
                let _log = {
                    description: data,
                    type: 'info'
                }
                if (data && this.log) {
                    this.logs.push(data);
                }
                
            },
            error(err){
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                if (err && this.log) {
                    this.logs.push(err);
                }
                
            },
            complete(){
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                if (this.log) {
                    this.logs.push('completed');
                }
            }
        }
    }
}