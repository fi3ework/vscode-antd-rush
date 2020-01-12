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
    const [
      { propDefJson: enPropDefJson, rawTableJson: enRawTableJson },
      { propDefJson: zhPropDefJson, rawTableJson: zhRawTableJson },
    ] = await Promise.all([enEmit, zhEmit])
    const pWriteFile = promisify(fs.writeFile)
    pWriteFile(
      path.resolve(__dirname, STORAGE.getDefinitionPath('zh')),
      JSON.stringify(zhPropDefJson, null, 2),
      'utf8'
    )
    pWriteFile(
      path.resolve(__dirname, STORAGE.getDefinitionPath('en')),
      JSON.stringify(enPropDefJson, null, 2),
      'utf8'
    )
    pWriteFile(
      path.resolve(__dirname, STORAGE.getRawDefinitionPath('zh')),
      JSON.stringify(zhRawTableJson, null, 2),
      'utf8'
    )
    pWriteFile(
      path.resolve(__dirname, STORAGE.getRawDefinitionPath('en')),
      JSON.stringify(enRawTableJson, null, 2),
      'utf8'
    )
    pWriteFile(
      STORAGE.srcDefinitionPath,
      JSON.stringify(
        {
          zh: zhPropDefJson,
          en: enPropDefJson,
        },
        null,
        2
      ),
      'utf8'
    )
    pWriteFile(
      STORAGE.srcRawPath,
      JSON.stringify(
        {
          zh: zhRawTableJson,
          en: enRawTableJson,
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
