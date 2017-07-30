import { Component } from '@angular/core'
import { UtilsService } from '../../../service/utils.service'
import { ListManagerApiComponent } from '../shared/list-manager-api.component'

@Component({
    selector: 'summary-list',
    templateUrl: './summary-list.component.html',
    styleUrls: [`./summary-list.component.css`]
})
export class SummaryListComponent {
    public listName: string;

    constructor(private utilsService: UtilsService){
        this.listName = this.utilsService.financeAppSummaryData
    }

}