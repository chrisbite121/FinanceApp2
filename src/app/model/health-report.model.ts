import { IFieldUpdate,
        IFieldThatDoesntExist,
        IListExists,
        IPermissionResult,
        ISchemaListResult,
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
        IListCreateError } from './data-validation.model'

export interface IHealthReport {
    date: Date,
    permissionsResults: IPermissionResult,
    listExistsResults: Array<IListExists>,
    listsFailedToCheck: Array<string>,
    listXmlData: Array<ISchemaListResult>,
    listFailedGetXml: Array<string>,
    missingLists: Array<string>
    missingFields: Array<IFieldThatDoesntExist>
    fieldsWrongtype: Array<IFieldUpdate>
    fieldsRequired: Array<IFieldUpdate>
}

export interface IActionHealthReport {
    date: Date,
    permissionsResults: IPermissionResult,
    createListSuccess: Array<ICreateListSuccess>,
    createListsFailed: Array<ICreateListFailed>,
    createListError: Array<ICreateListError>,
    createFieldsSuccess: Array<ICreateFieldsSuccess>,
    createFieldsFailed: Array<ICreateFieldsFailed>,
    createFieldsError: Array<ICreateFieldsError>,
    updateFieldsSuccess: Array<IUpdateFieldsSuccess>,
    updateFieldsFailed: Array<IUpdateFieldsFailed>,
    updateFieldsError: Array<IUpdateFieldsError>
}

export interface ISettingsReport {
    date: Date,
    permissionsResults: IPermissionResult,
    listExistsResults: Array<IListExists>,
    listsFailedToCheck: Array<string>,
    listXmlData: Array<ISchemaListResult>,
    listFailedGetXml: Array<string>,
    missingFields: Array<IFieldThatDoesntExist>,
    fieldsWrongType: Array<IFieldUpdate>,
    fieldsRequired: Array<IFieldUpdate>
}

export interface IProvisionerReport {
    date: Date,
    permissionsResults: IPermissionResult,
    listExistsSuccess: Array<IListExistsSuccess>,
    listExistsFailed: Array<IListExistsFailed>,
    listExistsError: Array<IListExistsError>,
    listDeleteSuccess: Array<IListDeleteSuccess>,
    listDeleteFailed: Array<IListDeleteFailed>,
    listDeleteError: Array<IListDeleteError>,
    listCreateSuccess: Array<IListCreateSuccess>,
    listCreateFailed: Array<IListCreateFailed>,
    listCreateError: Array<IListCreateError>
}

export interface IProcessDataReport {
    createResults: Array<any>,
    updateResults: Array<any>,
    deleteResults: Array<any>,
    inertResults: Array<any>
}