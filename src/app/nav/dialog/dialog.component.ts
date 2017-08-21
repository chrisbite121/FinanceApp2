
import { Component, Input, Output, EventEmitter, ElementRef, AfterContentInit } from '@angular/core';

// Import the default Fabric implementation of Dialog
import { Dialog } from './Dialog';

import { NotificationService } from '../../service/notification.service'

@Component({
    selector: 'notification-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements AfterContentInit {
    
    public dialog: Dialog;
    public notifications: Array<any>
    constructor(private element: ElementRef,
                private notificationService: NotificationService){ 
                    this.notifications = [];
                 }

    ngAfterContentInit() {
        let dialogElement: HTMLElement = this.element.nativeElement.children[0];
        this.dialog = new Dialog(dialogElement);
    }


    openDialog($event): void {
        this.notifications = this.notificationService.getNotifications()
        this.dialog.open()
    }

    closeDialog($event): void {
        // this.dialog.close()
    }
}



        
        