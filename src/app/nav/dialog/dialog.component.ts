
import { Component, Input, Output, EventEmitter, ElementRef, AfterContentInit } from '@angular/core';

// Import the default Fabric implementation of Dialog
import { Dialog } from './Dialog';

import { NotificationService } from '../../service/notification.service'
import { PagerService } from '../../service/pagination.service'

@Component({
    selector: 'notification-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements AfterContentInit {
    
    public dialog: Dialog;
    public notifications: object;
    public transactionArray:Array<string>;
    // pager object
    public pager: any = {};
    // paged items
    public pagedItems: any[];    
    constructor(private element: ElementRef,
                private notificationService: NotificationService,
                private pagerService: PagerService){ 
                    this.notifications = [];
                 }

    ngAfterContentInit() {
        let dialogElement: HTMLElement = this.element.nativeElement.children[0];
        this.dialog = new Dialog(dialogElement);
    }


    openDialog($event): void {
        this.notifications = this.notificationService.getNotifications()
        this.transactionArray = Object.keys(this.notifications).slice().reverse()
        this.setPage(1)
        this.dialog.open()
    }

    closeDialog($event): void {
        // this.dialog.close()
    }

    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
 
        // get pager object from service
        this.pager = this.pagerService.getPager(this.transactionArray.length, page, 10);
 
        // get current page of items
        this.pagedItems = this.transactionArray.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
}



        
        