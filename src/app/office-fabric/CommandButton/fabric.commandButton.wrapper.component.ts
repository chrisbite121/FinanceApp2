
import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';

// Import the default Fabric implementation of Button
import { CommandButton } from './CommandButton';

import { ICommandButtonLabel, ICommandButtonEntry } from '../../model/CommandButton.model'

@Component({
    selector: 'of-commandbutton',
    templateUrl: './fabric.commandButton.wrapper.component.html',
})
export class FabricCommandButtonWrapperComponent implements AfterViewInit {
    
    public commandButton: CommandButton;

    // The parent component will supply the values for these properties.

    @Input() label: ICommandButtonLabel;
    @Input() list: Array<ICommandButtonEntry>;

    // Create an event to run when the user enters text in the text field.
    @Output() buttonClicked:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef){

    }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterViewInit() {
        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.commandButton = new CommandButton(componentElement);
    }

    // When the user changes the text field's contents, pull the new value up from the 
    // Fabric component to the Angular 2 component, and tell the parent view about
    // the event.
    onButtonClicked($event): void {
        this.buttonClicked.emit($event.target);
    }
}



        
        