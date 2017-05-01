import { Injectable } from '@angular/core'
import { IFieldUpdate,
        IFieldThatDoesntExist } from '../model/data-validation.model'

import {    IHealthReport,
            IActionHealthReport,
            ISettingsReport,
            IProvisionerReport } from '../model/health-report.model'

@Injectable()
export class HealthReportService {
    private _healthReport: IHealthReport
    private _actionHealthReport: IActionHealthReport
    private _settingsReport: ISettingsReport
    private _provisionerReport: IProvisionerReport
    private _getDataReport: Array<any>
    private _submitDataReport: Array<any>

    get healthReport(){
        return this._healthReport
    }

    set healthReport(data) {
        this._healthReport = data;
    }

    get actionHealthReport() {
        return this._actionHealthReport
    }

    set actionHealthReport(data) {
        this._actionHealthReport = data
    }

    get settingsReport() {
        return this._settingsReport
    }

    set settingsReport(data) {
        this._settingsReport = data
    }

    get provisionerReport(){
        return this._provisionerReport
    }

    set provisionerReport(data) {
        this._provisionerReport = data;
    }

    get getDataReport() {
        return this._getDataReport
    }

    set getDataReport(data) {
        this._getDataReport = data;
    }

    get submitDataReport(){
        return this._submitDataReport
    }

    set submitDataReport(data) {
        this._submitDataReport = data;
    }

}