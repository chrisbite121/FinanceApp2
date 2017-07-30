//replace by api-common
import { Injectable } from '@angular/core'
import { LogService } from './log.service'

import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';

declare var SP;

@Injectable()
export class CoreApiService {
    private listName:string =  'FinanceAppCoreData'
    private listDescription: string = 'Description of Core Data List'
    private contextType: string = 'hostWeb'
    private hostUrl: string = '';
    private appUrl: string = '';

    private createMatList$: Observable<any> 
    private updateMatList$: Observable<any>
    private deleteMatList$: Observable<any>
    private matListExists$: Observable<any>   

    constructor(private logService: LogService){
        this.createMatList$ = new Observable(observer => {
            let clientContext = new SP.ClientContext.get_current();
            let context;

            if (this.contextType == 'hostWeb') {
                context = new SP.AppContextSite(clientContext, this.hostUrl);
            } else if (this.contextType == 'appWeb'){
                context = clientContext;
            } else {
                logService.log('unable to determine context type: Create List failed')
                observer.error('unable to determine context type: Create List failed')
            }

            let oWebsite = context.get_web();

            let listCreationInfo = new SP.ListCreationInformation();
            listCreationInfo.set_title(this.listName);
            listCreationInfo.set_description(this.listDescription)
            listCreationInfo.set_templateType(SP.ListTemplateType.genericList);

            let listInfo = oWebsite.get_lists().add(listCreationInfo);

            listInfo.get_fields().addFieldAsXml('<Field DisplayName="Unique Id" Name="UniqueId" Title="UniqueId" Type="Text" Required="FALSE"  />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="Year" Name="Year" Title="Year" Type="Number" Decimal="FALSE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="Role" Name="Role" Title="Role" Type="Text" Required="FALSE"  />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="Name" Name="Name" Title="Name" Type="Text" Required="FALSE"  />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ContractedDayHours" Name="ContractedDayHours" Title="ContractedDayHours" Type="Number" Decimal="FALSE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);

            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUJan" Name="PUJan" Title="PUJan" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUFeb" Name="PUFeb" Title="PUFeb" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUMar" Name="PUMar" Title="PUMar" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUApr" Name="PUApr" Title="PUApr" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUMay" Name="PUMay" Title="PUMay" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUJun" Name="PUJun" Title="PUJun" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUJul" Name="PUJul" Title="PUJul" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUAug" Name="PUAug" Title="PUAug" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUSep" Name="PUSep" Title="PUSep" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUOct" Name="PUOct" Title="PUOct" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUNov" Name="PUNov" Title="PUNov" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUDec" Name="PUDec" Title="PUDec" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PUForecast" Name="PUForecast" Title="PUForecst" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);

            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHJan" Name="AHJan" Title="AHJan" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHFeb" Name="AHFeb" Title="AHFeb" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHMar" Name="AHMar" Title="AHMar" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHApr" Name="AHApr" Title="AHApr" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHMay" Name="AHMay" Title="AHMay" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHJun" Name="AHJun" Title="AHJun" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHJul" Name="AHJul" Title="AHJul" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHAug" Name="AHAug" Title="AHAug" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHSep" Name="AHSep" Title="AHSep" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHOct" Name="AHOct" Title="AHOct" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHNov" Name="AHNov" Title="AHNov" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHDec" Name="AHDec" Title="AHDec" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHTotalHours" Name="AHTotalHours" Title="AHTotalHours" Type="Number" LCID="1033" Decimal="FALSE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="AHOverHours" Name="AHOverHours" Title="AHOverHours" Type="Number" LCID="1033" Decimal="FALSE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);

            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRDayRate" Name="PRDayRate" Title="PRDayRate" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRBudget" Name="PRBudget" Title="PRBudget" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRJan" Name="PRJan" Title="PRJan" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRFeb" Name="PRFeb" Title="PRFeb" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRMar" Name="PRMar" Title="PRMar" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRApr" Name="PRApr" Title="PRApr" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRMay" Name="PRMay" Title="PRMay" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRJun" Name="PRJun" Title="PRJun" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRJul" Name="PRJul" Title="PRJul" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRAug" Name="PRAug" Title="PRAug" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRSep" Name="PRSep" Title="PRSep" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PROct" Name="PROct" Title="PROct" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRNov" Name="PRNov" Title="PRNov" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRDec" Name="PRDec" Title="PRDec" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRYtdTotal" Name="PRYtdTotal" Title="PRYtdTotal" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRLbe" Name="PRLbe" Title="PRLbe" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRYtdVarianceToBudget" Name="PRYtdVarianceToBudget" Title="PRYtdVarianceToBudget" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="PRForecastVarianceToBudget" Name="PRForecastVarianceToBudget" Title="PRForecastVarianceToBudget" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSDayRate" Name="TSDayRate" Title="TSDayRate" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSJan" Name="TSJan" Title="TSJan" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSFeb" Name="TSFeb" Title="TSFeb" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSMar" Name="TSMar" Title="TSMar" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSApr" Name="TSApr" Title="TSApr" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSMay" Name="TSMay" Title="TSMay" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSJun" Name="TSJun" Title="TSJun" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSJul" Name="TSJul" Title="TSJul" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSAug" Name="TSAug" Title="TSAug" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSSep" Name="TSSep" Title="TSSep" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSOct" Name="TSOct" Title="TSOct" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSNov" Name="TSNov" Title="TSNov" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSDec" Name="TSDec" Title="TSDec" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="TSForecast" Name="TSForecast" Title="TSForecast" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);

            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSJan" Name="ATSJan" Title="ATSJan" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSFeb" Name="ATSFeb" Title="ATSFeb" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSMar" Name="ATSMar" Title="ATSMar" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSApr" Name="ATSApr" Title="ATSApr" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSMay" Name="ATSMay" Title="ATSMay" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSJun" Name="ATSJun" Title="ATSJun" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSJul" Name="ATSJul" Title="ATSJul" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSAug" Name="ATSAug" Title="ATSAug" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSSep" Name="ATSSep" Title="ATSSep" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSOct" Name="ATSOct" Title="ATSOct" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSNov" Name="ATSNov" Title="ATSNov" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSDec" Name="ATSDec" Title="ATSDec" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="ATSYtdTotal" Name="ATSYtdTotal" Title="ATSYtdTotal" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSBudget" Name="RTSBudget" Title="RTSBudget" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSJan" Name="RTSJan" Title="RTSJan" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSFeb" Name="RTSFeb" Title="RTSFeb" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSMar" Name="RTSMar" Title="RTSMar" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSApr" Name="RTSApr" Title="RTSApr" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSMay" Name="RTSMay" Title="RTSMay" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSJun" Name="RTSJun" Title="RTSJun" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSJul" Name="RTSJul" Title="RTSJul" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSAug" Name="RTSAug" Title="RTSAug" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSSep" Name="RTSSep" Title="RTSSep" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSOct" Name="RTSOct" Title="RTSOct" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSNov" Name="RTSNov" Title="RTSNov" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSDec" Name="RTSDec" Title="RTSDec" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSYtdTotal" Name="RTSYtdTotal" Title="RTSYtdTotal" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSLbe" Name="RTSLbe" Title="RTSLbe" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSYtdVarianceToBudget" Name="RTSYtdVarianceToBudget" Title="RTSYtdVarianceToBudget" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);
            listInfo.get_fields().addFieldAsXml('<Field DisplayName="RTSVarianceToBudget" Name="RTSVarianceToBudget" Title="RTSVarianceToBudget" Type="Currency" LCID="1033" Decimal="TRUE" Required="FALSE" />', true, SP.AddFieldOptions.defaultValue);

            observer.next('attempting to execute query')

            context.executeQueryAsync(onListCreateSucceeded, onListCreateFailed);

            function onListCreateSucceeded() {
                let result = this.listName + 'list created';
                observer.next(result);
                logService.log(result);
                observer.complete();     
            }

            function onListCreateFailed(sender, args) {
                let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
                observer.next(result);
                logService.log(result);
                observer.complete();
            }            
        })


