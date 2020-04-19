import { ensureDirSync, outputFile } from 'fs-extra'
import { Base64 } from 'js-base64'
import logSymbols from 'log-symbols'

import { Octokit } from '@octokit/rest'

import { ResourceVersion } from '../types'
import { ANTD_GITHUB, STORAGE } from './constant'
/**
 * Token is not tracked by Git.
 * If you want to develop this extension.
 * Add new file `token.ts` beside and export `GITHUB_TOKEN` variable of your own GitHub token
 * eg: export const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN'
 */
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
  'locale-provider',
]

/**
 * @property {string} [k] component name
 */
type IShaMap = { [k: string]: { enSha: string; zhSha: string } }

/**
 * Get each component's zh/en Markdown file sha of specific tag
 *
 * @export
 * @param {string} tag antd version tag
 * @returns
 */
export async function buildShaMap(tag: string): Promise<IShaMap> {
  const tagContentRes = await octokit.repos.getContents({
    owner: ANTD_GITHUB.OWNER_NAME,
    repo: ANTD_GITHUB.REPO_NAME,
    path: '/components',
    ref: tag,
  })

  const contentData = tagContentRes.data
  if (!Array.isArray(contentData)) throw new Error('failed to get contents in `/components`')

  const componentPaths = contentData
    .filter((c) => !IGNORED_COMPONENTS.includes(c.name))
    .map((c) => c.name)

  const shaMap: IShaMap = {}
  const promises = componentPaths.map(async (name) => {
    const folderRes = await octokit.repos.getContents({
      owner: ANTD_GITHUB.OWNER_NAME,
      repo: ANTD_GITHUB.REPO_NAME,
      path: `/components/${name}`,
      ref: tag,
    })

    if (Array.isArray(folderRes.data)) {
      shaMap[name] = {
        enSha: folderRes.data.find((file) => file.name === ANTD_GITHUB.EN_MD_NAME)!.sha,
        zhSha: folderRes.data.find((file) => file.name === ANTD_GITHUB.ZH_MD_NAME)!.sha,
      }
    }
  })

  await Promise.all(promises)
  return shaMap
}

/**
 * Download and save Markdown files
 *
 * @param componentName component name, will be used to compose fileName
 * @param fileName where to save
 * @param fileSha file sha
 */
async function downloadMdFiles(args: {
  componentName: string
  fileName: string
  fileSha: string
  version: ResourceVersion
}) {
  const { componentName, fileName, fileSha, version } = args
  try {
    const contentRes = await octokit.git.getBlob({
      owner: ANTD_GITHUB.OWNER_NAME,
      repo: ANTD_GITHUB.REPO_NAME,
      file_sha: fileSha,
    })
    ensureDirSync(STORAGE.getMarkdownPath(componentName, '', version))
    await outputFile(
      STORAGE.getMarkdownPath(componentName, fileName, version),
      Base64.decode(contentRes.data.content)
    )
    console.log(logSymbols.success, `${componentName}/${fileName} download succeed.`)
  } catch (e) {
    console.error(logSymbols.error, `failed to get ${componentName}/${fileName}. Error: ${e}`)
  }
}

/**
 * Download Markdown files by file sha
 *
 * @param shaMap An object maps component name and its Markdown files sha
 */
export function downloadByShaMap(shaMap: IShaMap, version: ResourceVersion) {
  return Object.entries(shaMap).map(async ([componentName, entity]) => {
    await downloadMdFiles({
      componentName,
      fileName: ANTD_GITHUB.EN_MD_NAME,
      fileSha: entity.enSha,
      version: version,
    })

    await downloadMdFiles({
      componentName,
      fileName: ANTD_GITHUB.ZH_MD_NAME,
      fileSha: entity.zhSha,
      version: version,
    })
  })
}
