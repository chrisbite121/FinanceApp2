// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo.

/*
  The file defines an Angular 2 component to wrap the Fabric TextField component.
*/

import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';

// Import the default Fabric implementation of TextField
import { Dropdown } from './Dropdown';

@Component({
    selector: 'of-dropdown',
    templateUrl: './fabric.dropdown.wrapper.component.html',
})
export class FabricDropdownWrapperComponent implements AfterViewInit {
    
    private dropdown: Dropdown;

    // The parent component will supply the values for these properties.
    @Input() innerlabel: string;
    @Input() id: string;
    @Input() options: Array<string>;
    @Input() disable: boolean;
    @Input() defaultValue: any

    // Create an event to run when the user enters text in the text field.
    @Output() choiceSelectedEvent:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef ){ }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterViewInit() {
        this.generateDropdown()
    }

    generateDropdown() {
        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.dropdown = new Dropdown(componentElement);
        if (this.disable) {
            this.element.nativeElement.getElementsByClassName('ms-Dropdown')[0].classList.add('is-disabled');
        }

        //set default setting in dropdown
        if (this.defaultValue) {
            this.element.nativeElement.getElementsByClassName('ms-Dropdown-title')[0].innerHTML = this.defaultValue
        }
    }

    // When the user changes the text field's contents, pull the new value up from the 
    // Fabric component to the Angular 2 component, and tell the parent view about
    // the event.
    onValueSelected(selection): void {
        if (selection !== 'Choose an option...') {
            this.choiceSelectedEvent.emit(selection);
        }
    }
}