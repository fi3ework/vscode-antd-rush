export interface ComponentMapping {
  [k: string]: ComponentDocLocation
}

export interface ComponentDocLocation {
  docAlias?: string // by default use lower case component name
  anchorBeforeProps: string | string[]
  methods: string[]
}

import { antdComponentMapV3 } from './versions/v3'
export { antdComponentMapV3 as antdComponentMap }
export { antdComponentMapV4 } from './versions/v4'
