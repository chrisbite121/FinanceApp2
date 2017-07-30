import { ICommandButtonEntry, ICommandButtonLabel } from '../../model/CommandButton.model'

export const CommandButtonLabel:ICommandButtonLabel = {
    label: 'additional',
    iconType: 'Settings'
}

export const CommandButtonValues: Array<ICommandButtonEntry> = [
    {
        id: 'lengthLogs',
        label: 'No of Cached Logs',
        iconType: 'Sections'
    },
    {
        id: 'refreshLogs',
        label: 'Refresh',
        iconType: 'RecurringEvent'
    },
    {
        id: 'saveLogs',
        label: 'Save',
        iconType: 'Save'
    },
    {
        id: 'getLogs',
        label: 'Load Logs',
        iconType: 'Download'
    },
    {
        id: 'generateLog',
        label: 'generate test log',
        iconType: 'Album'
    },
    {
        id: 'generateLogVerbose',
        label: 'generate test verbose log',
        iconType: 'Album'
    },
    {
        id: 'reverseLogs',
        label: 'Reverse Logs',
        iconType: 'Sort'
    } 
]