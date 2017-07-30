import { Component } from '@angular/core'
import { UtilsService } from '../../../service/utils.service'
import { ListManagerApiComponent } from '../shared/list-manager-api.component'

@Component({
    selector: 'setting-list',
    templateUrl: './setting-list.component.html',
    styleUrls: [`./setting-list.component.css`]
})
export class SettingListComponent {
    public listName: string;

    constructor(private utilsService: UtilsService){
        this.listName = this.utilsService.financeAppSettingsData
    }
}