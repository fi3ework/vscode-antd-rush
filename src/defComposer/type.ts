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
