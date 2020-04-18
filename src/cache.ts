import { VersionJson } from './build-resource/type'
import _antdDocJsonV3 from './resource/v3/definition.json'
import _rawTableJsonV3 from './resource/v3/raw-table.json'
import _antdDocJsonV4 from './resource/v4/definition.json'
import _rawTableJsonV4 from './resource/v4/raw-table.json'

/**
 * It will be read in memory as cache
 */
export const versionsJson: VersionJson = {
  v3: {
    propsJson: _antdDocJsonV3,
    componentJson: _rawTableJsonV3,
  },
  v4: {
    propsJson: _antdDocJsonV4,
    componentJson: _rawTableJsonV4,
  },
}
