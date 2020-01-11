import path from 'path'
type DocLanguage = 'en' | 'zh'

export const ANTD_GITHUB = {
  OWNER_NAME: 'ant-design',
  REPO_NAME: 'ant-design',
  TARGET_TAG: '3.26.4',
  EN_MD_NAME: 'index.en-US.md',
  ZH_MD_NAME: 'index.zh-CN.md',
}

export const STORAGE = {
  distPath: '../../doc-resource',
  get mdPath() {
    return STORAGE.distPath + '/md'
  },
  getDefinitionPath(language: DocLanguage) {
    return path.resolve(__dirname, `${STORAGE.distPath}/definition-${language}.json`)
  },
  getSrcDefinitionPath(language: DocLanguage) {
    return path.resolve(__dirname, `../definition-${language}.json`)
  },
}
