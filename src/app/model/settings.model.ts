import { IRegion } from './region.model'

export interface ISettings {
    year: number,
    region: IRegion
}

export interface ISettingsOptions {
    regionOptions: IRegion[],
    years: Array<number>
}