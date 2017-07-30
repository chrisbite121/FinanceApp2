import { Component } from '@angular/core'
import { ListManagerApiComponent } from '../shared/list-manager-api.component'
import { UtilsService } from '../../../service/utils.service'

@Component({
    selector: 'log-list',
    templateUrl: './log-list.component.html'
    
})
export class LogListComponent{
    public listName: string;

    constructor(private utilsService: UtilsService){
        this.listName = this.utilsService.financeAppLogsData
    }
}