import { URI } from 'vscode-uri'
import { DocLanguage } from './buildResource/constant'

/**
 * try to match ant-design node_modules import path
 */
export const matchAntdModule = (path: string) => {
  const regMatched = path.match(/(.*)\/node_modules\/antd\/lib\/(.*)\/(.*)/)
  if (!regMatched) return null
  const [, , componentFolder, filePath] = regMatched
  return {
    componentFolder,
    filePath,
    fullFilePath: componentFolder + '/' + filePath,
  }
}

/**
 * try to match ant-design node_modules import path
 */
export const isFromReactNodeModules = (path: string) => {
  // TODO: match exact declartion node
  const regMatched = path.match(/(.*)\/node_modules\/@types\/react\/(.*)/)
  return !!regMatched
}

// TODO: deprecate, TS can't recognize throw in function
// provide an error message template is just enough
export const throwAntdHeroError = (message: string) => {
  throw Error(`[antd-hero] ${message}`)
}

export const antdHeroErrorMsg = (message: string) => `[antd-hero] ${message}`

export const composeDocLink = (folder: string, lang: 'en' | 'zh') => {
  const suffix = lang === 'en' ? '' : '-cn'
  return `https://ant.design/components/${folder}${suffix}/`
}

export const transformConfigurationLanguage = (enumLabel: string | undefined): DocLanguage => {
  // default return EN
  return enumLabel === '中文' ? 'zh' : 'en'
}
