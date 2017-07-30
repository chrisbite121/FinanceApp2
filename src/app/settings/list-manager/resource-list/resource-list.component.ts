import { Component } from '@angular/core'
import { UtilsService } from '../../../service/utils.service'
import { ListManagerApiComponent } from '../shared/list-manager-api.component'

@Component({
    selector: 'resource-list',
    templateUrl: './resource-list.component.html',
    styleUrls: [`./resource-list.component.css`]
})
export class ResourceListComponent {
    public listName: string;

    constructor(private utilsService: UtilsService){
        this.listName = this.utilsService.financeAppResourceData
    }
}