import {
  CancellationToken,
  commands,
  Hover,
  Location,
  MarkdownString,
  Position,
  TextDocument,
  workspace,
  Range,
  window,
} from 'vscode'
import { __intl, DocLanguage, LabelType } from './buildResource/constant'
import { antdComponentMap } from './buildResource/componentMap'
import { getContainerSymbolAtLocation } from './ast'

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
 * Normalize string for fuzzy match
 */
const normalizeName = (raw: string): string =>
  raw
    .replace(/\./g, '')
    .replace(/\-/g, '')
    .toLowerCase()

/**
 * Try match with component name and its folder to a component
 */
export const tryMatchComponentName = (symbolName: string, libName: string): string | null => {
  // 1. try exact match
  const exactKey = Object.keys(antdComponentMap).find(
    com => normalizeName(com) === normalizeName(symbolName)
  )
  if (exactKey) return exactKey

  // 2. try exact match folder name
  const libKey = Object.keys(antdComponentMap).find(
    com => normalizeName(com) === normalizeName(libName)
  )
  if (libKey) return libKey

  // 3. try fuzzy match
  const fuzzyKey = Object.keys(antdComponentMap).find(
    com => normalizeName(com) === normalizeName(libName + symbolName)
  )

  if (!fuzzyKey) return null
  return fuzzyKey
}

/**
 * Select a ref from a def that contains its range
 */
const selectRefInDefs = async (
  def: Location,
  refs: Location[] | undefined
): Promise<{ text: string; location: Location } | null> => {
  let doc = await workspace.openTextDocument(def.uri)
  const rangeInDef =
    refs?.find(ref => {
      return ref.uri.path === doc.uri.path && ref.range.contains(ref.range)
    }) || def

  const text = doc
    .lineAt(rangeInDef.range.start.line)
    .text.slice(rangeInDef.range.start.character, rangeInDef.range.end.character)

  return { text, location: rangeInDef }
}

/**
 * Find type definition in antd
 */
const findTypeDefinition = async (
  document: TextDocument,
  position: Position
): Promise<{ text: string; location: Location } | null> => {
  const typeDefinitions = await commands
    .executeCommand<Location[]>('vscode.executeTypeDefinitionProvider', document.uri, position)
    .then(refs => refs?.filter(ref => !!isInAntdModule(ref.uri.path)))

  const refs = await commands.executeCommand<Location[]>(
    'vscode.executeReferenceProvider',
    document.uri,
    position
  )

  if (!typeDefinitions?.length) return null

  const typeDefinition = typeDefinitions[0]
  return await selectRefInDefs(typeDefinition, refs)
}

/**
 * Get antd component data at position
 */
export const getDefinitionInAntdModule = async (document: TextDocument, position: Position) => {
  const [definitionUnderAntd, typeDefinition] = await Promise.all([
    await recursiveFindDefinition(document, position),
    await findTypeDefinition(document, position),
  ])

  // TODO: difference between definition and type definition
  if (!definitionUnderAntd) console.info('[antd-rush]: get more than one definition')

  if (typeDefinition) {
    return typeDefinition
  }

  if (definitionUnderAntd) {
    return definitionUnderAntd
  }

  return null
}

/**
 * Call "Go to definition" recursively
 */
const recursiveFindDefinition = async (
  document: TextDocument,
  position: Position
): Promise<{ text: string; location: Location } | null> => {
  const defPromise = commands.executeCommand<Location[]>(
    'vscode.executeDefinitionProvider',
    document.uri,
    position
  )

  const refPromise = commands.executeCommand<Location[]>(
    'vscode.executeReferenceProvider',
    document.uri,
    position
  )

  const [defs, refs] = await Promise.all([defPromise, refPromise])

  const inAntdCondition = (loc: Location) => {
    return !!isInAntdModule(loc.uri.path)
  }

  if (!defs) return null

  const antdDef = defs.filter(inAntdCondition)[0]
  const userlandLineDef = defs.filter(d => !matchNodeModules(d.uri.path))[0]
  const isWholeLineRange = await isRangeAsLines(antdDef)

  // import from antd
  if (antdDef) {
    // accurate definition range
    if (!isWholeLineRange) {
      const antdDefRangeLoc = refs?.find(ref => {
        return antdDef.range.contains(ref.range)
      })
      if (!antdDefRangeLoc) return null
      const _doc = await workspace.openTextDocument(antdDef.uri)
      const text = _doc
        .lineAt(antdDefRangeLoc.range.start.line)
        .text.slice(antdDefRangeLoc.range.start.character, antdDefRangeLoc.range.end.character)

      return { text, location: antdDefRangeLoc }
    } else {
      // inaccurate whole line definition range
      const interfaceName = await getContainerSymbolAtLocation(antdDef)
      if (!interfaceName) return null
      return { text: interfaceName, location: antdDef }
    }
  } else if (userlandLineDef) {
    // alias import
    let doc = await workspace.openTextDocument(userlandLineDef.uri)
    const userlandRangeDef = await selectRefInDefs(userlandLineDef, refs)
    if (!userlandRangeDef) return null

    const nextDef = await recursiveFindDefinition(doc, userlandRangeDef.location.range.end)
    return nextDef
  }
  return null
}

/**
 * Calc is a range contains line or lines
 */
const isRangeAsLines = async (loc: Location | undefined): Promise<boolean> => {
  if (!loc) return true
  const _doc = await workspace.openTextDocument(loc.uri)
  const startWord = _doc.getWordRangeAtPosition(loc.range.start)
  const endWord = _doc.getWordRangeAtPosition(loc.range.end)
  if (!startWord || !endWord) return true

  return !startWord.isEqual(endWord)
}
