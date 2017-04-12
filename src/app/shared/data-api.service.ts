import { Injectable } from '@angular/core'
import { LogService } from './log.service'

import { Observable } from 'rxjs/RX';
import { Observer } from 'rxjs/Observer';

declare var SP:any;

@Injectable()
export class DataApiService {
    private FinanceTable: any = {};
    public appUrl: string;
    public hostUrl: string;
    public source$: Observable<any>;
    public createList$: Observable<any>;
    public updateList$: Observable<any>;
    public deleteList$: Observable<any>;
    public readList$: Observable<any>;
    public listExists$: Observable<any>;
    public fieldExists$: Observable<any>;
    public readField$: Observable<any>;
    public readFields$: Observable<any>;
    public deleteField$: Observable<any>;
    public updateField$: Observable<any>;
    public addItem$: Observable<any>;
    public updateItem$: Observable<any>;
    public getItem$: Observable<any>;
    public getItems$: Observable<any>;
    public deleteItem$: Observable<any>;
    public deleteItems$: Observable<any>;

    constructor(private logService:LogService){
        this.FinanceTable['create'] = [];
        this.FinanceTable['update'] = [];
        this.FinanceTable['delete'] = [];

        this.appUrl = this.getQueryStringParameter('SPAppWebUrl');
        this.hostUrl = this.getQueryStringParameter('SPHostUrl');


        this.createList$ = new Observable(observer => {
        let clientContext = new SP.ClientContext.get_current();
        let oWebsite = clientContext.get_web();

        let listCreationInfo = new SP.ListCreationInformation();
        listCreationInfo.set_title('FinanceData');
        listCreationInfo.set_description('description of Finance Data')
        listCreationInfo.set_templateType(SP.ListTemplateType.genericList);

        let listInfo = oWebsite.get_lists().add(listCreationInfo);
        observer.next('attempting to execute query')
        //clientContext.load(listInfo);

        clientContext.executeQueryAsync(onListCreateSucceeded, onListCreateFailed);

        function onListCreateSucceeded() {
            //if (listInfo && listInfo.get_title()) console.log(listInfo.get_title());
            let result = 'Finance Data created';
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

    this.updateList$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let oWebsite = context.get_web();

        let financeList = oWebsite.get_lists().getByTitle('FinanceData');
        financeList.get_fields().addFieldAsXml('<Field DisplayName="year" Type="Integer" Required="FALSE" Name="year" Title="year" />', true, SP.AddFieldOptions.defaultValue);
        financeList.get_fields().addFieldAsXml('<Field DisplayName="january" Type="Number" Decimal="TRUE" Required="FALSE" Name="january" Title="january" />', true, SP.AddFieldOptions.defaultValue);

        context.executeQueryAsync(success, fail);

        function success() {
            let result = 'Product list updated'
            logService.log(result);
            observer.next(result);
            observer.complete();
        }

        function fail(sender, args) {
            let result = 'Request Failed. ' + args.get_message() + '<br>' + args.get_stackTrace();
            logService.log(result);
            observer.next(result);
            observer.complete();
            
        }
    })

    this.deleteList$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let oWebsite = context.get_web();

        let financeList = oWebsite.get_lists().getByTitle('FinanceData');
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
            observer.complete();
        }
    })

    this.readList$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let web = context.get_web();
        let financeList = web.get_lists().getByTitle('FinanceData');
        let flFields = financeList.get_fields();
        context.load(flFields, 'Include(Title, InternalName)');
        context.executeQueryAsync(success, failure);

        function success() {
            let lEnum = flFields.getEnumerator();
            console.log(lEnum);
            while (lEnum.moveNext()) {
                let internalName = lEnum.get_current().get_internalName();
                let title = lEnum.get_current().get_title();
                logService.log('field title: ' + title + ' internal name: ' + internalName);
                observer.next(title);
                observer.next(internalName);
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

    this.listExists$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let web = context.get_web();

        let listColl = web.get_lists();
        context.load(listColl);
        context.executeQueryAsync(success, failure);

        function success() {
            let listTitle = 'FinanceData';
            let listFlag = false;
            let listEnumerator = listColl.getEnumerator();

            while (listEnumerator.moveNext()) {
                let oList = listEnumerator.get_current();
                console.log(oList.get_title());
                if (oList.get_title() == 'FinanceData') {
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

    this.fieldExists$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let web = context.get_web();
        let fields = web.get_lists().getByTitle('FinanceData').get_fields();

        context.load(fields);
        context.executeQueryAsync(success, failure);

        function success() {
            let fieldTitle = 'year';
            let fieldFlag = false;
            let fieldEnumerator = fields.getEnumerator();

            while (fieldEnumerator.moveNext()) {
                let oField = fieldEnumerator.get_current();
                console.log(oField.get_title());
                if (oField.get_title() == 'year') {
                    console.log('FOUND THE FIELD WE ARE LOOKING FOR')
                    fieldFlag = true;
                }
            }

            if (fieldFlag) {
                let result = 'FIELD EXISTS'
                logService.log(result);
                observer.next(result);
                observer.complete()
            } else {
                let result = 'FIELD DOES NOT EXIST'
                logService.log(result);
                observer.next(result);
                observer.complete()
            }
        }

        function failure() {
            let result = 'FAILED TO CHECK FIELD';
            logService.log(result);
            observer.next(result);
            observer.complete()
        }            
    })

    this.readField$ = new Observable(observer => {
        let ctx = new SP.ClientContext(this.appUrl);
        let web = ctx.get_web();
        let field = web.get_lists().getByTitle('FinanceData').get_fields().getByInternalNameOrTitle('year');
        ctx.load(field, "SchemaXml");

        ctx.executeQueryAsync(success, failure);

        function success() {
            let result = 'SUCCESSFULLY READ FIELD';
            let SchemaXml = field.get_schemaXml();
            logService.log(result);
            observer.next(result);
            console.log(SchemaXml);
            logService.log(SchemaXml);
            observer.complete();         
        }
        function failure() {
            let result = 'FAILED TO READ FIELD';
            logService.log(result);
            observer.next(result);
            observer.complete();      
        }
    })

    this.readFields$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let web = context.get_web();
        //let field = web.get_lists().getByTitle('FinanceData').get_fields().getByInternalNameOrTitle('year');
        let fields = web.get_lists().getByTitle('FinanceData').get_fields();
        context.load(fields);

        context.executeQueryAsync(success, failure);

        function success() {
            let fieldEnumerator = fields.getEnumerator();
            while (fieldEnumerator.moveNext()) {
                let oField = fieldEnumerator.get_current();
                console.log(oField.get_title())
                let result = 'FIELD TITLE ' + oField.get_title() + ' FIELD INTERNAL NAME: ' + oField.get_internalName();
                logService.log(result);
                observer.next(result);
                                    
            }
            observer.complete(); 
        }

        function failure() {
            let result = 'FAILED TO READ FIELD';
            logService.log(result);
            observer.next(result);
            observer.complete();                
        }            
    })

    this.deleteField$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let web = context.get_web();
        let field = web.get_lists().getByTitle('FinanceData').get_fields().getByInternalNameOrTitle('year');
        field.deleteObject();

        context.executeQueryAsync(success, failure);

        function success() {
            let result = 'FIELD - year - DELETED SUCCESSFULLY';
            observer.next(result);
            logService.log(result);
            observer.complete()
        }

        function failure() {
            let result = 'FAILED TO DELETE FIELD - year'
            observer.next(result);
            logService.log(result);
            observer.complete()   
        }
    }) 
        
    this.updateField$ = new Observable(observer => {
        let context = new SP.ClientContext(this.appUrl);
        let web = context.get_web();
        let field = web.get_lists().getByTitle('FinanceData').get_fields().getByInternalNameOrTitle('year');
        //field.set_schemaXml('<Field DisplayName="year" Type="Integer" Required="FALSE" Name="years" Title="years" />', true, SP.AddFieldOptions.defaultValue);
        //field.update();
        context.load(field, "SchemaXml");
        context.executeQueryAsync(success, failure);

        function success() {
            let schema = field.get_schemaXml();
            var s1 = schema.replace('DisplayName="year"', 'DisplayName="YEARS"')
            field.set_schemaXml(s1);

            field.update();
            context.executeQueryAsync(success1, failure1);

            function success1() {
                let result = 'FIELD - year - UPDATED SUCCESSFULLY';
                observer.next(result);
                logService.log(result);
                observer.complete()                   
            }
            function failure1() {
                let result = 'FAILED TO UPDATE FIELD BY REPLACING SCHEMA XML - year';
                observer.next(result);
                logService.log(result);
                observer.complete()                         
            }
        }

        function failure() {
            let result = 'FAILED TO UPDATE FIELD - year';
            observer.next(result);
            logService.log(result);
            observer.complete()                     
        }                            
    })

    this.addItem$ = new Observable(observer=>{
        let ctx = new SP.ClientContext(this.appUrl);
        let list = ctx.get_web().get_lists().getByTitle('FinanceData');

        let itemCreateInfo = new SP.ListItemCreationInformation();
        let listItem = list.addItem(itemCreateInfo);
        listItem.set_item('Title', 'New Item');
        listItem.set_item('year', 1984);
        listItem.update();

        ctx.load(listItem);
        ctx.executeQueryAsync(success, failure);

        function success() {
            let result = 'ITEM CREATED SUCCESSFULLY'
            observer.next(result);
            logService.log(result);
            observer.complete()                 
        }

        function failure(sender, args) {
            let result = 'Request Failed. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            console.log('FAILED TO CREATE ITEM')
            observer.next(result);
            logService.log(result);
            observer.complete() 
        }            
    })

    this.updateItem$ = new Observable(observer => {
        let ctx = new SP.ClientContext(this.appUrl);
        let list = ctx.get_web().get_lists().getByTitle('FinanceData');

        let listItem = list.getItemById(1);
        listItem.set_item('Title', 'UPDATED TITLE');
        listItem.update();
        ctx.executeQueryAsync(success, failure);

        function success() {
            let result = 'UPDATED ITEM SUCCESSFULLY';
            observer.next(result);
            logService.log(result);
            observer.complete();
        }

        function failure(sender, args) {
            let result = 'Failed to UPDATE ITEM: ' + args.get_message() + '  ' + args.get_stackTrace();
            observer.next(result);
            logService.log(result);
            observer.complete();                
        }            
    })

    this.getItem$ = new Observable(observer=> {
        let ctx = new SP.ClientContext(this.appUrl);
        let web = ctx.get_web();
        let list = web.get_lists().getByTitle('FinanceData');

        let queryString = "<View><Query><Where><Eq><FieldRef Name='ID' /><Value Type='Number'>1</Value></Eq></Where></Query></View>";
        let query = new SP.CamlQuery();
        query.set_viewXml(queryString);

        let listItems = list.getItems(query);
        ctx.load(listItems);

        ctx.executeQueryAsync(success, failure);

        function success() {
            console.log('executed query successfully');
            let listItemEnumerator = listItems.getEnumerator();
            console.log('length of returned collection: ', listItems.get_count());
            while (listItemEnumerator.moveNext()) {
                let oListItem = listItemEnumerator.get_current();
                let result = oListItem.get_fieldValues()
                observer.next(result);
                logService.log(result);
            }
            observer.complete();
        }

        function failure(sender, args) {
            let result = 'Request Failed to get items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace()
            observer.next(result);
            logService.log(result);
            observer.complete(); 
        }            
    })

    this.getItems$ = new Observable(observer => {
        let ctx = new SP.ClientContext(this.appUrl);
        let web = ctx.get_web();
        let list = web.get_lists().getByTitle('FinanceData');
        let camlQuery = new SP.CamlQuery();
        let items = list.getItems(camlQuery);

        ctx.load(items);
        ctx.executeQueryAsync(success, failure);

        function success() {
            let itemEnumerator = items.getEnumerator();
            while (itemEnumerator.moveNext()) {
                let oItem = itemEnumerator.get_current();
                // note get_fieldValues returns json object
                let fieldValues = oItem.get_fieldValues();
                console.log(fieldValues);

            }
        }

        function failure(sender, args) {
            let result = 'Request Failed to get items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
            observer.next(result);
            logService.log(result);
            observer.complete(); 
        }            
    })

    this.deleteItem$ = new Observable(observer => {
        let ctx = new SP.ClientContext(this.appUrl);
        let web = ctx.get_web();
        let listItem = web.get_lists().getByTitle('FinanceData').getItemById(1);

        listItem.deleteObject();

        ctx.executeQueryAsync(success, failure);

        function success() {
            let result = 'ITEM DELETED SUCCESSFULLY'
            observer.next(result);
            logService.log(result);
            observer.complete();                 
        }


        function failure(sender, args) {
            let result = 'FAILED TO DELETE ITEMS FUNCTION ' + args.get_message() + ' <br/> ' + args.get_stackTrace()
            observer.next(result);
            logService.log(result);
            observer.complete();                  
        }            
    })

    this.deleteItems$ = new Observable(observer => {
        let ctx = SP.ClientContext.get_current();

        let list = ctx.get_web().get_lists().getByTitle('FinanceData');

        let query = new SP.CamlQuery();
        let items = list.getItems(query);
        ctx.load(items, "Include(Id)");
        ctx.executeQueryAsync(success, failure);

        function success() {
            var itemEnumerator = items.getEnumerator();
            let simpleArray = [];
            while (itemEnumerator.moveNext()) {
                simpleArray.push(itemEnumerator.get_current());
            }
            for (let s in simpleArray) {
                simpleArray[s].deleteObject();
            }

            ctx.executeQueryAsync(success2, failure2);

            function success2() {
                let result = 'all items deleted successfully'
                this.logService.log(result);
                observer.next(result);
                observer.complete();                   
            };
            function failure2(sender, args) {
                let result = 'Request Failed to delete items. ' + args.get_message() + ' <br/> ' + args.get_stackTrace();
                logService.log(result);
                observer.next(result);
                observer.complete(); 
            }
        }


        function failure() {
            function failure2(sender, args) {
                let result = 'FAILED TO GET ALL ITEMS IN DELETE ITEMS FUNCTION ' + args.get_message() + ' <br/> ' + args.get_stackTrace()
                logService.log(result);
                observer.next(result);
                observer.complete(); 
            }
        }           
        
    });

        //end of constructor
    }

    saveChanges(dataModel: any) {
        console.log(dataModel);
        this.logService.log('data saved success');
    }

    subscribeToObs(): Observable<any> {
        return this.source$
    }

    createList(): Observable<any> {
        return this.createList$
    }

    updateList(): Observable<any> {
        return this.updateList$
    }

    deleteList(): Observable<any> {
        return this.deleteList$
    }

    readList(): Observable<any> {
        return this.readList$
    }

    listExists(): Observable<any> {
        return this.listExists$
    }

    fieldExists(): Observable<any> {
        return this.fieldExists$
    }

    readField(): Observable<any> {
        return this.readField$
    }

    readFields():Observable<any>{
        return this.readFields$
    }

    deleteField(): Observable<any>{
        return this.deleteField$
    }

    updateField(): Observable<any> {
        return this.updateField$
    }

    addItem(): Observable<any> {
        return this.addItem$
    }

    updateItem(): Observable<any>{
        return this.updateItem$
    }

    getItem(): Observable<any> {
        return this.getItem$
    }

    getItems(): Observable<any> {
        return this.getItems$
    }

    deleteItem(): Observable<any> {
        return this.deleteItem$
    }

    deleteItems(): Observable<any> {
        return this.deleteItems$
    }

    getQueryStringParameter(urlParameterKey) {
    if (document.URL && 
        document.URL.length > 0 &&
        document.URL.indexOf('?')> -1) {
        
        var params = document.URL.split('?')[1].split('&');
        var strParams = '';
        if (params && params.length>0) {
            for (var i = 0; i < params.length; i = i + 1) {
                var singleParam = params[i].split('=');
                if (singleParam[0] == urlParameterKey)
                    return decodeURIComponent(singleParam[1]);
            }
        }
    }
}

}