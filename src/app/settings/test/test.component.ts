import { Component, OnInit } from '@angular/core'
import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { UiStateService } from '../../service/ui-state.service'
import { WorkdayService } from '../../service/workdays.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'

import { IYear } from '../../model/year.model'
import { ICommandButtonLabel, ICommandButtonEntry } from '../../model/CommandButton.model'

import { FabricTextFieldWrapperComponent } from '../../office-fabric/textfield/fabric.textfield.wrapper.component'

import { FabricToggleWrapperComponent } from '../../office-fabric/toggle/fabric.toggle.wrapper.component'
import { FabricDropdownWrapperComponent } from '../../office-fabric/dropdown/fabric.dropdown.wrapper.component'
import { FabricMessageBarWrapperComponent } from '../../office-fabric/messagebar/fabric.messageBar.wrapper.component'
import { FabricTableWrapperComponent } from '../../office-fabric/table/fabric.table.wrapper.component'
import { FabricButtonWrapperComponent } from '../../office-fabric/button/fabric.button.wrapper.component'
import { FabricCommandButtonWrapperComponent } from '../../office-fabric/commandbutton/fabric.commandButton.wrapper.component'
import { FabricSpinnerWrapperComponent } from '../../office-fabric/spinner/fabric.spinner.wrapper.component'
import { FabricDialogWrapperComponent } from '../../office-fabric/dialog/fabric.dialog.wrapper.component'
import { FabricIconPanelWrapperComponent } from '../../office-fabric/panel/fabric.panel.wrapper.component'
import { PagerService } from '../../service/pagination.service'

import { ColorPickerService } from '../../shared/color-picker/color-picker.service';
import { Rgba } from '../../shared/color-picker/formats'



const label:ICommandButtonLabel = {
    label: 'additional',
    iconType: 'Settings'
}

const commandButtonValues: Array<ICommandButtonEntry> = [
    {
        id: '1',
        label: 'entry 1',
        iconType: 'Attach'
    },
    {
        id: '2',
        label: 'entry 2',
        iconType: 'MiniLink'
    },
    {
        id: '3',
        label: 'entry 3',
        iconType: 'EMI'
    },        
]

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css']
})
export class TestComponent {
    public commandButtonValues = commandButtonValues
    public commandButtonLabel = label
    public color = '#ff0000'

    // array of all items to be paged
    private allItems: any[];
    
    // pager object
    pager: any = {};
    
    // paged items
    pagedItems: any[];

    constructor(private pagerService: PagerService){
        this.allItems = [];

        for(let i=0;i<100;i++) {
            this.allItems.push({
                                    name: 'name' + String(i),
                                    id: Math.random() * 1000
                                })
        }
        // initialize to page 1
        this.setPage(1);

        console.log(this.allItems)
    }


    testme(event) {
        console.log(event);
    }

    toggleEventCall(event){
        console.log(event);
    }
    choiceSelected(choice){
        console.log(choice);
    }

    buttonclicked($event){
        console.log($event);
    }

    createPanel($event){

    }


    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
 
        // get pager object from service
        this.pager = this.pagerService.getPager(this.allItems.length, page, 10);
 
        // get current page of items
        this.pagedItems = this.allItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }    
}