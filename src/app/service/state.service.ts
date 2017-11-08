import { Injectable } from '@angular/core'

import { UtilsService } from './utils.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';


@Injectable()
export class StateService {
    private _loadingAppData: object;
    private _savingAppData: boolean;

    constructor(private utilsService:UtilsService){
        this._savingAppData = false;
        this._loadingAppData = {}
        this._loadingAppData[this.utilsService.financeAppResourceData] = false;
        this._loadingAppData[this.utilsService.financeAppMaterialData] = false;
        this._loadingAppData[this.utilsService.financeAppSummaryData] = false;
        this._loadingAppData[this.utilsService.financeAppTotalsData] = false;
        this._loadingAppData[this.utilsService.financeAppWorkingDaysData] = false;

    }

    get savingAppData(){
        return this._savingAppData
    }

    set savingAppData(value: boolean){
        this._savingAppData = value
    }

    checkSaveAppDataState():Observable<any> {
        let check$ = new Observable((observer:any) => {
            observer.next({
                functionCall: 'checkSaveAppDataState',
                result: true,
                isSaving: this._savingAppData
            })

            console.log(this._savingAppData == false)
            if (this._savingAppData == false) {
                observer.next({
                    reportHeading: 'checkSaveAppDataState',
                    reportResult: this.utilsService.failStatus,
                    description: 'canceling save operation as a previous save operation has not completed'
                })
                observer.complete()
            } else {
                observer.next({
                    reportHeading: 'checkSaveAppDataState',
                    reportResult: this.utilsService.successStatus,
                    description: 'proceeding with save operation, no other save operation is currently running'
                })
                observer.complete()
            }
            
        })
        return check$
    }

    updateSaveAppDataState(value):Observable<any> {
        let update$ = new Observable((observer:any) => {
            this._savingAppData = value;
            observer.next({
                functionCall: 'updateSaveAppDataState',
                result: true,
                isSaving: this._savingAppData
            })
            observer.complete()
        })

        return update$
    }


    checkLoadAppDataState(listName):Observable<any>{
        let check$ = new Observable((observer:any) => {
            if(this._loadingAppData.hasOwnProperty(listName)) {
                observer.next({
                    functionCall: 'checkLoadAppDataState',
                    result: true,
                    listName: listName,
                    isLoading: this._loadingAppData[listName]
                })

                observer.next({
                    reportHeading: 'checkLoadAppDataState',
                    reportResult: this.utilsService.successStatus,
                    description: `is a loadAppData operation already running for listName: ${listName} - ${this._loadingAppData[listName]}`
                })
            } else {
                observer.next({
                    functionCall: 'checkLoadAppDataState',
                    result: false,
                    listName: listName,
                    isLoading: false
                })

                observer.next({
                    reportHeading: 'checkLoadAppDataState',
                    reportResult: this.utilsService.failStatus,
                    description: `failed to find property ${listName} on state object _loadingAppData`
                })
            }
            observer.complete()
        })
        return check$
    }

    updateLoadingAppDataState(listName:string, value: boolean):Observable<any>{
        let update$ = new Observable((observer:any) => {
            if (this._loadingAppData.hasOwnProperty(listName)) {
                this._loadingAppData[listName] = value
                observer.next({
                    functionCall: `updateLoadingAppDataState`, 
                    result: true,
                    listName: listName
                })

                observer.next({
                    reportHeading: `updateLoadingAppDataState`,
                    reportResult: this.utilsService.successStatus,
                    description: `successfully updateded state on list: ${listName} to ${value}`
                })
            } else {
                observer.next({
                    functionCall: `updateLoadingAppDataState`, 
                    result: false,
                    listName: listName
                })

                observer.next({
                    reportHeading: `updateLoadingAppDataState`,
                    reportResult: this.utilsService.failStatus,
                    description: `failed to update state on listL ${listName} to ${value}`
                })
            }

            observer.complete()

        })
        return update$
    }
}