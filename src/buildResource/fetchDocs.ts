import { ensureDirSync, outputFile } from 'fs-extra'
import { Base64 } from 'js-base64'
import path from 'path'

import Octokit, { ReposGetContentsResponse } from '@octokit/rest'

import { ANTD_GITHUB, STORAGE } from './constant'
import { GITHUB_TOKEN } from './token'

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
})

/**
 * These folders are not exported component
 */
const IGNORED_COMPONENTS: string[] = [
  '__tests__',
  '_util',
  'locale',
  'style',
  'version',
  'col',
  'row',
]

type IShaMap = { [k: string]: { enSha: string; zhSha: string } }

export async function buildShaMap(tag: string) {
  const tagContentRes = await octokit.repos.getContents({
    owner: ANTD_GITHUB.OWNER_NAME,
    repo: ANTD_GITHUB.REPO_NAME,
    path: '/components',
    ref: tag,
  })

  const contentData: ReposGetContentsResponse = tagContentRes.data
  if (!Array.isArray(contentData)) return {}

  const componentPaths = contentData
    .filter(c => !IGNORED_COMPONENTS.includes(c.name))
    .map(c => c.name)

  const shaMap: IShaMap = {}
  const promises = componentPaths.map(async name => {
    const folderRes = await octokit.repos.getContents({
      owner: ANTD_GITHUB.OWNER_NAME,
      repo: ANTD_GITHUB.REPO_NAME,
      path: `/components/${name}`,
      ref: tag,
    })
    if (Array.isArray(folderRes.data)) {
      shaMap[name] = {
        enSha: folderRes.data.find(file => file.name === ANTD_GITHUB.EN_MD_NAME)!.sha,
        zhSha: folderRes.data.find(file => file.name === ANTD_GITHUB.ZH_MD_NAME)!.sha,
      }
    }
  })

  await Promise.all(promises)
  return shaMap
}

async function downloadFile(componentName: string, fileName: string, fileSha: string) {
  try {
    const contentRes = await octokit.git.getBlob({
      owner: ANTD_GITHUB.OWNER_NAME,
      repo: ANTD_GITHUB.REPO_NAME,
      file_sha: fileSha,
    })
    ensureDirSync(path.resolve(__dirname, `${STORAGE.mdPath}/${componentName}`))
    await outputFile(
      path.resolve(__dirname, `${STORAGE.mdPath}/${componentName}/${fileName}`),
      Base64.decode(contentRes.data.content)
    )
    console.log(`✅ ${componentName}/${fileName} download succeed.`)
  } catch (e) {
    console.error(`❌ failed to get ${componentName}/${fileName}. Error: ${e}`)
  }
}

export function downloadByShaMap(shaMap: IShaMap) {
  return Object.entries(shaMap).map(async ([componentName, entity]) => {
    await downloadFile(componentName, ANTD_GITHUB.EN_MD_NAME, entity.enSha)
    await downloadFile(componentName, ANTD_GITHUB.ZH_MD_NAME, entity.zhSha)
  })
}
