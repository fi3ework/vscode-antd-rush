import { ensureDirSync, outputFile } from 'fs-extra'
import { Base64 } from 'js-base64'
import path from 'path'

import Octokit, { ReposGetContentsResponse } from '@octokit/rest'

import { ANTD_GITHUB } from './constant'
import { GITHUB_TOKEN } from './token'

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
})

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

async function genShaMap(tag: string) {
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
  const contentRes = await octokit.git.getBlob({
    owner: ANTD_GITHUB.OWNER_NAME,
    repo: ANTD_GITHUB.REPO_NAME,
    file_sha: fileSha,
  })
  ensureDirSync(path.resolve(__dirname, `../doc/${componentName}`))
  await outputFile(
    path.resolve(__dirname, `../doc/${componentName}/${fileName}`),
    Base64.decode(contentRes.data.content)
  )
  console.log(`✅ ${componentName}/${fileName} download succeed.`)
}

async function downloadByShaMap(shaMap: IShaMap) {
  Object.entries(shaMap).forEach(async ([componentName, entity]) => {
    downloadFile(componentName, ANTD_GITHUB.EN_MD_NAME, entity.enSha)
    downloadFile(componentName, ANTD_GITHUB.ZH_MD_NAME, entity.zhSha)
  })
}

async function init() {
  const shaMap = await genShaMap(ANTD_GITHUB.TARGET_TAG)
  downloadByShaMap(shaMap)
}

init()
