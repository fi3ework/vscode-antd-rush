import {
  CancellationToken,
  commands,
  Hover,
  Location,
  DefinitionLink,
  MarkdownString,
  Position,
  TextDocument,
  workspace,
  Range,
  window,
  Uri,
} from 'vscode'
import { __intl, DocLanguage, LabelType } from './buildResource/constant'
import { antdComponentMap } from './buildResource/componentMap'
import { getContainerSymbolAtLocation } from './ast'
import { positionToModePosition, ILocationLink, modeRangeToRange } from './types'

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
 * Get antd component data at position
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

const extractTextOfRange = async (uri: Uri, range: Range) => {
  const document = await workspace.openTextDocument(uri)
  return document.lineAt(range.start.line).text.slice(range.start.character, range.end.character)
}

const inAntdCondition = (def: ILocationLink) => {
  return !!isInAntdModule(def.uri.path)
}

/**
 * Find type definition in antd
 */
const findTypeDefinition = async (
  document: TextDocument,
  position: Position
): Promise<{ text: string; uri: Uri } | null> => {
  const typeDefinitions = await commands
    .executeCommand<ILocationLink[]>('_executeTypeDefinitionProvider', {
      resource: document.uri,
      position: positionToModePosition(position),
    })
    .then(refs => refs?.filter(ref => !!isInAntdModule(ref.uri.path)))

  // const refs = await commands.executeCommand<Location[]>(
  //   'vscode.executeReferenceProvider',
  //   document.uri,
  //   position
  // )

  if (!typeDefinitions?.length) return null

  const typeDefinition = typeDefinitions[0]
  const text = await extractTextOfRange(
    typeDefinition.uri,
    modeRangeToRange(typeDefinition.targetSelectionRange || typeDefinition.range)
  )

  return {
    text,
    uri: typeDefinition.uri,
  }
}

/**
 * Call "Go to definition" recursively
 */
const recursiveFindDefinition = async (
  document: TextDocument,
  position: Position
): Promise<{ text: string; uri: Uri } | null> => {
  const defs = await commands.executeCommand<ILocationLink[]>('_executeDefinitionProvider', {
    resource: document.uri,
    position: positionToModePosition(position),
  })

  // const refPromise = commands.executeCommand<Location[]>(
  //   'vscode.executeReferenceProvider',
  //   document.uri,
  //   position
  // )

  // let defs, refs
  // try {
  // ;[defs, refs] = await Promise.all([defPromise, refPromise])
  // const defs = await defPromise
  // } catch (e) {
  //   console.log(e)
  // }

  if (!defs) return null

  const antdDef = defs.filter(inAntdCondition)[0]
  const userlandLineDef = defs.filter(d => !matchNodeModules(d.uri.path))[0]
  // const isWholeLineRange = await isRangeAsLines(antdDef)

  // import from antd
  if (antdDef) {
    // accurate definition range
    const text = await extractTextOfRange(
      antdDef.uri,
      modeRangeToRange(antdDef.targetSelectionRange || antdDef.range)
    )
    if (!text) return null
    // if (!isWholeLineRange) {
    //   const antdDefRangeLoc = refs?.find(ref => {
    //     return antdDef.range.contains(ref.range)
    //   })
    //   if (!antdDefRangeLoc) return null
    //   const _doc = await workspace.openTextDocument(antdDef.uri)
    //   const text = _doc
    //     .lineAt(antdDefRangeLoc.range.start.line)
    //     .text.slice(antdDefRangeLoc.range.start.character, antdDefRangeLoc.range.end.character)

    //   return { text, location: antdDefRangeLoc }
    // } else {
    //   // inaccurate whole line definition range
    //   const interfaceName = await getContainerSymbolAtLocation(antdDef)
    //   if (!interfaceName) return null
    //   return { text: interfaceName, location: antdDef }
    // }
    return { text, uri: antdDef.uri }
  } else if (userlandLineDef) {
    // alias import
    let doc = await workspace.openTextDocument(userlandLineDef.uri)
    // const userlandRangeDef = await selectRefInDefs(userlandLineDef, refs)
    // if (!userlandRangeDef) return null

    const nextDef = await recursiveFindDefinition(
      doc,
      modeRangeToRange(userlandLineDef.targetSelectionRange!).end
    )
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
