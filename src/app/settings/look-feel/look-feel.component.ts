import { Component, OnInit } from '@angular/core'
import { ScriptService } from '../../service/scripts.service'
import { UtilsService } from '../../service/utils.service'
import { SettingsService } from '../../service/settings.service'

@Component({
    selector: 'look-feel',
    templateUrl: './look-feel.component.html',
    styles: [``]
})
export class LookFeelComponent implements OnInit {
    public headerColourValue:string;
    public headerFontColourValue:string;
    public highlightColourValue:string;
    public highlightFontColourValue:string;
    
    constructor(private scriptService: ScriptService,
                private utilsService: UtilsService,
                private settingsService: SettingsService){

    }

    ngOnInit() {
        this.settingsService.getSettingsStream().subscribe(data => {
            this.headerColourValue = data.headerColour
            this.headerFontColourValue = data.headerFontColour
            this.highlightColourValue = data.highlightColour
            this.highlightFontColourValue = data.highlightFontColour
        })
        this.settingsService.getSettings()
    }    

    headerColourSet(event){
        this.headerColourValue = event
    }
    
    headerFontColourSet(event){
        this.headerFontColourValue = event
    }

    highlightColourSet(event){
        this.highlightColourValue = event
    }

    highlightFontColourSet(event){
        this.highlightFontColourValue = event
    }    

    saveUpdates(event) {
        this.scriptService.updateSetting(this.prepDataForUpdate())
                .subscribe(
                    data => {
                        if (typeof(data) == 'object' &&
                            data.hasOwnProperty('apiCall') &&
                            data.hasOwnProperty('result') &&
                            data.apiCall == this.utilsService.apiCallUpdateItem &&
                            data.result == true
                        ) {
                            console.log('item updated successfully')
                        }                
                        console.log('next', data)
                    },
                    err => {
                        console.log('error', err)
                    },
                    () => {
                        console.log('completed')
                        this.settingsService.getSettings()
                    }
                )
    }

    prepDataForUpdate(){
        return [
            {fieldName: 'HeaderColour', fieldValue: this.headerColourValue},
            {fieldName: 'HeaderFontColour', fieldValue: this.headerFontColourValue},
            {fieldName: 'HighlightColour', fieldValue: this.highlightColourValue},
            {fieldName: 'HighlightFontColour', fieldValue: this.highlightFontColourValue}
            ]
    }     
}