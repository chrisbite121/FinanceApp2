import { Component } from '@angular/core'
import { ScriptService } from '../../../service/scripts.service'
import { HealthReportService } from '../../../service/health-report.service'
import { UtilsService } from '../../../service/utils.service'


@Component({
    selector: 'healthreport',
    templateUrl: './healthreport.component.html',
    styleUrls: [`./healthreport.component.css`]
})
export class HealthReportComponent {
    public logs:Array<any>

    constructor(private scriptService: ScriptService,
                private healthReportService: HealthReportService,
                private utilsService: UtilsService){
        this.logs = [];
    }

   showHealthReport(event){
        console.log(this.healthReportService.healthReport)
    }

    getHealthReport(event){
        this.scriptService.healthReport([
            this.utilsService.financeAppResourceData,
            this.utilsService.financeAppMaterialData,
            this.utilsService.financeAppTotalsData,
            this.utilsService.financeAppSummaryData
            ])
            .subscribe(data => console.log(data),
                        err=> console.error(err),
                        ()=> console.log('get Health report completed')
            )
    }

    actionHealthReport(event){
        this.scriptService.actionHealthReport([
            this.utilsService.financeAppResourceData,
            this.utilsService.financeAppMaterialData,
            this.utilsService.financeAppTotalsData,
            this.utilsService.financeAppSummaryData
            ])
                    .subscribe(
                        data => console.log(data),
                        err => console.error(err),
                        () => console.log('action health report compelted')
                    )
    }

    checkSettings(event){
        this.scriptService.healthReport([
            this.utilsService.financeAppSettingsData
        ])
            .subscribe(
                data => console.log(data),
                err => console.error(err),
                () => console.log('check settings list compelted')
            );
    }

    deleteHealthReport(event){
        this.healthReportService.resetHealthReport([
            this.utilsService.financeAppResourceData,
            this.utilsService.financeAppMaterialData,
            this.utilsService.financeAppTotalsData,
            this.utilsService.financeAppLogsData,
            this.utilsService.financeAppSettingsData,
            this.utilsService.financeAppWorkingDaysData,
            this.utilsService.financeAppSummaryData
        ])
            .subscribe(
                data => {
                    console.log(data)
                },
                err => {
                    console.log(err)
                },
                () => {
                    console.log('Delete Health Report completed')
                }
            )
    }    
}