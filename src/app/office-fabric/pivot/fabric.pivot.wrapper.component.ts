// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo.

/*
  The file defines an Angular 2 component to wrap the Fabric TextField component.
*/

import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';

// Import the default Fabric implementation of TextField
import { Pivot } from './Pivot';

@Component({
    selector: 'of-pivot',
    templateUrl: './fabric.pivot.wrapper.component.html',
})
export class FabricPivotWrapperComponent implements AfterViewInit {
    
    private pivot: Pivot;
    // The parent component will supply the values for these properties.
    @Input() public dataArray: Array<Object>;

    // // Create an event to run when the user enters text in the text field.
    // @Output() textEntered:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef ){

     }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterViewInit() {
        
        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.pivot = new Pivot(componentElement);
    }

}