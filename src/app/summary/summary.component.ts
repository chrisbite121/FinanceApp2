import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'summary',
    templateUrl: './summary.component.html'
})
export class SummaryComponent implements OnInit {
    cars: any[];
    options: any[];
    brands: any[];
    ngOnInit() {
    }
}