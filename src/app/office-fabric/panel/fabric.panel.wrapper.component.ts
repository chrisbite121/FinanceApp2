
import { Component, Input, Output, EventEmitter, ElementRef, AfterContentInit } from '@angular/core';

// Import the default Fabric implementation of Button
import { Panel } from './Panel';

@Component({
    selector: 'of-icon-panel',
    templateUrl: './fabric.panel.wrapper.component.html',
    styleUrls: ['./fabric.panel.wrapper.component.css']
})
export class FabricIconPanelWrapperComponent implements AfterContentInit {
    
    public panel: Panel;
    public componentElement: HTMLElement
    public infoImageUrl: string =  require('../../assets/information-icon.svg')  
    // The parent component will supply the values for these properties.

    @Input() contentName: string


    // Create an event to run when the user enters text in the text field.
    // @Output() buttonClicked:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef ){
       
     }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterContentInit() {
        this.componentElement = this.element.nativeElement.querySelector('#panel')
    }

    // When the user changes the text field's contents, pull the new value up from the 
    // Fabric component to the Angular 2 component, and tell the parent view about
    // the event.
    // onButtonClicked($event): void {
    //     this.buttonClicked.emit(this.id);
    // }

    onIconClicked($event): void {
        this.panel = new Panel(this.componentElement);
    }
}



        
        