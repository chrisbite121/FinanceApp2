import { Component } from '@angular/core'
import { UiStateService } from '../../../service/ui-state.service'

@Component({
    selector: 'notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class NotificationComponent{
    public message: string;
    public icon: string;
    public iconTypeOptions: Array<string>;

    constructor(private uiStateService: UiStateService){
        this.message = 'loading',
        this.icon = 'spinner'
        this.iconTypeOptions = ['spinner', 'success', 'error']
    }


    notificationMessageSet(event){
        this.message = event
    }

    iconTypeSet(event){
        this.icon = event
    }

    updateNotification(event){
        this.uiStateService.updateMessage(this.message, this.icon).subscribe(
            data => console.log(data),
            err => console.log(err),
            () => console.log('update Notification completed')
        )
    }
}