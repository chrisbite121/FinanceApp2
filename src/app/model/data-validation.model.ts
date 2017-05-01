export interface IFieldThatDoesntExist {
    listName: string,
    fieldName: string,
}

export interface IFieldUpdate{
    listName: string,
    fieldName: string,
    oldSchema: string,
    newSchema: string
}

// export interface IFieldWrongType {
//     listName: string,
//     fieldName: string,
//     oldSchema: string,
//     newSchema: string
// }

export interface IFieldExists {
    fieldName: string,
    listName: string,
    value: Boolean
}

export interface IFieldUpdateResult {
    fieldName: string,
    listName: string,
    result: boolean
}

export interface IListExists {
    apiCall: string,
    listName: string,
    value: Boolean
}

export interface ISchemaFieldResult {
    fieldName: string,
    listName: string,
    schemaXml: string
}

export interface IPermissionResult {
    permission: string,
    result: Boolean
}

export interface ISchemaListResult {
    apiCall: string,
    listName: string,
    result: boolean,
    schemaXml: string
}

export interface ICreateListSuccess {
    listName: string,
    result: Boolean
}

export interface ICreateListFailed {
    listName: string,
    result: Boolean
}

export interface ICreateListError {
    listName: string,
    error: Object
}

export interface ICreateFieldsSuccess {
    listName: string,
    fieldName: string,
    result: Boolean
}

export interface ICreateFieldsFailed {
    listName: string,
    fieldName: string,
    result: Boolean
}

export interface ICreateFieldsError {
    listName: string,
    error: Object
}

export interface IUpdateFieldsSuccess {
    listName: string,
    fieldName: string,
    result: Boolean
}

export interface IUpdateFieldsFailed {
    listName: string,
    fieldName: string,
    result: Boolean
}

export interface IUpdateFieldsError {
    listName: string,
    fieldName: string,
    error: Object
}

export interface IListExistsSuccess {
    listName: string,
    result: Boolean
}

export interface IListExistsFailed {
    listName: string,
    result: Boolean    
}

export interface IListExistsError {
    listName: string,
    error: Object   
}

export interface IListDeleteSuccess {
    listName: string,
    result: Boolean     
}

export interface IListDeleteFailed {
    listName: string,
    result: Boolean     
}

export interface IListDeleteError {
    listName: string,
    error: Object       
}

export interface IListCreateSuccess {
    listName: string,
    result: Boolean       
}

export interface IListCreateFailed {
    listName: string,
    result: Boolean       
}

export interface IListCreateError {
    listName: string,
    error: Object    
}

export interface IItemPropertyModel {
    fieldName: string, //fieldName
    fieldValue: any     //fieldValue
}

export interface IAddItemResult {
    apiCall: string,
    listName: string,
    result: boolean
}

export interface IUpdateItemResult {
    apiCall: string,
    listName: string,
    itemId: string,
    result: boolean
}

export interface IDeleteItemResult {
    apiCall: string,
    listName: string,
    itemId: string,
    result: boolean
}

export interface IFieldSpecModel {
    Id: number,
    Name: string,
    Type: string,
    Required: string
}

