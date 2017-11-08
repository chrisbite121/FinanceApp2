// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo.

/*
  The file defines an Angular 2 component to wrap the Fabric TextField component.
*/

import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';

// Import the default Fabric implementation of TextField
import { CommandBar } from './CommandBar';

declare var hostUrl;

@Component({
    selector: 'of-main-commandbar',
    templateUrl: './fabric.mainCommandbar.wrapper.component.html',
    styleUrls: ['./fabric.mainCommandbar.wrapper.component.css']
})
export class FabricMainCommandBarWrapperComponent implements AfterViewInit {
    
    private commandBar: CommandBar;
    public hostUrl:string = '/summary';
    
    //public hostUrl = hostUrl
    // // The parent component will supply the values for these properties.
    // @Input() innerlabel: string;
    // @Input() id: string;
    // @Input() value: string = "";

    // // Create an event to run when the user enters text in the text field.
    // @Output() textEntered:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef){
            try{
                this.hostUrl = hostUrl;
            } catch (e) {
                console.error('cannot find hostUrl')
            }


     }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterViewInit() {
        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.commandBar = new CommandBar(componentElement);
    }

    backToProjectSite(){
        if (this.hostUrl) {
            window.location.href = this.hostUrl;
        } else {
            console.error('cannot find hostUrl, failed to redirect')
            console.error(hostUrl)
        }
    }
}