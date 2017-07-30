import { Component, Input, AfterViewInit } from '@angular/core'

@Component({
    selector: 'of-messagebar',
    templateUrl: './fabric.messageBar.wrapper.component.html'
})
export class FabricMessageBarWrapperComponent implements AfterViewInit {
    public icontype: string = '';
    public messagebartype: string = '';

    @Input() type: string;
    @Input() description: string;
    @Input() urllink: string;
    @Input() urltext: string;


    constructor(){

    }

    ngAfterViewInit(){
        console.log(this.type)
        if (this.type) {
            this.type = this.type.toLowerCase()
        }
        console.log(this.type);
        switch (this.type) {
            case 'info':
                this.messagebartype = ''
                this.icontype = 'ms-Icon--Info'
            break; 
            case 'success':
                this.messagebartype = 'ms-MessageBar--success'
                this.icontype = 'ms-Icon--Completed'
            break;
            case 'error':
                this.messagebartype = 'ms-MessageBar--error'
                this.icontype = 'ms-Icon--ErrorBadge'
            break;
            case 'blocked': 
                this.messagebartype = 'ms-MessageBar--blocked'
                this.icontype = 'ms-Icon--Blocked'
            break;
            case 'warning':
                this.messagebartype = 'ms-MessageBar--warning'
                this.icontype = 'ms-Icon--Info'
            break;
            case 'severewarning':
                this.messagebartype = 'ms-MessageBar--severWarning'
                this.icontype = 'ms-Icon--Warning'
            break
            default:
                this.messagebartype = ''
                this.icontype = 'ms-Icon--Info'
            break;
        }

        if (!this.urllink) {
            this.urllink = '/'
        }
    }
}