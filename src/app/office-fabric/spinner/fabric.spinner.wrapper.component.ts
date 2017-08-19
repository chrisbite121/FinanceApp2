// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo.

/*
  The file defines an Angular 2 component to wrap the Fabric TextField component.
*/

import { Component, Input, Output, ElementRef, AfterViewInit, OnChanges } from '@angular/core';

// Import the default Fabric implementation of Spinner
import { Spinner } from './Spinner';

@Component({
    selector: 'of-spinner',
    templateUrl: './fabric.spinner.wrapper.component.html',
})
export class FabricSpinnerWrapperComponent implements AfterViewInit, OnChanges {
    
    private spinner: Spinner;
    // The parent component will supply the values for these properties.
    @Input() public label: string;
    @Input() public start: boolean;
    @Input() public stop: boolean;

    // // Create an event to run when the user enters text in the text field.
    // @Output() textEntered:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef ){
     }

     ngOnChanges(simpleChange){
         //NOT IMPLEMENTED THID FUNCTIONALITY YET
     }

     stopSpinner(){
         this.spinner.stop()
     }

     startSpinner(){
         this.spinner.start()
     }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterViewInit() {
        
        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.spinner = new Spinner(componentElement);
    }

}