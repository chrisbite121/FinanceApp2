import { Component } from '@angular/core'
import { UtilsService } from '../../../service/utils.service'
import { ListManagerApiComponent } from '../shared/list-manager-api.component'

@Component({
    selector: 'total-list',
    templateUrl: './total-list.component.html',
    styleUrls: [`./total-list.component.css`]
})
export class TotalListComponent {
    public listName: string;

    constructor(private utilsService: UtilsService){
        this.listName = this.utilsService.financeAppTotalsData
    }

}