import fs from 'fs'
import { remove } from 'fs-extra'
import logSymbols from 'log-symbols'
import path from 'path'
import { promisify } from 'util'

import { ResourceVersion } from '../types'
import { DefinitionBuilder } from './buildDocJson'
import { antdComponentMap, antdComponentMapV4 } from './componentMap'
import { ANTD_GITHUB, STORAGE } from './constant'
import { buildShaMap, downloadByShaMap } from './fetchDocs'

const pWriteFile = promisify(fs.writeFile)

const sourceVersion = {
  v3: ANTD_GITHUB.V3_SOURCE_TAG,
  v4: ANTD_GITHUB.V4_SOURCE_TAG,
} as const

const mapVersion = {
  v3: antdComponentMap,
  v4: antdComponentMapV4,
} as const

/**
 * Download Markdown files (optional) and parse them to JSON.
 *
 * @param {ResourceVersion} version antd major version
 * @param {boolean} download whether to download Markdown files
 */
async function buildVersionResource(version: ResourceVersion, download: boolean) {
  try {
    if (download) {
      const shaMap = await buildShaMap(sourceVersion[version])
      await Promise.all(downloadByShaMap(shaMap, version))
    }
    const builder = new DefinitionBuilder(version, mapVersion[version])
    const enEmit = builder.emitJson('en')
    const zhEmit = builder.emitJson('zh')
    const [
      { propDefJson: enPropDefJson, rawTableJson: enRawTableJson },
      { propDefJson: zhPropDefJson, rawTableJson: zhRawTableJson },
    ] = await Promise.all([enEmit, zhEmit])

    pWriteFile(
      path.resolve(__dirname, STORAGE.getDefinitionPath(version)),
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
      path.resolve(__dirname, STORAGE.getRawDefinitionPath(version)),
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
    console.error(logSymbols.error, e)
  }
}

/**
 * Clean downloaded Markdown files or JSON.
 *
 * @param {(('markdown' | 'json')[])} scope where to clean
 */
async function clean(scope: ('markdown' | 'json')[]) {
  if (scope.includes('markdown')) {
    await remove(STORAGE.resourcePath)
  }

  if (scope.includes('json')) {
    await remove(STORAGE.getDefinitionPath('v3'))
    await remove(STORAGE.getDefinitionPath('v4'))
    await remove(STORAGE.getRawDefinitionPath('v3'))
    await remove(STORAGE.getRawDefinitionPath('v4'))
  }
}

/**
 * Download docs and parse it to ast if argument set to true
 */
async function buildResource({ v3, v4, download }: Record<'v3' | 'v4' | 'download', boolean>) {
  clean(download ? ['markdown', 'json'] : ['json'])
  console.log(logSymbols.success, 'resource cleaned')

  if (v3) {
    console.log(logSymbols.info, 'start fetching v3')
    await buildVersionResource('v3', download)
  }

  if (v4) {
    console.log(logSymbols.info, 'start fetching v4')
    await buildVersionResource('v4', download)
  }
}

/**
 * 🚀
 */
buildResource({
  v3: true,
  v4: true,
  download: process.env.DOWNLOAD === 'true',
})
