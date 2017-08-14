export interface ISettings {
    itemId: string,
    year: number,
    years: Array<number>,
    sharePointMode: boolean,
    autoSave: boolean,
    workingHoursInDay: number,
    tsWeighting: number,
    listAutoCheck: boolean,
    persist: boolean,
    verbose: boolean,
    headerColour: string,
    highlightColour: string,
    highlightFontColour: string,
    headerFontColour: string
}

export interface IAppSettings {
    manageWeb: boolean,
    manageList: boolean,
    viewList: boolean,
    addListItems: boolean,
    useSettingsList: boolean,
    useLoggingList: boolean,
    useWorkDaysList: boolean,
    logginListReady: boolean,
    initAppComplete: boolean,
    appUrl: string,
    hostUrl: string
}

export interface ISettingsOptions {
    years: Array<number>
}