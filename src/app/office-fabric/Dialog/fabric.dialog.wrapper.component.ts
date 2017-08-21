
import { Component, Input, Output, EventEmitter, ElementRef, AfterContentInit } from '@angular/core';

// Import the default Fabric implementation of Dialog
import { Dialog } from './Dialog';

@Component({
    selector: 'of-dialog',
    templateUrl: './fabric.dialog.wrapper.component.html',
})
export class FabricDialogWrapperComponent implements AfterContentInit {
    
    public dialog: Dialog;

    // The parent component will supply the values for these properties.

    // @Input() label: string;
    // @Input() id: string;
    // @Input() description: string;
    // @Input() type: string


    // Create an event to run when the user enters text in the text field.
    // @Output() buttonClicked:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef ){
        // this.useIcon = false;
        // this.useDescription = false;
        // this.iconType = '';
     
     }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterContentInit() {
        let dialogElement: HTMLElement = this.element.nativeElement.children[0];
        this.dialog = new Dialog(dialogElement);
    }


    openDialog($event): void {
        this.dialog.open()
    }

    closeDialog($event): void {
        // this.dialog.close()
    }
}



        
        