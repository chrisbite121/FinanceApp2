import { Component, Input, OnChanges } from '@angular/core'
import { FabricSpinnerWrapperComponent } from '../../office-fabric/spinner/fabric.spinner.wrapper.component'

import { UiStateService } from '../../service/ui-state.service'
import { Subscription } from 'rxjs/subscription'
@Component({
    selector: 'messagebar',
    templateUrl: './messagebar.component.html',
    styleUrls: ['./messagebar.component.css']
})
export class MessagebarComponent implements OnChanges {
    public successImageUrl: string;
    public errorImageUrl: string;
    public icon: string;
    public message: string;
    public messageStream: Subscription

    constructor(private uiStateService: UiStateService){
        this.icon = 'spinner'
        this.successImageUrl = require('../../assets/tick.png')
        this.errorImageUrl = require('../../assets/error.png')
        this.message = 'loading...'

        this.messageStream = this.uiStateService.getMessageDataStream().subscribe(data => {
            console.log(data)
            if(data.message){
                this.message = data.message
            }
            if(data.icon){
                this.icon = data.icon
            }
        });
    }

    ngOnChanges(change){
        console.log(change)
    }
}