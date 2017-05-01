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
        return parseInt(String(Math.random()*1000000000),10) 
    }

    generateXmlGetItemById(id: number){
        let _id = String(id)
        return `<View><Query><Where><Eq><FieldRef Name='ID' /><Value Type='Number'>${_id}</Value></Eq></Where></Query></View>`
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


   
}