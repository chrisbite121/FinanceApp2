// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo.

/*
  The file defines an Angular 2 component to wrap the Fabric TextField component.
*/

import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges } from '@angular/core';

// Import the default Fabric implementation of Toggle
import { Toggle } from './Toggle';

@Component({
    selector: 'of-toggle',
    templateUrl: './fabric.toggle.wrapper.component.html',
})
export class FabricToggleWrapperComponent implements AfterViewInit, OnChanges {
    
    private toggle: Toggle;

    // The parent component will supply the values for these properties.
    @Input() innerlabel: string;
    @Input() id: string;
    @Input() value: boolean;
    @Input() disable: boolean;

    // Create an event to run when the user enters text in the text field.
    @Output() toggleEvent:  EventEmitter<boolean> = new EventEmitter<boolean>();  

    constructor(private element: ElementRef ){ }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterViewInit() {
        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.toggle = new Toggle(componentElement);

        if (this.value) {
            this.toggle._toggleHandler()
        }

        if (this.disable === true) {
            this.element.nativeElement.getElementsByClassName('ms-Toggle')[0].classList.add('is-disabled');
        }
    }

    ngOnChanges(changes){
        if(changes.hasOwnProperty('disable') && changes.disable.currentValue === false && changes.disable.previousValue === true){
            this.element.nativeElement.getElementsByClassName('ms-Toggle')[0].classList.remove('is-disabled');
        }

        if(changes.hasOwnProperty('disable') && changes.disable.currentValue === true && changes.disable.previousValue === false){
            this.element.nativeElement.getElementsByClassName('ms-Toggle')[0].classList.add('is-disabled');
        }
    }

    // fire event when toggle field changed
    clickEvent($event): void {
        let outcome: boolean = $event.target['innerText'] == 'Off'? true: false
        this.toggleEvent.emit(outcome);
    }
    keyupEvent($event:KeyboardEvent){
        let outcome: boolean = $event.target['innerText'] == 'Off'? true: false
        $event.keyCode === 32 ? this.toggleEvent.emit(outcome) : null
    }
}