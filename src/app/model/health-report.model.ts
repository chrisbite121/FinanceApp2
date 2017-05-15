import { 
        IFieldThatDoesntExist,
        IListExists,
        IPermissionResult,
        ICreateListSuccess,
        ICreateListFailed,
        ICreateListError,
        ICreateFieldsSuccess,
        ICreateFieldsFailed,
        ICreateFieldsError,
        IUpdateFieldsSuccess,
        IUpdateFieldsFailed,
        IUpdateFieldsError,
        IListExistsSuccess,
        IListExistsFailed,
        IListExistsError,
        IListDeleteSuccess,
        IListDeleteFailed,
        IListDeleteError,
        IListCreateSuccess,
        IListCreateFailed,
        IListCreateError,
        IReportResult,
        IListSchemaReportResult,
        IFieldUpdateReportResult } from './data-validation.model'

export interface IHealthReport {
    date: Date,
    permissions: IPermissionResult,
    listExists: Array<IReportResult>,
    listXmlData: Array<IListSchemaReportResult>,
    fieldsExists: Array<IReportResult>
    fieldsType: Array<IFieldUpdateReportResult>
    fieldsRequired: Array<IFieldUpdateReportResult>,
    errors: Array<any>
}

export interface IActionHealthReport {
    date: Date,
    permissions: IPermissionResult,
    createList: Array<IReportResult>,
    addFields: Array<IReportResult>,
    updateField: Array<IReportResult>,
    errors: Array<any>

}

export interface ISettingsReport {
    date: Date,
    permissions: IPermissionResult,
    listExists: Array<IReportResult>,
    listXmlData: Array<IListSchemaReportResult>,
    createList: Array<IReportResult>,
    fieldsExists: Array<IReportResult>
    fieldsType: Array<IFieldUpdateReportResult>
    fieldsRequired: Array<IFieldUpdateReportResult>,
    errors: Array<any>    
}

export interface IProvisionerReport {
    date: Date,
    permissions: IPermissionResult,
    listExists: Array<IReportResult>,
    createList: Array<IReportResult>,
    deleteList: Array<IReportResult>,
    errors: Array<any>
}

export interface IProcessDataReport {
    createResults: Array<any>,
    updateResults: Array<any>,
    deleteResults: Array<any>,
    inertResults: Array<any>
}