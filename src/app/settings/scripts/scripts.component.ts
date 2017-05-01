import { Component } from '@angular/core'
import { ScriptService } from '../../shared/scripts.service'
import { HealthReportService } from '../../shared/health-report.service'
import { DataContextService } from '../../shared/data-context.service'
import { UiStateService } from '../../shared/ui-state.service'


@Component({
    selector: 'scripts',
    templateUrl: './scripts.component.html',
    styles: [``]
})
export class ScriptsComponent {

    public log:Array<any> 
    constructor(private scriptService: ScriptService,
                private healthReportService: HealthReportService,
                private dataContextService: DataContextService,
                private uiStateService: UiStateService) {
        this.log = [];

        this.scriptService.getHealthReportDataStream().subscribe(this.getSubscriber());
        this.scriptService.getActionHealthReportDataStream().subscribe(this.getSubscriber());
        this.scriptService.getProvisionerDataStream().subscribe(this.getSubscriber());
        this.scriptService.getSettingsStream().subscribe(this.getSubscriber());
        this.scriptService.getPermissionsStream().subscribe(this.getSubscriber());


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
        let _healthReport = this.healthReportService.healthReport
        this.log.push(_healthReport)
    }

    actionHealthReport(){
        this.scriptService.actionHealthReport()
        let _actionHealthReportData = this.healthReportService.actionHealthReport
        this.log.push(_actionHealthReportData)
    }

    getPermissions(){
        this.scriptService.getPermissions()
        
    }

    checkSettings(){
        this.scriptService.settingsListReport();
        let _settingsListReport = this.healthReportService.settingsReport
        this.log.push(_settingsListReport)
    }

    initProvisioner(){
        this.scriptService.provisioner();
        let _provisionerReport = this.healthReportService.provisionerReport
        this.log.push(_provisionerReport)
    }

    saveData() {
        this.dataContextService.submitApiData()
        let _submitDataReport = this.healthReportService.submitDataReport
        this.log.push(_submitDataReport)
    }

    getData(){
        this.dataContextService.getApiData()
        let _getDataReport = this.healthReportService.getDataReport
        this.log.push(_getDataReport)
    }

    getUiStateValues(){
        let uiValues = this.uiStateService.uiStateValues
        console.log(uiValues)
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
                    this.log.push(data);
                }
                
            },
            error(err){
                console.log('error', err)
                let _log = {
                    description: err,
                    type: 'error'
                }
                if (err && this.log) {
                    this.log.push(err);
                }
                
            },
            complete(){
                console.log('completed');
                let _log = {
                    description: 'completed',
                    type: 'complete'
                }
                if (this.log) {
                    this.log.push('completed');
                }
            }
        }
    }

}