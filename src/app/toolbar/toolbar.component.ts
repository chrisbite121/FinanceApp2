import { Component } from '@angular/core'
import { ScriptService } from '../service/scripts.service'
import { UtilsService } from '../service/utils.service'
import { SettingsService } from '../service/settings.service'
import { UiStateService } from '../service/ui-state.service'

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
    public showSave: boolean = true;
    
    constructor(private scriptService: ScriptService,
                private utilsService: UtilsService,
                private settingsService: SettingsService,
                private uiStateService: UiStateService){
        console.log('toolbar loaded')

        this.settingsService.getSettingsStream().subscribe(data => {
            if(data.hasOwnProperty('autoSave') &&
                data.autoSave == false) {
                    this.showSave = true;
            }
            else if(data.hasOwnProperty('autoSave') &&
                data.autoSave == true) {
                    this.showSave = false;
            }
        })
    }

    refreshData($event){
        this.scriptService.getAppData([
            this.utilsService.financeAppResourceData,
            this.utilsService.financeAppMaterialData,
            this.utilsService.financeAppTotalsData,
            this.utilsService.financeAppSummaryData
        ], this.settingsService.year)
            .subscribe(
                data => console.log(data),
                err => console.log(err),
                () => this.uiStateService.updateMessage('refresh Data complete', this.utilsService.completeStatus)
        )
    }

    saveData($event){
        this.scriptService.saveAppData()
            .subscribe(
                data => console.log(data),
                err => console.log(err),
                () => this.uiStateService.updateMessage('save data complete', this.utilsService.completeStatus)
            )
    }

    undoData($event) {
        alert('undo data event called, functionality not yet implemented')
    }

    redoData($event) {
        alert('redo data event called, functionality not yet implemented')
    }
}