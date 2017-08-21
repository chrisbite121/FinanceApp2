import { Component } from '@angular/core'
import { UiStateService } from '../../../service/ui-state.service'
import { NotificationService } from '../../../service/notification.service'

import { UUID } from 'angular2-uuid';

@Component({
    selector: 'notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class NotificationComponent{
    public message: string;
    public icon: string;
    public iconTypeOptions: Array<string>;
    public errorStatusOptions: Array<string>;
    public errorStatusValue: boolean = false;
    constructor(private uiStateService: UiStateService,
                private notificationService: NotificationService){
        this.message = 'loading',
        this.icon = 'loading'
        this.iconTypeOptions = ['loading', 'complete', 'none']
        this.errorStatusOptions = ['true', 'false']
    }


    notificationMessageSet(event){
        this.message = event
    }

    iconTypeSet(event){
        this.icon = event
    }

    errorStatusSet(event){
        if(event=='true') {
            this.errorStatusValue = true;
        } else {
            this.errorStatusValue = false;
        }
    }

    updateNotification(event){
        this.uiStateService.updateMessage(this.message, this.icon).subscribe(
            data => console.log(data),
            err => console.log(err),
            () => console.log('update Notification completed')
        )

        this.uiStateService.updateErrorStatus(this.errorStatusValue)
    }

    generateId(event){
        alert('Test ID: ' + UUID.UUID());
    }

    getNotifications(event){
        let _notifications = this.notificationService.getNotifications()
        console.log(_notifications)
    }

    addNotification(event){
        let _id = UUID.UUID()
        console.log(_id)
        this.notificationService.addNotification({
            reportHeading: 'testNotification',
            reportResult: true,
            message: 'content for this message'
        }, _id)
            .subscribe(data=>console.log(data),
                        err=>console.log(err),
                        ()=>console.log('completed'))
    }
}