import { Component, Input, ViewChild } from '@angular/core'
import { FabricSpinnerWrapperComponent } from '../../office-fabric/spinner/fabric.spinner.wrapper.component'
import { DialogComponent } from '../dialog/dialog.component'

import { UiStateService } from '../../service/ui-state.service'
import { Subscription } from 'rxjs/subscription'

import { fadeInAnimation } from '../../animations/fade-in.animation'
@Component({
    selector: 'messagebar',
    templateUrl: './messagebar.component.html',
    styleUrls: ['./messagebar.component.css'],
    animations: [fadeInAnimation]
})
export class MessagebarComponent {
    @ViewChild(DialogComponent) dialogComponent:DialogComponent

    public successImageUrl: string;
    public errorImageUrl: string;
    public unsavedImageUrl: string;
    public icon: string;
    public message: string;
    public messageStream: Subscription
    public errorStatus: boolean;
    public unsavedStatus: boolean;



    constructor(private uiStateService: UiStateService){
        this.icon = 'none'
        this.successImageUrl = require('../../assets/tick.png')
        this.errorImageUrl = require('../../assets/error.png')
        this.unsavedImageUrl = require('../../assets/unsaved.png')
        this.message = ''
        this.messageStream = this.uiStateService.getMessageDataStream().subscribe(data => {
            if(data.hasOwnProperty('message')){
                this.message = data.message
            }
            if(data.hasOwnProperty('icon')){
                this.icon = data.icon
            }

            if(data.hasOwnProperty('errorStatus')) {
                this.errorStatus = data.errorStatus
            }

            if(data.hasOwnProperty('unsavedStatus')) {
                this.unsavedStatus = data.unsavedStatus
            }
        });
    }

    showDialog(event){
        this.uiStateService.updateErrorStatus(false)
        this.dialogComponent.openDialog(event)
    }
}