import { IResourceModel } from './resource.model'
import { IMatModel } from './material.model'

export interface IDataModel {
    resourceData: Array<IResourceModel>,
    materialData: Array<IMatModel>
}