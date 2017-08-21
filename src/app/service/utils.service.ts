import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {
private _Serializer;
private _Parser;
    
    constructor(){
        this._Serializer = new XMLSerializer();
        this._Parser = new DOMParser();
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

    generateItemId(){
        //generates number based on milliseconds, ensure uniqueness
        return new Date().getTime()
    }

    generateXmlGetItemById(id: number){
        let _id = String(id)
        return `<View><Query><Where><Eq><FieldRef Name='ID' /><Value Type='Number'>${_id}</Value></Eq></Where></Query></View>`
    }

    generateXmlGetFirstXItems(number: number){
        let _number = number.toString()
        return `<View><Query><OrderBy><FieldRef Name="Created" Ascending="false" /></OrderBy></Query><RowLimit>${_number}</RowLimit></View>`;
    }

    parseXml(xmlString: string){
        return this._Parser.parseFromString(xmlString,"text/xml");
    }

    serializeXml(xmlDoc){
        //serializer
        return this._Serializer.serializeToString(xmlDoc);  
    }

    // Changes XML to JSON
    xmlToJson(xml) {
        
        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        
        // do children
        if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    };

    includeFields(fieldsArray){
        return 'Include(ID,'
                .concat(fieldsArray.join())
                .concat(')')
    }

    genCamlQuery(config?: any):string{
        let camlQuery
        if(typeof(config) == 'object' &&
            config.hasOwnProperty('fieldRef') &&
            config.hasOwnProperty('type') &&
            config.hasOwnProperty('value')) {
            camlQuery = `<View><Query><Where><Eq><FieldRef Name="${config.fieldRef}" /><Value Type="${config.type}">${config.value}</Value></Eq></Where><OrderBy><FieldRef Name="ID" Ascending="FALSE"/></OrderBy></Query></View>`
        } else {
            camlQuery =  '<View><Query><OrderBy><FieldRef Name="ID" Ascending="FALSE"/></OrderBy></Query></View>' 
        }
        console.log(camlQuery)
        return camlQuery
    }

    get message() {
        return 'message'
    }

    get uiState() {
        return 'state'
    }

    get redStatus() {
        return 'red'
    }

    get amberStatus() {
        return 'amber'
    }

    get greenStatus() {
        return 'green'
    }

    get infoStatus() {
        return 'info'
    }

    get errorStatus() {
        return 'error'
    }

    get successStatus() {
        return 'success'
    }

    get failStatus() {
        return 'fail'
    }

    get NaStatus() {
        return 'NA'
    }

    get manageWeb(){
        return 'manageWeb'
    }

    get manageList(){
        return 'manageList'
    }

    get viewList() {
        return 'viewList'
    }

    get addListItems(){
        return 'addListItems'
    }

    get apiSuccess() {
        return 'apiResultSuccess'
    }

    get hostWeb() {
        return 'hostWeb'
    }

    get appWeb() {
        return 'appWeb'
    }

    get financeAppResourceData(){
        return 'FinanceAppResourceData'
    }

    get financeAppMaterialData(){
        return 'FinanceAppMaterialData'
    }

    get financeAppSettingsData(){
        return 'FinanceAppSettingsData'
    }

    get financeAppTotalsData(){
        return 'FinanceAppTotalsData'
    }

    get financeAppLogsData(){
        return 'FinanceAppLogsData'
    }

    get financeAppWorkingDaysData(){
        return 'FinanceAppWorkingDaysData'
    }

    get financeAppSummaryData(){
        return 'FinanceAppSummaryData'
    }

    get createState(){
        return 'create'
    }

    get updateState() {
        return 'update'
    }

    get deleteState() {
        return 'delete'
    }

    get inertState() {
        return 'inert'
    }

    getSubscriber() {
        return {
            next(data){
                console.log('next', data)
            },
            error(err){
                console.log('error', err)
            },
            complete(){
                console.log('completed');
            }
        }
    }

    //api calls

    get apiCallListExists() {
        return 'listExists'
    }

    get apiCallDeleteList() {
        return 'deleteList'
    }

    get apiCallCreateList(){
        return 'createList'
    }

    get apiCallFieldsRequired(){
        return 'fieldsRequired'
    }

    get apiCallFieldsType(){
        return 'fieldsType'
    }

    get apiCallFieldsExists(){
        return 'fieldsExists'
    }

    get apiCallListXmlData() {
        return 'listXmlData'
    }

    get apiCallAddFields() {
        return 'addFields'
    }

    get apiCallUpdateField(){
        return 'updateField'
    }

    get apiCallGetItems() {
        return 'getItems'
    }

    get apiCallAddItem() {
        return 'addItem'
    }

    get apiCallGetItem() {
        return 'getItem'
    }

    get apiCallAddItems(){
        return 'addItems'
    }

    get apiCallGetItemCount(){
        return 'getItemCount'
    }

    get apiCallUpdateItem(){
        return 'updateItem'
    }

    get apiCallDeleteItem(){
        return 'deleteItem'
    }

    get apiCallGetPermissions(){
        return 'getPermissions'
    }

    get apiCallAddField(){
        return 'apiCallAddField'
    }

    get resourceDataSetName(){
        return '_ResourceData'
    }

    get materialDataSetname(){
        return '_MaterialData'
    }

    get totalDataSetName(){
        return  '_TotalData'
    }
    
    get summaryDataSetName(){
        return  '_SummaryData'
    }

    get loadingStatus(){
        return 'loading'
    }

    get completeStatus(){
        return 'complete'
    }
}