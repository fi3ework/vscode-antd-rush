import { DocLanguage, ResourceVersion } from '../types'

export interface Prop {
  property: string
  description: string
  type: string
  default: string
  version: string
}

export interface Props {
  [k: string]: Prop
}

export interface ComponentsDoc {
  [k: string]: Props
}

export interface ComponentsRawDoc {
  [k: string]: string[]
}

export type PropsJson = {
  [k in DocLanguage]: ComponentsDoc
}

export type ComponentsJson = {
  [k in DocLanguage]: ComponentsRawDoc
}

export type VersionJson = {
  [k in ResourceVersion]: {
    propsJson: PropsJson
    componentJson: ComponentsJson
  }
}
