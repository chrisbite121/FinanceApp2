export interface IUiState {
    redo: boolean,
    undo: boolean,
    autoSave: boolean,
    highlightCss: any,
    debugMode: boolean,
    appProcessing: boolean, //used to show spinning wheel whilst saving/updating
    permissionStatusChecked: Boolean,
    manageWeb: boolean,
    manageList: boolean,
    viewList: Boolean,
    addListItems: Boolean,
    message: string,
    state: string

}