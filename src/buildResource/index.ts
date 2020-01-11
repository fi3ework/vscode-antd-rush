import { remove } from 'fs-extra'

import { buildComponentsJson } from './buildDocJson'
import { ANTD_GITHUB, STORAGE } from './constant'
import { buildShaMap, downloadByShaMap } from './fetchDocs'
import path from 'path'

async function buildResource() {
  try {
    await remove(path.resolve(__dirname, STORAGE.distPath))
    console.log('🌝 resource cleaned')
    const shaMap = await buildShaMap(ANTD_GITHUB.TARGET_TAG)
    await Promise.all(downloadByShaMap(shaMap))
    buildComponentsJson()
  } catch (e) {
    console.error(e)
  }
}

buildResource()
