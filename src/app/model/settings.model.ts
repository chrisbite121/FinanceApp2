import { IRegion } from './region.model'

export interface ISettings {
    itemId: string,
    year: number,
    years: Array<number>,
    region: IRegion,
    regionOptions: IRegion[],
    sharePointMode: Boolean,
    autoSave: Boolean,
    workingHoursInDay: number,
    tsWeighting: number,
    listAutoCheck: Boolean,
    persist: boolean,
    verbose: boolean
}

export interface IAppSettings {
    manageWeb: boolean,
    manageList: boolean,
    viewList: boolean,
    addListItems: boolean,
    useSettingsList: boolean,
    useLoggingList: boolean,
    logginListReady: boolean
}



export interface ISettingsOptions {
    regionOptions: IRegion[],
    years: Array<number>
}