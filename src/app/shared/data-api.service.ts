import { Injectable } from '@angular/core'
import { LogService } from './log.service'

@Injectable()
export class DataApiService {
    private FinanceTable: any = {};

    constructor(private logService: LogService){
        this.FinanceTable['create'] = [];
        this.FinanceTable['update'] = [];
        this.FinanceTable['delete'] = [];
    }

    saveChanges(dataModel: any) {
        console.log(dataModel);
        this.logService.log('data saved success');
    }

}