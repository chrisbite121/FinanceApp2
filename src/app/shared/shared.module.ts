import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

//Office Ui Fabric
import { FabricTextFieldWrapperComponent } from '../office-fabric/textfield/fabric.textfield.wrapper.component'
import { FabricToggleWrapperComponent } from '../office-fabric/toggle/fabric.toggle.wrapper.component'
import { FabricDropdownWrapperComponent } from '../office-fabric/dropdown/fabric.dropdown.wrapper.component'
import { FabricMessageBarWrapperComponent } from '../office-fabric/messagebar/fabric.messageBar.wrapper.component'
import { FabricTableWrapperComponent } from '../office-fabric/table/fabric.table.wrapper.component'
import { FabricPivotWrapperComponent } from '../office-fabric/pivot/fabric.pivot.wrapper.component'
import { FabricButtonWrapperComponent } from '../office-fabric/button/fabric.button.wrapper.component'
import { FabricCommandButtonWrapperComponent } from '../office-fabric/commandbutton/fabric.commandButton.wrapper.component'
import { FabricSpinnerWrapperComponent } from '../office-fabric/spinner/fabric.spinner.wrapper.component'
import { FabricDialogWrapperComponent } from '../office-fabric/dialog/fabric.dialog.wrapper.component'
import { FabricIconPanelWrapperComponent } from '../office-fabric/panel/fabric.panel.wrapper.component'

//pipes
import { ArrayReversePipe } from '../pipe/reverse.pipe'

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        FabricTextFieldWrapperComponent,
        FabricToggleWrapperComponent,
        FabricDropdownWrapperComponent,
        FabricMessageBarWrapperComponent,
        FabricTableWrapperComponent,
        FabricPivotWrapperComponent,
        FabricButtonWrapperComponent,
        FabricCommandButtonWrapperComponent,
        FabricSpinnerWrapperComponent,
        FabricIconPanelWrapperComponent,
        FabricDialogWrapperComponent,
        ArrayReversePipe
    ],
    exports: [
        FabricTextFieldWrapperComponent,
        FabricToggleWrapperComponent,
        FabricDropdownWrapperComponent,
        FabricMessageBarWrapperComponent,
        FabricTableWrapperComponent,
        FabricPivotWrapperComponent,
        FabricButtonWrapperComponent,
        FabricCommandButtonWrapperComponent,
        FabricSpinnerWrapperComponent,
        FabricDialogWrapperComponent,
        FabricIconPanelWrapperComponent,
        CommonModule,
        ArrayReversePipe
    ]
})
export class SharedModule {

}