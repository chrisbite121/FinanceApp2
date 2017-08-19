import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, AfterContentChecked } from '@angular/core'

import { GridOptions } from 'ag-grid'

import { TableService } from '../../service/table.service'
import { DataContextService } from '../../service/data-context.service'
import { ScriptService } from '../../service/scripts.service'
import { SettingsService } from '../../service/settings.service'
import { UtilsService } from '../../service/utils.service'
import { fadeInAnimation } from '../../animations/fade-in.animation'

import { Subscription } from 'rxjs/subscription'

import { IYear } from '../../model/year.model'
@Component({
    selector: 'total',
    templateUrl: './total.component.html',
    styleUrls: ['./total.component.css'],
    // make fade in animation available to this component
    animations: [fadeInAnimation]
})
export class TotalComponent implements OnInit, OnDestroy, AfterContentChecked {
    public tableReady: boolean = false;
    //totals
    public tGridOptions: GridOptions    
    
    //totals
    public tTableHeight: number = 30;

    //totals
    public tTableWidth: number = 1901;

    public uiState: any;

    public title: string;
    // public _backgroundColour: string = '#99e7ff';
    
    public totalStream: Subscription
    public totalContextStream: Subscription

    constructor(private tableService: TableService, 
                private dataContext: DataContextService,
                private scriptService: ScriptService,
                private settingsService: SettingsService,
                private utilsService: UtilsService,
                private el: ElementRef) {
        
        this.title = 'Total'

        //initialise gridoptions objects
        this.tGridOptions = <GridOptions>{};

        //Total cost gridoptions
        this.tGridOptions.context = {};
        // this.tGridOptions.onCellValueChanged = ($event: any) => {
        //     this._focusTable = 'tGridOptions'
        //     this._focusCell = this.tGridOptions.api.getFocusedCell()
        //     this.scriptService.updateTable($event).subscribe(this.getSubscriber());
        // };
        this.tGridOptions.onGridReady = () => {
            //Remove Header
            this.tGridOptions.api.setHeaderHeight(0)
        }

        this.tGridOptions.singleClickEdit = true;
        this.tGridOptions.enableColResize = true;
        this.tGridOptions.suppressCellSelection=true;
        this.tGridOptions.domLayout = 'forPrint' 
    }

    ngOnInit() {
        this.tableService.getTable('Totals').subscribe(table => {
            this.tGridOptions.columnDefs = table;
        });

        this.totalStream = this.dataContext.getTotalDataStream().subscribe(data => {
            console.error('TOTAL DATA RECEIVED')
            if (!this.tGridOptions.rowData) {
                this.tGridOptions.rowData = data;
            } else if (this.tGridOptions.api) {
                this.tGridOptions.api.setRowData(data);
            }
        })

        this.totalContextStream = this.dataContext.getTotalContextStream().subscribe(data => {
            if(typeof(data) == 'object') {
                if(this.tGridOptions) {
                    let _totalsDataName = 'totalsData'
                    this.tGridOptions.context.totalsData = JSON.parse(JSON.stringify(this.dataContext[_totalsDataName]))
                    this.tGridOptions.context.arrayName = _totalsDataName
                }
            }
        })

            this.refreshGrid()

    }

    ngAfterContentChecked () {
        this.tableReady = true;
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderBGColor(this.settingsService.settings.headerColour)
        }
        if (this.settingsService.settings.headerColour) {
            this.changeHeaderFontColour(this.settingsService.settings.headerFontColour)
        }
        
    }

    ngOnDestroy(){
        this.totalStream.unsubscribe()
        this.totalContextStream.unsubscribe()
    }

    refreshGrid(){
        if(this.settingsService.initAppComplete){
            this.scriptService.getAppData([this.utilsService.financeAppTotalsData],
                                        this.settingsService.year)
                                            .subscribe(this.getSubscriber());
        }
    }

    resizeTables(noRows: number) {
        //Totals
        this.tTableWidth = 2100;
    }

    getSubscriber() {
        return {
            next(data){ console.log('next', data) },
            error(err){ console.log('error', err) },
            complete(){ console.log('completed') }
        }
     }

     changeHeaderBGColor(value) {
        if (value) {
            let cols =     this.el.nativeElement.getElementsByClassName('ag-header-row');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].backgroundColor = value;
            }
        }
    }

    changeHeaderFontColour(value) {
        if (value) {
            let cols =     this.el.nativeElement.getElementsByClassName('ag-header-container');
            for(let i=0; i<cols.length; i++) {
                cols[i]['style'].color = value;
            }
        }
    }


}