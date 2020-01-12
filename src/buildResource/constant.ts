import path from 'path'

export type DocLanguage = 'en' | 'zh'

export const ANTD_GITHUB = {
  OWNER_NAME: 'ant-design',
  REPO_NAME: 'ant-design',
  TARGET_TAG: '3.26.4',
  EN_MD_NAME: 'index.en-US.md',
  ZH_MD_NAME: 'index.zh-CN.md',
}

export const HANDLER_PREFIX = 'handle'

export const INTL_TEXT: {
  [k in 'description' | 'type' | 'default' | 'version' | 'componentHint']: {
    zh: string
    en: string
  }
} = {
  description: {
    zh: '描述',
    en: 'Description',
  },
  type: {
    zh: '类型',
    en: 'Type',
  },
  default: {
    zh: '默认值',
    en: 'Default',
  },
  version: {
    zh: '版本',
    en: 'Version',
  },
  componentHint: {
    zh: '文档',
    en: 'documentation',
  },
} as const

export type LabelType = keyof typeof INTL_TEXT

export const __intl = (label: LabelType, language: DocLanguage) => {
  return INTL_TEXT[label][language]
}

export const STORAGE = {
  distPath: '../../doc-resource',
  get mdPath() {
    return STORAGE.distPath + '/md'
  },
  get srcDefinitionPath() {
    return path.resolve(__dirname, `../definition.json`)
  },
  get srcRawPath() {
    return path.resolve(__dirname, `../raw-table.json`)
  },
  getDefinitionPath(language: DocLanguage) {
    return path.resolve(__dirname, `${STORAGE.distPath}/definition-${language}.json`)
  },
  getRawDefinitionPath(language: DocLanguage) {
    return path.resolve(__dirname, `${STORAGE.distPath}/raw-table-${language}.json`)
  },
}
