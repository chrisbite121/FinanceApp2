import { Component } from '@angular/core'
import { DataContextService } from '../../../service/data-context.service'
import { SettingsService } from '../../../service/settings.service'
@Component({
    selector: 'cached',
    templateUrl: './cached.component.html',
    styleUrls: [`./cached.component.css`]
})
export class CachedComponent {
    public logs: Array<any>

    constructor(private dataContextService: DataContextService,
                private settingsService: SettingsService){
        this.logs = [];
    }

    showResourceData(event){
        let resourceData = this.dataContextService.resourceData
        console.log(resourceData)
        
        if (resourceData){
            this.logs.push(`Number of items found: ${resourceData.length}`)
            resourceData.forEach(element => {
                this.logs.push(JSON.stringify(element))
            })    
        } else {
            this.logs.push(`No items found`)
        }
        
    }

    showMaterialData(event){
        let materialData = this.dataContextService.materialData
        console.log(materialData)

        if(materialData && Array.isArray(materialData)){
            this.logs.push(`Number of items found: ${materialData.length}`)
            materialData.forEach(element => {
                this.logs.push(JSON.stringify(element))
            })
        } else {
            this.logs.push('No items found')
        }
        
    }

    showTotalsData(event){
        let totalData = this.dataContextService.totalsData
        console.log(totalData)

        if(totalData && Array.isArray(totalData)) {
            this.logs.push(`Number of items found: ${totalData.length}`)
            totalData.forEach(element => {
                this.logs.push(JSON.stringify(element))
            })
        } else {
            this.logs.push('No items found')
        }

        
    }

    showSummaryData(event){
        let summaryData = this.dataContextService.summaryData
        console.log(summaryData)

        if(summaryData && Array.isArray(summaryData)) {
            this.logs.push(`Number of items found: ${summaryData.length}`)
            summaryData.forEach(element => {
                this.logs.push(JSON.stringify(element))
            })
        } else {
            this.logs.push('No items found')
        }
    }

    showWorkdaysData(event){
        let workdayData = this.dataContextService.workdayData
        console.log(workdayData)

        if(workdayData && Array.isArray(workdayData)) {
            this.logs.push(`Number of items found: ${workdayData.length}`)
            workdayData.forEach(element => {
                this.logs.push(JSON.stringify(element))
            })
        } else {
            this.logs.push('No items found')
        }
    }    

    showSettingsData(event){
        console.log('SETTINGS LIST')
        console.log(this.settingsService.settings)
        console.log('APPLICATION SETTINGS')
        console.log(this.settingsService.appSettings)
    }


}