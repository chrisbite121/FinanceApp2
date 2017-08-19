
import { Component, Input, Output, EventEmitter, ElementRef, AfterContentInit } from '@angular/core';

// Import the default Fabric implementation of Button
import { Button } from './Button';

@Component({
    selector: 'of-button',
    templateUrl: './fabric.button.wrapper.component.html',
})
export class FabricButtonWrapperComponent implements AfterContentInit {
    
    public button: Button;
    public useIcon: boolean;
    public useDescription: boolean;
    public iconType: string;


    // The parent component will supply the values for these properties.

    @Input() label: string;
    @Input() id: string;
    @Input() description: string;
    @Input() type: string


    // Create an event to run when the user enters text in the text field.
    @Output() buttonClicked:  EventEmitter<string> = new EventEmitter<string>();  

    constructor(private element: ElementRef ){
        this.useIcon = false;
        this.useDescription = false;
        this.iconType = '';
     
     }

    // After the textfield has fully rendered, create a Fabric TextField object for it.
    ngAfterContentInit() {
        switch (this.type) {
                        case 'normal':
                            this.type = ''
                        break; 
                        case 'primary':
                            this.type = 'ms-Button--primary'

                        break;
                        case 'hero':
                            this.type = 'ms-Button--hero'
                            this.useIcon = true;
                            this.iconType = "ms-Icon ms-Icon--Add"
                        break;
                        case 'compound': 
                            this.type = 'ms-Button--compound'
                            this.useIcon = true;
                            this.iconType = 'ms-Icon ms-Icon--plus'
                            this.useDescription = true
                        break;
                        case 'small':
                            this.type = 'ms-Button--small'
                        break;
                        default:
                            this.type = ''
                        break;
                    }   
        

        let componentElement: HTMLElement = this.element.nativeElement.children[0];
        this.button = new Button(componentElement);
    }

    // When the user changes the text field's contents, pull the new value up from the 
    // Fabric component to the Angular 2 component, and tell the parent view about
    // the event.
    onButtonClicked($event): void {
        this.buttonClicked.emit(this.id);
    }
}



        
        