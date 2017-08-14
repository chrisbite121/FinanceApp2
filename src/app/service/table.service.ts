import { Injectable } from '@angular/core';

import {NumericEditorComponent} from "../cell-editor/numeric-editor.component";
import { SettingsService } from './settings.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class TableService {

    constructor(private settingsService: SettingsService) {}

    workDays:Array<any> = [
        { field: 'Placeholder', headerName: '', width: 300},
        { field: 'January', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'Febuary', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'March', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'April', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'May', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'June', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'July', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'August', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'September', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'October', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'November', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'December', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
    ];


    percentageUtilised = [
        { field: 'checkBox1', headerName: '', width: 20, checkboxSelection: true },
        { field: 'Name', headerName: '(PU) Name', width: 130, editable: true },
        { field: 'Role', headerName: 'Role', width: 150, editable: true },
        { field: 'PUJan', headerName: 'January', width: 100, editable: true, /*cellEditorFramework: NumericEditorComponent,*/ valueFormatter: (params)=> { return '£' + this.formatNumber(params.value) } },
        { field: 'PUFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUApr', headerName: 'April', width: 100, editable: true , cellEditorFramework: NumericEditorComponent},
        { field: 'PUMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUJul', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUAug', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUOct', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PUForecast', headerName: 'Forecast', width: 100, editable: false, cellStyle:  (params) => { return this.cellStyle(params) }},
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ];    

    actualHours = [
        { field: 'Role', headerName: '(AH) Role', width: 150 },
        { field: 'ContractedDayHours', headerName: 'Contracted Daily Hours', width: 150, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHJan', headerName: 'January',width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHApr', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHJul', headerName: 'July', width: 100, editable: true , cellEditorFramework: NumericEditorComponent},
        { field: 'AHAug', headerName: 'August', width: 100, editable: true , cellEditorFramework: NumericEditorComponent},
        { field: 'AHSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHOct', headerName: 'October', width: 100, editable: true , cellEditorFramework: NumericEditorComponent},
        { field: 'AHNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'AHDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent }, 
        { field: 'AHTotalHours', headerName: 'Total Hours', width: 100, editable: false, cellEditorFramework: NumericEditorComponent, cellStyle:  (params) => { return this.cellStyle(params) } }, 
        { field: 'AHOverHours', headerName: 'Over Hours', width: 100, editable: true, cellEditorFramework: NumericEditorComponent, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ];

    projectResource = [
        { field: 'Role', headerName: '(PR) Role', width: 150 },
        { field: 'PRDayRate', headerName: 'Day Rate', width: 75, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PRBudget', headerName: 'Resource Budget', width: 75, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PRJan', headerName: 'January',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRFeb', headerName: 'Febuary',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRMar', headerName: 'March',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRApr', headerName: 'April',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRMay', headerName: 'May',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRJun', headerName: 'June',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRJul', headerName: 'July',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRAug', headerName: 'August',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRSep', headerName: 'September',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PROct', headerName: 'October',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRNov', headerName: 'November',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRDec', headerName: 'December',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } }, 
        { field: 'PRYtdTotal', headerName: 'YTD Total',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } }, 
        { field: 'PRLbe', headerName: 'LBE',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRYtdVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRForecastVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    travelSubsistence = [
        { field: 'checkBox', headerName: '', width: 20, checkboxSelection: true },
        { field: 'Role', headerName: '(TS) Role', width: 130 },
        { field: 'TSDayRate', headerName: 'T&S Day Rate', width: 150, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'TSJan', headerName: 'January',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSFeb', headerName: 'Febuary',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSMar', headerName: 'March',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSApr', headerName: 'April',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSMay', headerName: 'May',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSJun', headerName: 'June',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSJul', headerName: 'July',width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } }, 
        { field: 'TSForecast', headerName: 'Forecast', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    actualTravelSubsistence = [
        { field: 'Role', headerName: '(ATS) Role', width: 150  },
        { field: 'Placeholder2', headerName: '', width: 150 },
        { field: 'ATSJan', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSApr', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSJul', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSAug', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSOct', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSDec', headerName: 'December', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'ATSYtdTotal',headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    projectResourceTandS = [
        { field: 'Role', headerName: '(RTS) Role', width: 150  },
        { field: 'TSDayRate', headerName: 'T&S Day Rate', width: 75, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSBudget', headerName: 'T&S Budget', width: 75, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'RTSJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSMar', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    ProjectCostsMaterials = [
        { field: 'checkBox3', headerName: '', width: 20, checkboxSelection: true },
        { field: 'Mat', headerName: 'Project Costs (Materials)', width: 130, editable: true }, 
        { field: 'MatBudget', headerName: 'Project Budget', width: 150, editable: true, cellEditorFramework: NumericEditorComponent  },
        { field: 'MatJan', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatFeb', headerName: 'Febuary', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatMar', headerName: 'March', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatApr', headerName: 'April', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatMay', headerName: 'May', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatJun', headerName: 'June', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatJul', headerName: 'July', width: 100, editable: true, cellEditorFramework: NumericEditorComponent},
        { field: 'MatAug', headerName: 'August', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatSep', headerName: 'September', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatOct', headerName: 'October', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatNov', headerName: 'November', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'MatDec', headerName: 'December', width: 100, editable: true , cellEditorFramework: NumericEditorComponent },
        { field: 'MatYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]
    
    Totals = [
        { field: 'Placeholder1', headerName: 'Totals', width: 200 },
        { field: 'TProjectBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'TVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } }
    ]

    //Project Resource Totals
    PRTotals = [
        { field: 'Placeholder4', headerName: 'Totals', width: 200, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PROct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'PRForecastVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } }
    ]

    //Resource Travel Subsistence Totals
    RTSTotals = [
        { field: 'Placeholder5', headerName: 'Totals', width: 200, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'RTSVarianceToBudget', headerName: 'Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } }
    ]

    //material totals
    MatTotals = [
        { field: 'Placeholder6', headerName: 'Totals', width: 200, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatBudget', headerName: 'Project Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatJan', headerName: 'January', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatFeb', headerName: 'Febuary', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatMar', headerName: 'March', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatApr', headerName: 'April', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatMay', headerName: 'May', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatJun', headerName: 'June', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatJul', headerName: 'July', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatAug', headerName: 'August', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatSep', headerName: 'September', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatOct', headerName: 'October', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatNov', headerName: 'November', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatDec', headerName: 'December', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatYtdTotal', headerName: 'YTD Total', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatLbe', headerName: 'LBE', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'MatForecastVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } }
    ]

//summary tables

    CostSummary = [
        { field: 'CostTitle', headerName: '', width: 200, cellStyle:  (params) => { return this.cellStyleStatic(params) } },
        { field: 'BaselineCostHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostBaseline', headerName: '', width: 100, editable: true },
        { field: 'LbeCostHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostLbe', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'YtdCostHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostYtd', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'VarianceCostHeader', headerName: '', width : 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'CostVariance', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'CostVairancePercentage', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'CostRag', headerName: '', width: 60, cellStyle:  (params) => { return this.cellStyleRag(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    GrossSummary = [
        { field: 'GrossTitle', headerName: '', width: 200, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'BaselineGrossHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitBaseline', headerName: '', width: 100, editable: true },
        { field: 'LbeGrossHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitLbe', headerName: '', width: 100, editable: true },
        { field: 'YtdGrossHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitYtd', headerName: '', width: 100, editable: true },
        { field: 'VarianceGrossHeader', headerName: '', width : 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'GrossBenefitVariance', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'GrossBenefitVariancePercentage', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'GrossRag', headerName: '', width: 60, cellStyle:  (params) => { return this.cellStyleRag(params) } },
        { field: 'editorStopper', headerName: '', width: 1, editable:true }
    ]

    NetSummary = [
        { field: 'NetTitle', headerName: '', width: 200, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'BaselineNetHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitBaseline', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'LbeNetHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitLbe', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'YtdNetHeader', headerName: '', width: 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitYtd', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'VarianceNetHeader', headerName: '', width : 150, cellStyle:  (params) => { return this.cellStyleStatic(params) }  },
        { field: 'NetBenefitVariance', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'NetBenefitVariancePercentage', headerName: '', width: 100, cellStyle:  (params) => { return this.cellStyle(params) } },
        { field: 'NetRag', headerName: '', width: 60, cellStyle:  (params) => { return this.cellStyleRag(params) } }
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

    currencyFormatter(params) {
        return '£' + this.formatNumber(params.value);
    }

    formatNumber(number) {
        // this puts commas into the number eg 1000 goes to 1,000,
        // i pulled this from stack overflow, i have no idea how it works
        return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }
}