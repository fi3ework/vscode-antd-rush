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
  get definitionPath() {
    return STORAGE.distPath + '/definition.json'
  },
}