        this.deleteMatList$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let oWebsite = context.get_web();

        let financeList = oWebsite.get_lists().getByTitle(this.listName);
        financeList.deleteObject();

        context.executeQueryAsync(success, failure);

        function success() {
            let result = 'list deleted successfully'
            logService.log(result);
            observer.next(result);
            observer.complete();
        }

        function failure(sender, args) {
            let result = 'Request Failed. ' + args.get_message() + '<br/>' + args.get_stackTrace();
            logService.log(result);
            observer.next(result)
            observer.error(result);
        }
    })

    this.matListExists$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let web = context.get_web();

        let listColl = web.get_lists();
        context.load(listColl);
        context.executeQueryAsync(success, failure);

        function success() {
            let listFlag = false;
            let listEnumerator = listColl.getEnumerator();

            while (listEnumerator.moveNext()) {
                let oList = listEnumerator.get_current();
                console.log(oList.get_title());
                if (oList.get_title() == this.ListName) {
                    listFlag = true;
                }
            }

            if (listFlag) {
                let result = 'LIST EXISTS'
                logService.log(result);
                observer.next(result);
                observer.complete()
            } else {
                let result = 'LIST DOES NOT EXIST'
                logService.log(result);
                observer.next(result);
                observer.complete();
            }
        }

        function failure(sender, args) {
            let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            logService.log(result);
            observer.next(result);
            observer.complete();
        }       
    })
    

     //end constructor
    }
}
