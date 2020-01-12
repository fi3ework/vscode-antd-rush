import { MarkdownString } from 'vscode'

import { __intl, DocLanguage, HANDLER_PREFIX, LabelType } from './buildResource/constant'

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

export const antdHeroErrorMsg = (message: string) => `[antd-hero] ${message}`

export const composeDocLink = (folder: string, lang: 'en' | 'zh') => {
  const suffix = lang === 'en' ? '' : '-cn'
  return `https://ant.design/components/${folder}${suffix}/`
}

export const transformConfigurationLanguage = (enumLabel: string | undefined): DocLanguage => {
  // default return EN
  return enumLabel === '中文' ? 'zh' : 'en'
}

/**
 * compose hover/completion item card message
 */
type TypeMdType = { value: string; display: 'inline' | 'blockCode' }

export const composeCardMessage = (
  items: {
    label: LabelType
    value: string
    display?: 'inline' | 'blockCode'
  }[],
  language: DocLanguage
) => {
  const md = new MarkdownString()

  items.forEach(item => {
    if (!item.value) return

    if (item.label === 'type') {
      const _type = { display: item.display ?? ('inline' as const), value: item.value }
      appendMarkdown(md, _type, language)
    } else {
      md.appendMarkdown(`**${__intl(item.label, language)}**: ${item.value}  \n`)
    }
  })

  md.isTrusted = true
  return md
}

const appendMarkdown = (mdToAppend: MarkdownString, type: TypeMdType, language: DocLanguage) => {
  const { value, display } = type

  if (display === 'blockCode') {
    mdToAppend.appendCodeblock(value)
    return
  }

  if (display === 'inline') {
    const typeStrings = value.split('\\|')
    mdToAppend.appendMarkdown(`**${__intl('type', language)}**: `)
    typeStrings.forEach((type, index) => {
      mdToAppend.appendMarkdown(`\`${type}\``)
      if (index !== typeStrings.length - 1) {
        mdToAppend.appendMarkdown(' | ')
      }
    })
    mdToAppend.appendMarkdown('  \n')
    return
  }
}

export const addHandlerPrefix = (handlerName: string): string => {
  // handler name can be 'onChange', 'OnChange'
  const camelizedHandlerName = handlerName.slice(0, 1).toUpperCase() + handlerName.slice(1)
  return `${HANDLER_PREFIX}${camelizedHandlerName}`
}
