import { Injectable } from '@angular/core'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

import { UiStateService } from './ui-state.service'
import { LogService } from './log.service'
import { UtilsService } from './utils.service'

@Injectable()
export class NotificationService {
    public NotificationTable: Array<any>
    constructor(private logService: LogService,
                private uiStateService: UiStateService,
                private utilsService: UtilsService){

                    this.NotificationTable = [];
    }

    send(notification: string, type: string, status: string){

    }

    addNotification(transaction:object, transactionId: string):Observable<any> {
        let add$ = new Observable((observer:any) => {
            if (transaction.hasOwnProperty('reportResult') &&
            transaction['reportResult'] == (this.utilsService.errorStatus || this.utilsService.failStatus)) {
                this.uiStateService.updateErrorStatus(true)
            }

            try {
                // if(!(transactionId in this.NotificationTable)) {
                //     this.NotificationTable[transactionId] = {
                //         id: transactionId,
                //         timestamp: new Date(),
                //         transactions: []
                //     }
                // }
                transaction['id'] = transactionId;
                transaction['timestamp'] = new Date().toLocaleString();
                this.NotificationTable.push(transaction)
            } catch (e) {
                this.logService.log('error adding notifcation to Notifcation Table', this.utilsService.errorStatus, false)
                this.logService.log(e)
            }
            observer.complete()
        })
        return add$
    }

    // initTransaction(transactionId):Observable<any>{
    //     let init$ = new Observable((observer:any) => {
    //         if(transactionId in this.NotificationTable) {
    //             observer.next({
    //                 reportHeading: 'initTransaction',
    //                 reportResult: this.utilsService.errorStatus,
    //                 message: `Transaction: ${transactionId} already exists, skipping initTransaction`
    //             })
    //         } else {
    //             this.NotificationTable[transactionId] = {
    //                 id: transactionId,
    //                 timestamp: new Date(),
    //                 transactions: []
    //             }

    //             observer.next({
    //                 functionCall: 'initTransaction',
    //                 result: true,
    //             })

    //             observer.next({
    //                 reportHeading: 'initTransaction',
    //                 reportResult: this.utilsService.successStatus,
    //                 message: `Transaction: ${transactionId} added to Transaction Table`
    //             })
    //         }
    //         observer.complete()
    //     })

    //     return init$
    // }

    getNotifications(){
        return this.NotificationTable
    }

}