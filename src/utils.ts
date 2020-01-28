import {
  commands,
  Location,
  MarkdownString,
  Position,
  TextDocument,
  workspace,
  Range,
  Uri,
} from 'vscode'
import { __intl, DocLanguage, LabelType } from './buildResource/constant'
import { antdComponentMap } from './buildResource/componentMap'
import { positionToIPosition, ILocationLink, IRangeToRange } from './types'

/**
 * try to match  node_modules import path
 */
export const matchNodeModules = (path: string): string | null => {
  const regMatched = path.match(/(.*)\/node_modules\/(.*)/)
  if (!regMatched) return null
  const [, importPath] = regMatched
  return importPath
}

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
export const isInAntdModule = (path: string): boolean => {
  const regMatched = path.match(/(.*)\/node_modules\/antd\/lib\/(.*)/)
  return !!regMatched
}

/**
 * try to match ant-design node_modules import path
 */
export const isFromReactNodeModules = (path: string) => {
  // TODO: match exact declartion node
  const regMatched = path.match(/(.*)\/node_modules\/@types\/react\/(.*)/)
  return !!regMatched
}

export const antdRushErrorMsg = (message: string) => `[antd-rush] ${message}`

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
    mdToAppend.appendCodeblock(value, 'typescriptreact')
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

/**
 * normalize string for fuzzy match
 */
const normalizeName = (raw: string): string =>
  raw
    .replace(/\./g, '')
    .replace(/\-/g, '')
    .toLowerCase()

/**
 * try match with component name and its folder to a component
 */
export const tryMatchComponentName = (symbolName: string, libName: string): string | null => {
  // 1. try exact match
  const exactName = Object.keys(antdComponentMap).find(
    text => normalizeName(text) === normalizeName(symbolName)
  )
  if (exactName) return exactName

  // 2. try match folder + component name
  const nameWithFolder = Object.keys(antdComponentMap)
    .filter(text => text.split('.').pop() === symbolName)
    .filter(text =>
      text
        .split('.')
        .map(normalizeName)
        .includes(normalizeName(libName))
    )?.[0]

  if (nameWithFolder) return nameWithFolder

  // 3. try to use folder name
  const folderMatchName = Object.keys(antdComponentMap).find(
    text => normalizeName(text) === normalizeName(libName)
  )

  if (folderMatchName) return folderMatchName

  return null
}

/**
 * get antd component data at position
 */
export const getDefinitionInAntdModule = async (
  document: TextDocument,
  position: Position
): Promise<{ text: string; uri: Uri } | null> => {
  const [definitionUnderAntd, typeDefinition] = await Promise.all([
    await recursiveFindDefinition(document, position),
    await findTypeDefinition(document, position),
  ])

  // TODO: difference between definition and type definition
  if (!definitionUnderAntd) console.info('[antd-rush]: get more than one definition')

  if (definitionUnderAntd) {
    return definitionUnderAntd
  }

  if (typeDefinition) {
    return typeDefinition
  }

  return null
}

/**
 * find type definition in antd
 */
const findTypeDefinition = async (
  document: TextDocument,
  position: Position
): Promise<{ text: string; uri: Uri } | null> => {
  const typeDefinitions = await commands
    // NOTE: internal command
    // https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/gotoSymbol/goToSymbol.ts#L55-L59
    .executeCommand<ILocationLink[]>('_executeTypeDefinitionProvider', {
      resource: document.uri,
      position: positionToIPosition(position),
    })
    .then(refs => refs?.filter(ref => !!isInAntdModule(ref.uri.path)))

  if (!typeDefinitions?.length) return null

  const typeDefinition = typeDefinitions[0]
  const text = await extractTextOfRange(
    typeDefinition.uri,
    IRangeToRange(typeDefinition.targetSelectionRange || typeDefinition.range)
  )

  return {
    text,
    uri: typeDefinition.uri,
  }
}

/**
 * call "Go to definition" recursively
 */
const recursiveFindDefinition = async (
  document: TextDocument,
  position: Position
): Promise<{ text: string; uri: Uri } | null> => {
  // NOTE: internal command
  // https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/gotoSymbol/goToSymbol.ts#L37-L41
  const defs = await commands.executeCommand<ILocationLink[]>('_executeDefinitionProvider', {
    resource: document.uri,
    position: positionToIPosition(position),
  })

  if (!defs) return null

  const antdDef = defs.filter((def: ILocationLink) => !!isInAntdModule(def.uri.path))[0]
  const userlandLineDef = defs.filter(d => !matchNodeModules(d.uri.path))[0]

  if (antdDef) {
    // recursive end
    const text = await extractTextOfRange(
      antdDef.uri,
      IRangeToRange(antdDef.targetSelectionRange || antdDef.range)
    )
    if (!text) return null
    return { text, uri: antdDef.uri }
  } else if (userlandLineDef) {
    let doc = await workspace.openTextDocument(userlandLineDef.uri)

    const nextDef = await recursiveFindDefinition(
      doc,
      IRangeToRange(userlandLineDef.targetSelectionRange!).end
    )
    return nextDef
  }
  return null
}

/**
 * extract string from of range
 */
const extractTextOfRange = async (uri: Uri, range: Range) => {
  const document = await workspace.openTextDocument(uri)
  return document.lineAt(range.start.line).text.slice(range.start.character, range.end.character)
}
