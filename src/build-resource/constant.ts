import path from 'path'
import { ResourceVersion, DocLanguage } from '../types'

export const ANTD_GITHUB = {
  OWNER_NAME: 'ant-design',
  REPO_NAME: 'ant-design',
  V3_SOURCE_TAG: '3.26.20',
  V4_SOURCE_TAG: '4.16.1',
  EN_MD_NAME: 'index.en-US.md',
  ZH_MD_NAME: 'index.zh-CN.md',
} as const

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
  /**
   * Path of downloaded .md files and composed definition JSON
   */
  resourcePath: path.resolve(__dirname, '../resource'),
  /**
   * Decorate path with version prefix
   */
  versioned(raw: string, version: ResourceVersion) {
    return `${raw}${version.toUpperCase()}`
  },
  /**
   * Path of downloaded .md files
   */
  getMarkdownPath(componentName: string, fileName: string, version: ResourceVersion) {
    return path.join(STORAGE.resourcePath, `/${version}/md/${componentName}/${fileName}`)
  },
  /**
   * Path of dist file -- definition-{lang}.json, will be used for hover on props
   */
  getDefinitionPath(version: ResourceVersion) {
    return path.join(STORAGE.resourcePath, `/${version}/definition.json`)
  },
  /**
   * Path of dist file -- raw-table-{lang}.json, will be used for hover on component
   */
  getRawDefinitionPath(version: ResourceVersion) {
    return path.join(STORAGE.resourcePath, `/${version}/raw-table.json`)
  },
}
