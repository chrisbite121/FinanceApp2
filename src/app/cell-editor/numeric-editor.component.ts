import {Component, ViewContainerRef, ViewChild, AfterViewInit} from '@angular/core';

//import {ICellEditorAngularComp} from 'ag-grid-angular/main';
import { AgEditorComponent } from 'ag-grid-angular/main';

@Component({
    selector: 'numeric-cell',
    template: `<input #input (keydown)="onKeyDown($event)" [(ngModel)]="value">`
})
export class NumericEditorComponent implements AgEditorComponent, AfterViewInit {
    private params: any;
    public value: any;
    private cancelBeforeStart: boolean = false;

    @ViewChild('input', {read: ViewContainerRef}) public input;


    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;


        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        // return this.value;
        return this.input.element.nativeElement.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 1000000343;
    };

    onKeyDown(event): void {
        if (!this.isKeyPressedValid(event)) {
            if (event.preventDefault) event.preventDefault();
        }

        if (this.value === '') {
            this.input.element.nativeElement.value = 0;
        }
        
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.input.element.nativeElement.focus();
        setTimeout(() => this.input.element.nativeElement.select(), 0)
    }

    private getCharCodeFromEvent(event): any {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    }

    private isCharNumeric(charStr): boolean {
        //either digit from top row, numberkey is represented by letters a-g, 0 on number key
        //represented by `
        return !!/(\d|[a-i]|`)/.test(charStr);
    }

    private isCharBackspace(charCode): boolean {
        return charCode === 8
    }

    private isKeyPressedValid(event): boolean {
        var charCode = this.getCharCodeFromEvent(event);
        var charStr = String.fromCharCode(charCode);
        return this.isCharNumeric(charStr) || this.isCharBackspace(charCode);
    }
}