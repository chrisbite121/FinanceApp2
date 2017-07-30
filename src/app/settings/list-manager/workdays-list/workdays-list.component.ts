import { Component } from '@angular/core'
import { UtilsService } from '../../../service/utils.service'

@Component({
    selector: 'workdays-list',
    templateUrl: './workdays-list.component.html',
    styleUrls: [`./workdays-list.component.css`]
})
export class WorkdaysListComponent {

    public listName: string;

    constructor(private utilsService: UtilsService){
        this.listName = this.utilsService.financeAppWorkingDaysData
    }

}