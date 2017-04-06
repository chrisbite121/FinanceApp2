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
        this.cars = [
            {
                vin: 'dsad231ff',
                year: 2012,
                brand: 'VW',
                color: 'Orange',
                saleDate: 'Audi',
                options: [
                    { label: 'Select City', value:null },
                    { label: 'New York', value:'New York' }
                ]
            },
            {
                vin: 'gwregre345',
                year: 2011,
                brand: 'Audi',
                color: 'Black',
                saleDate: '',
                options: [
                    { label: 'Select City', value:null },
                    { label: 'New York', value:'New York' }
                ]
            },
            {
                vin: 'h354htr',
                year: 2005,
                brand: 'Renault',
                color: 'Gray',
                saleDate: '',                
                options: [
                    { label: 'Select City', value:null },
                    { label: 'New York', value:'New York' }
                ]
            },
            {
                vin: 'j6w54qgh',
                year: 2003,
                brand: 'BMW',
                color: 'Blue',
                saleDate: '',                
                options: [
                    { label: 'Select City', value:null },
                    { label: 'New York', value:'New York' }
                ]
            },
            {
                vin: 'hrtwy34',
                year: 1995,
                brand: 'Mercedes',
                color: 'Orange',
                saleDate: '',                
                options: [
                    { label: 'Select City', value:null },
                    { label: 'New York', value:'New York' }
                ]
            },
            {
                vin: 'jejtyj',
                year: 2005,
                brand: 'Volvo',
                color: 'Black',
                saleDate: '',                
                options: [
                    { label: 'Select City', value:null },
                    { label: 'New York', value:'New York' }
                ]
            },                                                              

        ]

       this.options = [
           'new york',
           'london',
           'amsterdam',
           'Cairo'
       ];

        this.brands = [];
        this.brands.push({label: 'All Brands', value: null});
        this.brands.push({label: 'Audi', value: 'Audi'});
        this.brands.push({label: 'BMW', value: 'BMW'});
        this.brands.push({label: 'Fiat', value: 'Fiat'});
        this.brands.push({label: 'Honda', value: 'Honda'});
        this.brands.push({label: 'Jaguar', value: 'Jaguar'});
        this.brands.push({label: 'Mercedes', value: 'Mercedes'});
        this.brands.push({label: 'Renault', value: 'Renault'});
        this.brands.push({label: 'VW', value: 'VW'});
        this.brands.push({label: 'Volvo', value: 'Volvo'}); 
    }
}