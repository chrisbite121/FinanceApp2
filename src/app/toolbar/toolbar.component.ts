import { Component, OnInit } from '@angular/core'
import { ScriptService } from '../service/scripts.service'
import { UtilsService } from '../service/utils.service'
import { SettingsService } from '../service/settings.service'
import { UiStateService } from '../service/ui-state.service'
import { Router, NavigationStart} from '@angular/router'

import { fadeInAnimation } from '../animations/fade-in.animation'

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css'],
    animations: [fadeInAnimation]
})
export class ToolbarComponent implements OnInit {
    public showSave: boolean = true;
    public showToolbar: boolean = true;
    
    constructor(private scriptService: ScriptService,
                private utilsService: UtilsService,
                private settingsService: SettingsService,
                private uiStateService: UiStateService,
                private router: Router){
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
                        .subscribe()
        )
    }

    saveData($event){
        this.scriptService.saveAppData()
            .subscribe(
                data => console.log(data),
                err => console.log(err),
                () => this.uiStateService.updateMessage('save data complete', this.utilsService.completeStatus)
                        .subscribe()
            )
    }

    undoData($event) {
        alert('undo data event called, functionality not yet implemented')
    }

    redoData($event) {
        alert('redo data event called, functionality not yet implemented')
    }

    ngOnInit() {
        this.router.events
          .subscribe((event) => {
            // example: NavigationStart, RoutesRecognized, NavigationEnd
            if(event instanceof NavigationStart) {
                if (event.url.indexOf('/settings') == -1) {
                    this.showToolbar = true
                } else {
                    this.showToolbar = false;
                }
            }

          });
      }
}