import { remove } from 'fs-extra'
import path from 'path'

import { DefinitionBuilder } from './buildDocJson'
import { antdComponentMap } from './componentMap'
import { ANTD_GITHUB, STORAGE } from './constant'
import { buildShaMap, downloadByShaMap } from './fetchDocs'

async function buildResource() {
  try {
    await remove(path.resolve(__dirname, STORAGE.distPath))
    console.log('🌝 resource cleaned')
    const shaMap = await buildShaMap(ANTD_GITHUB.TARGET_TAG)
    await Promise.all(downloadByShaMap(shaMap))
    const builder = new DefinitionBuilder(antdComponentMap)
    builder.setDocLanguage('en')
    builder.emitJson()
    builder.setDocLanguage('zh')
    builder.emitJson()
  } catch (e) {
    console.error(e)
  }
}

buildResource()
