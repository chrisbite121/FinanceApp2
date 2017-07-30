import { Injectable } from '@angular/core';

import {NumericEditorComponent} from "../cell-editor/numeric-editor.component";

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class TableService {
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
        { field: 'Name', headerName: '(PU) Name', width: 150, editable: true },
        { field: 'Role', headerName: 'Role', width: 150, editable: true },
        { field: 'PUJan', headerName: 'January', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },
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
        { field: 'PUForecast', headerName: 'Forecast', width: 100, editable: false, cellEditorFramework: NumericEditorComponent }
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
        { field: 'AHTotalHours', headerName: 'Total Hours', width: 100, editable: false, cellEditorFramework: NumericEditorComponent }, 
        { field: 'AHOverHours', headerName: 'Over Hours', width: 100, editable: true, cellEditorFramework: NumericEditorComponent },                        
    ];

    projectResource = [
        { field: 'Role', headerName: '(PR) Role', width: 150 },
        { field: 'PRDayRate', headerName: 'Day Rate', width: 75, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PRBudget', headerName: 'Resource Budget', width: 75, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'PRJan', headerName: 'January',width: 100 },
        { field: 'PRFeb', headerName: 'Febuary',width: 100 },
        { field: 'PRMar', headerName: 'March',width: 100 },
        { field: 'PRApr', headerName: 'April',width: 100 },
        { field: 'PRMay', headerName: 'May',width: 100 },
        { field: 'PRJun', headerName: 'June',width: 100 },
        { field: 'PRJul', headerName: 'July',width: 100 },
        { field: 'PRAug', headerName: 'August',width: 100 },
        { field: 'PRSep', headerName: 'September',width: 100 },
        { field: 'PROct', headerName: 'October',width: 100 },
        { field: 'PRNov', headerName: 'November',width: 100 },
        { field: 'PRDec', headerName: 'December',width: 100 }, 
        { field: 'PRYtdTotal', headerName: 'YTD Total',width: 100 }, 
        { field: 'PRLbe', headerName: 'LBE',width: 100 },
        { field: 'PRYtdVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100 },
        { field: 'PRForecastVarianceToBudget', headerName: 'Forecast Variance to Budget',width: 100 }                          
    ]

    travelSubsistence = [
        { field: 'Role', headerName: '(TS) Role', width: 150 },
        { field: 'TSDayRate', headerName: 'T&S Day Rate', width: 150, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'TSJan', headerName: 'January',width: 100 },
        { field: 'TSFeb', headerName: 'Febuary',width: 100 },
        { field: 'TSMar', headerName: 'March',width: 100 },
        { field: 'TSApr', headerName: 'April',width: 100 },
        { field: 'TSMay', headerName: 'May',width: 100 },
        { field: 'TSJun', headerName: 'June',width: 100 },
        { field: 'TSJul', headerName: 'July',width: 100 },
        { field: 'TSAug', headerName: 'August', width: 100 },
        { field: 'TSSep', headerName: 'September', width: 100 },
        { field: 'TSOct', headerName: 'October', width: 100 },
        { field: 'TSNov', headerName: 'November', width: 100 },
        { field: 'TSDec', headerName: 'December', width: 100 }, 
        { field: 'TSForecast', headerName: 'Forecast', width: 100 },                          
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
        { field: 'ATSYtdTotal',headerName: 'YTD Total', width: 100 },                   
    ]

    projectResourceTandS = [
        { field: 'Role', headerName: '(RTS) Role', width: 150  },
        { field: 'TSDayRate', headerName: 'T&S Day Rate', width: 75 },
        { field: 'RTSBudget', headerName: 'T&S Budget', width: 75, editable: true, cellEditorFramework: NumericEditorComponent },
        { field: 'RTSJan', headerName: 'January', width: 100 },
        { field: 'RTSFeb', headerName: 'Febuary', width: 100 },
        { field: 'RTSMar', headerName: 'Febuary', width: 100 },
        { field: 'RTSApr', headerName: 'April', width: 100 },
        { field: 'RTSMay', headerName: 'May', width: 100 },
        { field: 'RTSJun', headerName: 'June', width: 100 },
        { field: 'RTSJul', headerName: 'July', width: 100 },
        { field: 'RTSAug', headerName: 'August', width: 100 },
        { field: 'RTSSep', headerName: 'September', width: 100 },
        { field: 'RTSOct', headerName: 'October', width: 100 },
        { field: 'RTSNov', headerName: 'November', width: 100 },
        { field: 'RTSDec', headerName: 'December', width: 100 },
        { field: 'RTSYtdTotal', headerName: 'YTD Total', width: 100 },
        { field: 'RTSLbe', headerName: 'LBE', width: 100 },
        { field: 'RTSYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100 },
        { field: 'RTSVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 }                                                             
    ]

    ProjectCostsMaterials = [
        { field: 'Mat', headerName: 'Project Costs (Materials)', width: 150, editable: true }, 
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
        { field: 'MatYtdTotal', headerName: 'YTD Total', width: 100 },
        { field: 'MatLbe', headerName: 'LBE', width: 100 },
        { field: 'MatYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 },
        { field: 'MatVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 }                        
    ]
    
    Totals = [
        { field: 'Placeholder1', headerName: 'Totals', width: 200 },
        { field: 'TProjectBudget', headerName: 'Project Budget', width: 100 },
        { field: 'TJan', headerName: 'January', width: 100 },
        { field: 'TFeb', headerName: 'Febuary', width: 100 },
        { field: 'TMar', headerName: 'March', width: 100 },
        { field: 'TApr', headerName: 'April', width: 100 },
        { field: 'TMay', headerName: 'May', width: 100 },
        { field: 'TJun', headerName: 'June', width: 100 },
        { field: 'TJul', headerName: 'July', width: 100 },
        { field: 'TAug', headerName: 'August', width: 100 },
        { field: 'TSep', headerName: 'September', width: 100 },
        { field: 'TOct', headerName: 'October', width: 100 },
        { field: 'TNov', headerName: 'November', width: 100 },
        { field: 'TDec', headerName: 'December', width: 100 },
        { field: 'TYtdTotal', headerName: 'YTD Total', width: 100 },
        { field: 'TLbe', headerName: 'LBE', width: 100 },
        { field: 'TYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 },
        { field: 'TVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 }
    ]

    //Project Resource Totals
    PRTotals = [
        { field: 'Placeholder4', headerName: 'Totals', width: 200 },
        { field: 'PRBudget', headerName: 'Project Budget', width: 100 },
        { field: 'PRJan', headerName: 'January', width: 100, cellStyle: function(params) { 
                                                                console.log(params);
                                                                return {'color': 'red', 'background-color':'green'} 
                                                            } },
        { field: 'PRFeb', headerName: 'Febuary', width: 100 },
        { field: 'PRMar', headerName: 'March', width: 100 },
        { field: 'PRApr', headerName: 'April', width: 100 },
        { field: 'PRMay', headerName: 'May', width: 100 },
        { field: 'PRJun', headerName: 'June', width: 100 },
        { field: 'PRJul', headerName: 'July', width: 100 },
        { field: 'PRAug', headerName: 'August', width: 100 },
        { field: 'PRSep', headerName: 'September', width: 100 },
        { field: 'PROct', headerName: 'October', width: 100 },
        { field: 'PRNov', headerName: 'November', width: 100 },
        { field: 'PRDec', headerName: 'December', width: 100 },
        { field: 'PRYtdTotal', headerName: 'YTD Total', width: 100 },
        { field: 'PRLbe', headerName: 'LBE', width: 100 },
        { field: 'PRYtdVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 },
        { field: 'PRForecastVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 }
    ]

    //Resource Travel Subsistence Totals
    RTSTotals = [
        { field: 'Placeholder5', headerName: 'Totals', width: 200 },
        { field: 'RTSBudget', headerName: 'Project Budget', width: 100 },
        { field: 'RTSJan', headerName: 'January', width: 100 },
        { field: 'RTSFeb', headerName: 'Febuary', width: 100 },
        { field: 'RTSMar', headerName: 'March', width: 100 },
        { field: 'RTSApr', headerName: 'April', width: 100 },
        { field: 'RTSMay', headerName: 'May', width: 100 },
        { field: 'RTSJun', headerName: 'June', width: 100 },
        { field: 'RTSJul', headerName: 'July', width: 100 },
        { field: 'RTSAug', headerName: 'August', width: 100 },
        { field: 'RTSSep', headerName: 'September', width: 100 },
        { field: 'RTSOct', headerName: 'October', width: 100 },
        { field: 'RTSNov', headerName: 'November', width: 100 },
        { field: 'RTSDec', headerName: 'December', width: 100 },
        { field: 'RTSYtdTotal', headerName: 'YTD Total', width: 100 },
        { field: 'RTSLbe', headerName: 'LBE', width: 100 },
        { field: 'RTSYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100 },
        { field: 'RTSVarianceToBudget', headerName: 'Variance to Budget', width: 100 }
    ]           

    //material totals
    MatTotals = [
        { field: 'Placeholder6', headerName: 'Totals', width: 200 },
        { field: 'MatBudget', headerName: 'Project Budget', width: 100 },
        { field: 'MatJan', headerName: 'January', width: 100 },
        { field: 'MatFeb', headerName: 'Febuary', width: 100 },
        { field: 'MatMar', headerName: 'March', width: 100 },
        { field: 'MatApr', headerName: 'April', width: 100 },
        { field: 'MatMay', headerName: 'May', width: 100 },
        { field: 'MatJun', headerName: 'June', width: 100 },
        { field: 'MatJul', headerName: 'July', width: 100 },
        { field: 'MatAug', headerName: 'August', width: 100 },
        { field: 'MatSep', headerName: 'September', width: 100 },
        { field: 'MatOct', headerName: 'October', width: 100 },
        { field: 'MatNov', headerName: 'November', width: 100 },
        { field: 'MatDec', headerName: 'December', width: 100 },
        { field: 'MatYtdTotal', headerName: 'YTD Total', width: 100 },
        { field: 'MatLbe', headerName: 'LBE', width: 100 },
        { field: 'MatYtdVarianceToBudget', headerName: 'YTD Variance to Budget', width: 100 },
        { field: 'MatForecastVarianceToBudget', headerName: 'Forecast Variance to Budget', width: 100 }
    ]

//summary tables

    CostSummary = [
        { field: 'RowTitle', headerName: '', width: 150 },
        { field: 'BaselineHeader', headerName: '', width: 150 },
        { field: 'CostBaseline', headerName: '', width: 150, editable: true },
        { field: 'LbeHeader', headerName: '', width: 150 },
        { field: 'CostLbe', headerName: '', width: 150, editable: true },
        { field: 'YtdHeader', headerName: '', width: 150 },
        { field: 'CostYtd', headerName: '', width: 150, editable: true },
        { field: 'VarianceHeader', headerName: '', width : 150 },
        { field: 'CostVariance', headerName: '', width: 150, editable: true },
        { field: 'CostVairancePercentage', headerName: '', width: 150, editable: true },
        { field: 'CostRag', headerName: '', width: 50 }
    ]

    GrossSummary = [
        { field: 'RowTitle', headerName: '', width: 150 },
        { field: 'BaselineHeader', headerName: '', width: 150 },
        { field: 'GrossBenefitBaseline', headerName: '', width: 150, editable: true },
        { field: 'LbeHeader', headerName: '', width: 150 },
        { field: 'GrossBenefitLbe', headerName: '', width: 150, editable: true },
        { field: 'YtdHeader', headerName: '', width: 150 },
        { field: 'GrossBenefitYtd', headerName: '', width: 150, editable: true },
        { field: 'VarianceHeader', headerName: '', width : 150 },
        { field: 'GrossBenefitVariance', headerName: '', width: 150, editable: true },
        { field: 'GrossBenefitVariancePercentage', headerName: '', width: 150, editable: true },
        { field: 'GrossRag', headerName: '', width: 50 }
    ]

    NetSummary = [
        { field: 'RowTitle', headerName: '', width: 150 },
        { field: 'BaselineHeader', headerName: '', width: 150 },
        { field: 'NetBenefitBaseline', headerName: '', width: 150, editable: true },
        { field: 'LbeHeader', headerName: '', width: 150 },
        { field: 'NetBenefitLbe', headerName: '', width: 150, editable: true },
        { field: 'YtdHeader', headerName: '', width: 150 },
        { field: 'NetBenefitYtd', headerName: '', width: 150, editable: true },
        { field: 'VarianceHeader', headerName: '', width : 150 },
        { field: 'NetBenefitVariance', headerName: '', width: 150, editable: true },
        { field: 'NetBenefitVariancePercentage', headerName: '', width: 150, editable: true },
        { field: 'NetRag', headerName: '', width: 50 }
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
        let obs = Observable.create((observer: Observer<any>) => {
            observer.next(this[TableName]);
            observer.complete()
        })
        return obs;
    }

}