import { Component } from '@angular/core'
import { UtilsService } from '../../../service/utils.service'
import { ListManagerApiComponent } from '../shared/list-manager-api.component'

@Component({
    selector: 'material-list',
    templateUrl: './material-list.component.html',
    styleUrls: [`./material-list.component.css`]
})
export class MaterialListComponent {
    public listName: string;

    constructor(private utilsService: UtilsService){
        this.listName = this.utilsService.financeAppMaterialData
    }
}