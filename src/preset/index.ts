import Octokit, { ReposGetContentsResponse } from '@octokit/rest'

import { ANTD_GITHUB } from './constant'
import { GITHUB_TOKEN } from './token'

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
})

const IGNORED_COMPONENTS: string[] = ['__tests__', '_util']

async function getContents(tag: string) {
  const tagContentRes = await octokit.repos.getContents({
    owner: ANTD_GITHUB.OWNER_NAME,
    repo: ANTD_GITHUB.REPO_NAME,
    path: '/components',
    ref: tag,
  })

  const contentData: ReposGetContentsResponse = tagContentRes.data
  if (!Array.isArray(contentData)) return

  const componentPaths = contentData
    .filter(c => !IGNORED_COMPONENTS.includes(c.name))
    .map(c => c.name)

  const shaMap: { [k: string]: { enSha: string; zhSha: string } } = {}
  const ps = componentPaths.slice(0, 3).map(name => {
    return octokit.repos
      .getContents({
        owner: ANTD_GITHUB.OWNER_NAME,
        repo: ANTD_GITHUB.REPO_NAME,
        path: `/components/${name}`,
        ref: tag,
      })
      .then(res => {
        if (Array.isArray(res.data)) {
          shaMap[name] = {
            enSha: res.data.find(file => file.name === ANTD_GITHUB.EN_MD_NAME)!.sha,
            zhSha: res.data.find(file => file.name === ANTD_GITHUB.ZH_MD_NAME)!.sha,
          }
        }
      })
  })

  Promise.all(ps).then(() => {
    console.log(shaMap)
  })
}

// async function get

async function init() {
  await getContents(ANTD_GITHUB.TARGET_TAG)
}

init()
