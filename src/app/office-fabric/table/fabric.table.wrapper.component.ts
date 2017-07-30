// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo.

/*
  The file defines an Angular 2 component to wrap the Fabric TextField component.
*/

import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, OnInit } from '@angular/core';

// Import the default Fabric implementation of Toggle
import { Table } from './Table';

@Component({
    selector: 'of-table',
    templateUrl: './fabric.table.wrapper.component.html',
})
export class FabricTableWrapperComponent implements AfterViewInit, OnInit {
    
    private table: Table;
    public selectableClass: string;

    // The parent component will supply the values for these properties.
    //the header has now been hardcoded for the logging solution
    @Input() tableHeaderArray: Array<string> = [];
    @Input() dataArray: Array<object> = [];
    @Input() selectable: boolean = true;

    // Create an event to run when the user enters text in the text field.
    @Output() toggleEvent:  EventEmitter<boolean> = new EventEmitter<boolean>();  

    constructor(private element: ElementRef ){
        }

    ngOnInit(){
        this.selectable? this.selectableClass = 'ms-Table--selectable' : this.selectableClass = ''
    }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterViewInit() {
        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.table = new Table(componentElement);

        //this.element.nativeElement.getElementsByClassName('ms-Table')[0].classList.toggle('ms-Table--selectable')
        
    }

    public addEntry(entry: Object) {
        this.dataArray.push(entry);
    }

    set tableData(dataArray) {
        this.dataArray = dataArray;
    }

    set headerArray(headerArray){
        this.tableHeaderArray = headerArray
    }

}