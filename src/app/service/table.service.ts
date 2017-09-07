import { Injectable } from '@angular/core';

import {NumericEditorComponent} from "../cell-editor/numeric-editor.component";
import { SettingsService } from './settings.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class TableService {

    constructor(private settingsService: SettingsService) {}

    workDays:Array<any> = [
        { field: 'Placeholder', headerName: '', width: 325},
        { field: 'January', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'Febuary', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'March', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'April', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'May', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'June', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'July', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'August', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'September', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'October', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'November', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
        { field: 'December', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params) => { return this.daysFormatter(params) }},
    ];


    percentageUtilised = [
        
        { field: 'checkBox1', headerName: '', width: 20, checkboxSelection: true },
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Name', headerName: '(PU) Name', width: 130, editable: true },
        { field: 'Role', headerName: 'Role', width: 150, editable: true },
        { field: 'PUJan', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUApr', headerName: 'April', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUJul', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUAug', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUOct', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUForecast', headerName: 'Forecast', width: 100, editable: false, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> { return this.currencyFormatter(params) }}
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ];    

    actualHours = [
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Role', headerName: '(AH) Role', width: 150 },
        { field: 'ContractedDayHours', headerName: 'Contracted Daily Hours', width: 150, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursPerDayFormatter(params) }  },
        { field: 'AHJan', headerName: 'January',width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }  },
        { field: 'AHFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHApr', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHJul', headerName: 'July', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }},
        { field: 'AHAug', headerName: 'August', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }},
        { field: 'AHSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHOct', headerName: 'October', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }},
        { field: 'AHNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } }, 
        { field: 'AHTotalHours', headerName: 'Total Hours', width: 100, editable: false, cellEditorFramework: NumericEditorComponent, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) }  }, 
        { field: 'AHOverHours', headerName: 'Over Hours', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) }  }
        //this column is needed at the end so the last edited column can be 'tabbed' out
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ];

    projectResource = [
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Role', headerName: '(PR) Role', width: 150 },
        { field: 'PRDayRate', headerName: 'Day Rate', width: 75, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.poundsPerDayFormatter(params) } },
        { field: 'PRBudget', headerName: 'Resource Budget', width: 75, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJan', headerName: 'January',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRFeb', headerName: 'Febuary',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRMar', headerName: 'March',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRApr', headerName: 'April',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRMay', headerName: 'May',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJun', headerName: 'June',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJul', headerName: 'July',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRAug', headerName: 'August',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRSep', headerName: 'September',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PROct', headerName: 'October',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRNov', headerName: 'November',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRDec', headerName: 'December',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }, 
        { field: 'PRYtdTotal', headerName: 'YTD Total',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }, 
        { field: 'PRLbe', headerName: 'LBE',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRYtdVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRForecastVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
        //this column is needed at the end so the last edited column can be 'tabbed' out
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    travelSubsistence = [
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'checkBox', headerName: '', width: 20, checkboxSelection: true },
        { field: 'Role', headerName: '(TS) Role', width: 130 },
        { field: 'TSDayRate', headerName: 'T&S Day Rate', width: 150, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'TSJan', headerName: 'January',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSFeb', headerName: 'Febuary',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSMar', headerName: 'March',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSApr', headerName: 'April',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSMay', headerName: 'May',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSJun', headerName: 'June',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSJul', headerName: 'July',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }, 
        { field: 'TSForecast', headerName: 'Forecast', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    actualTravelSubsistence = [
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Role', headerName: '(ATS) Role', width: 150  },
        { field: 'Placeholder2', headerName: '', width: 150 },
        { field: 'ATSJan', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSApr', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSJul', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSAug', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSOct', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'ATSYtdTotal',headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    projectResourceTandS = [
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Role', headerName: '(RTS) Role', width: 150  },
        { field: 'TSDayRate', headerName: 'T&S Day Rate', width: 75, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.poundsPerDayFormatter(params) } },
        { field: 'RTSBudget', headerName: 'T&S Budget', width: 75, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSMar', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    ProjectCostsMaterials = [
        { field: 'checkBox3', headerName: '', width: 20, checkboxSelection: true },
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Mat', headerName: 'Project Costs (Materials)', width: 130, editable: true }, 
        { field: 'MatBudget', headerName: 'Project Budget', width: 150, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) }  },
        { field: 'MatJan', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatApr', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatJul', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) }},
        { field: 'MatAug', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatOct', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatDec', headerName: 'December', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]
    
    Totals = [
        { field: 'Placeholder1', headerName: 'Totals', width: 225 },
        { field: 'TProjectBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'TVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
    ]

    //Project Resource Totals
    PRTotals = [
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Placeholder4', headerName: 'Totals', width: 200, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PROct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRForecastVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
    ]

    //Resource Travel Subsistence Totals
    RTSTotals = [
        { field: 'Placeholder5', headerName: 'Totals', width: 225, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'RTSVarianceToBudget', headerName: 'Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
    ]

    //material totals
    MatTotals = [
        { field: '#', headerName: '#', width: 25, valueGetter: 'node.id' },
        { field: 'Placeholder6', headerName: 'Totals', width: 200, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'MatForecastVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
    ]

//summary tables

    CostSummary = [
        { field: 'CostTitle', headerName: '', width: 200, cellStyle:  (params) => { return this.cellStyleStatic(params) } },
        { field: 'BaselineCostHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostBaseline', headerName: '', width: 100, editable: true, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'LbeCostHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostLbe', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'YtdCostHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostYtd', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'VarianceCostHeader', headerName: '', width : 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostVariance', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'CostVairancePercentage', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.percentageFormatter(params) } },
        { field: 'CostRag', headerName: '', width: 60, cellStyle:  (params) => { return this.cellStyleRag(params) } }
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    GrossSummary = [
        { field: 'GrossTitle', headerName: '', width: 200, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'BaselineGrossHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitBaseline', headerName: '', width: 100, editable: true, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'LbeGrossHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitLbe', headerName: '', width: 100, editable: true, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'YtdGrossHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitYtd', headerName: '', width: 100, editable: true, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'VarianceGrossHeader', headerName: '', width : 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitVariance', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'GrossBenefitVariancePercentage', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.percentageFormatter(params) } },
        { field: 'GrossRag', headerName: '', width: 60, cellStyle:  (params) => { return this.cellStyleRag(params) } }
        // { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    NetSummary = [
        { field: 'NetTitle', headerName: '', width: 200, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'BaselineNetHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitBaseline', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'LbeNetHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitLbe', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'YtdNetHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitYtd', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'VarianceNetHeader', headerName: '', width : 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitVariance', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'NetBenefitVariancePercentage', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.percentageFormatter(params) } },
        { field: 'NetRag', headerName: '', width: 60, cellStyle:  (params) => { return this.cellStyleRag(params) } }
    ]
    
    
    resourceTable = [
        { field: 'checkBox1', headerName: '', width: 20, checkboxSelection: true },
        { field: 'Name', headerName: '(PU) Name', width: 130, editable: true },
        { field: 'Role', headerName: 'Role', width: 150, editable: true },
        
        { field: 'PUJan', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUApr', headerName: 'April', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUJul', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUAug', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUOct', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.percentageFormatter(params) } },
        { field: 'PUForecast', headerName: 'Forecast', width: 100, editable: false, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> { return this.currencyFormatter(params) }},
        
        { field: 'ContractedDayHours', headerName: 'Contracted Daily Hours', width: 150, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursPerDayFormatter(params) }  },
        { field: 'AHJan', headerName: 'January',width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }  },
        { field: 'AHFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHApr', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHJul', headerName: 'July', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }},
        { field: 'AHAug', headerName: 'August', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }},
        { field: 'AHSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHOct', headerName: 'October', width: 100, editable: true , cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) }},
        { field: 'AHNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } },
        { field: 'AHDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> { return this.hoursFormatter(params) } }, 
        { field: 'AHTotalHours', headerName: 'Total Hours', width: 100, editable: false, cellEditorFramework: NumericEditorComponent, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) }  }, 
        { field: 'AHOverHours', headerName: 'Over Hours', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) }  },
        
        { field: 'PRDayRate', headerName: 'Day Rate', width: 75, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.poundsPerDayFormatter(params) } },
        { field: 'PRBudget', headerName: 'Resource Budget', width: 75, editable: true, cellEditorFramework: NumericEditorComponent, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJan', headerName: 'January',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRFeb', headerName: 'Febuary',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRMar', headerName: 'March',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRApr', headerName: 'April',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRMay', headerName: 'May',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJun', headerName: 'June',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRJul', headerName: 'July',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRAug', headerName: 'August',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRSep', headerName: 'September',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PROct', headerName: 'October',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRNov', headerName: 'November',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRDec', headerName: 'December',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }, 
        { field: 'PRYtdTotal', headerName: 'YTD Total',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }, 
        { field: 'PRLbe', headerName: 'LBE',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRYtdVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } },
        { field: 'PRForecastVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100, cellStyle:  (params) => { return this.cellStyle(params) }, valueFormatter: (params)=> {return this.currencyFormatter(params) } }
    ]    

    getTableNames(PageName: string): string[] {
        let tableArray: string[]
        if (PageName = 'fyb1') {
            tableArray.push['percentageUtilised'];
            tableArray.push['actualHours'];
            tableArray.push['projectResource'];
            tableArray.push['travelSubsistence'];
            tableArray.push['actualTravelSubsistence'];
            tableArray.push['projectResourceTandS'];
            tableArray.push['ProjectCostsMaterials'];
            tableArray.push['Totals'];
        }
        return tableArray
    }

    getTable(TableName: string): Observable<any> {
        let obs$ = Observable.create((observer: Observer<any>) => {
            observer.next(this[TableName]);
            observer.complete()
        })
        return obs$;
    }

    cellStyle(params){
            let _css = {'color': 'black', 'background-color':'#f0f0f5'} 
            if (params.hasOwnProperty('value') &&
                params.hasOwnProperty('context') &&
                params.context.hasOwnProperty('arrayName') &&
                params.context.hasOwnProperty(params.context.arrayName) &&
                params.context[params.context.arrayName].hasOwnProperty(params.node.rowIndex) &&
                params.context[params.context.arrayName][params.node.rowIndex].hasOwnProperty(params.column.colId) &&
                params.context[params.context.arrayName][params.node.rowIndex][params.column.colId] !== params.value) {
                _css = {'color': this.settingsService.highlightFontColour, 'background-color':this.settingsService.highlightColour }
            } else {
                _css = {'color': 'black', 'background-color':'#f0f0f5'} 
            }

            return _css
        }

    cellStyleStatic(params){
        return {'color': 'black', 'background-color':'#f0f0f5',  'font-weight': 'bold', 'line-height': '35px', 'text-align': 'center'} 
    }

    cellStyle2(params){
        console.error('PARAMS')
        console.error(params)
        
        if (params.hasOwnProperty('node') && params.node.hasOwnProperty('rowIndex')) {
            console.error(params.node.rowIndex)

            if (params.hasOwnProperty('context') && params.context.hasOwnProperty('arrayName')) {
                console.error(params.context.arrayName);
           
                if (params.context.hasOwnProperty(params.context.arrayName)) {
                    console.error(params.context[params.context.arrayName])
                
                    if (params.context[params.context.arrayName][params.node.rowIndex]
                        && params.context[params.context.arrayName][params.node.rowIndex].hasOwnProperty(params.column.colId)) {
                        console.error(params.context[params.context.arrayName][params.node.rowIndex][params.column.colId])
                   
                        if (params.hasOwnProperty('value') &&
                            params.context[params.context.arrayName][params.node.rowIndex][params.column.colId] !== params.value) {
                            console.error(params.value)        
                            console.error(params.context[params.context.arrayName][params.node.rowIndex][params.column.colId] !== params.value)
                        }                    
                    }
                }
            }
        }

        if (params.context &&
            params.context.arrayName &&
            params.context.hasOwnProperty([params.context.arrayName]) &&
            params.context[params.context.arrayName].hasOwnProperty([params.node.rowIndex]) &&
            params.context[params.context.arrayName][params.node.rowIndex].hasOwnProperty([params.column.colId]) &&
            params.context[params.context.arrayName][params.node.rowIndex][params.column.colId] !== params.value) {
            return {'color': this.settingsService.highlightFontColour, 'background-color':this.settingsService.highlightColour }
        } else {
            return {'color': 'black', 'background-color':'white'} 
        }
    }

    cellStyleRag(params){
        
        if(params.value){
            let value = params.value
            if (value == 'Green') {
                return { 'background-color': 'Green', 'font-weight': 'bold', 'line-height': '35px', 'text-align': 'center' }
            } else if (value == 'Amber') {
                return { 'background-color': 'Gold', 'font-weight': 'bold', 'line-height': '35px', 'text-align': 'center'  }
            } else if (value == 'Red') {
                return { 'background-color': 'Red', 'font-weight': 'bold', 'line-height': '35px', 'text-align': 'center'  }
            }
        }
    }

    poundsPerDayFormatter(params){
        return params.value + ' £/day'
    }

    hoursPerDayFormatter(params) {
        return params.value + ' hours/day'
    }

    hoursFormatter(params) {
        return params.value + ' hours'
    }

    daysFormatter(params) {
        return params.value + ' days'
    }

    percentageFormatter(params) {
        return params.value + '%'
    }

    currencyFormatter(params) {
        return '£' + this.formatNumber(params.value);
    }

    formatNumber(number) {
        // this puts commas into the number eg 1000 goes to 1,000,
        // i pulled this from stack overflow, i have no idea how it works
        return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

}