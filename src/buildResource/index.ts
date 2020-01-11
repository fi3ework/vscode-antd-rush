import { remove, writeJson } from 'fs-extra'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

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
    const enEmit = builder.emitJson()
    builder.setDocLanguage('zh')
    const zhEmit = builder.emitJson()
    const [enJson, zhJson] = await Promise.all([enEmit, zhEmit])
    const pWriteFile = promisify(fs.writeFile)
    pWriteFile(
      path.resolve(__dirname, STORAGE.getDefinitionPath('zh')),
      JSON.stringify(zhJson, null, 2),
      {
        encoding: 'utf8',
      }
    )
    pWriteFile(
      path.resolve(__dirname, STORAGE.getDefinitionPath('en')),
      JSON.stringify(enJson, null, 2),
      'utf8'
    )
    pWriteFile(
      STORAGE.srcDefinitionPath,
      JSON.stringify(
        {
          zh: zhJson,
          en: enJson,
        },
        null,
        2
      ),
      'utf8'
    )
  } catch (e) {
    console.error(e)
  }
}

buildResource()
