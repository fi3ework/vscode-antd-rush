import { commands, MarkdownString, Position, Range, TextDocument, Uri, workspace } from 'vscode'

import { antdComponentMap } from '../build-resource/componentMap'
import { __intl, LabelType } from '../build-resource/constant'
import { DocLanguage, ILocationLink, positionToIPosition, ResourceVersion, IRange } from '../types'

/**
 * Try to match node_modules import path.
 *
 * @export
 * @param {string} path absolute path of file
 * @returns {(string | null)} matched module name or null
 */
export function matchNodeModules(path: string): string | null {
  const regMatched = path.match(/(.*)\/node_modules\/(.*)/)
  if (!regMatched) return null
  const [, importPath] = regMatched
  return importPath
}

/**
 * Try to match ant-design node_modules import path.
 */
export function matchAntdModule(path: string) {
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
 * Is path from antd module?
 */
export function isInAntdModule(path: string): boolean {
  const regMatched = path.match(/(.*)\/node_modules\/antd\/lib\/(.*)/)
  return !!regMatched
}

/**
 * Is path from @types/react module?
 */
export function isInReactModule(path: string) {
  const regMatched = path.match(/(.*)\/node_modules\/@types\/react\/(.*)/)
  return !!regMatched
}

/**
 * Format error message.
 */
export function antdRushErrorMsg(message: string) {
  return `[antd-rush] ${message}`
}

/**
 * Composet ant-design documentation link.
 */
export function composeDocLink(folder: string, lang: 'en' | 'zh') {
  const suffix = lang === 'en' ? '' : '-cn'
  return `https://ant.design/components/${folder}${suffix}/`
}

/**
 * Get language from workspace configuration
 */
export function getLanguageConfiguration(enumLabel: string | undefined): DocLanguage {
  // default return Chinese
  return enumLabel === 'English' ? 'en' : 'zh'
}

/**
 * Get antd major version from workspace configuration.
 */
export function toAntdMajorVersion(enumLabel: string | undefined): ResourceVersion {
  // default return Chinese
  return enumLabel === '^4' ? 'v4' : 'v3'
}

/**
 * Compose hover/completion item card message.
 */
interface TypeMdType {
  value: string
  display: 'inline' | 'blockCode'
}

export function composeCardMessage(
  items: {
    label: LabelType
    value: string
    display?: 'inline' | 'blockCode'
  }[],
  language: DocLanguage
) {
  const md = new MarkdownString()

  items.forEach((item) => {
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

function appendMarkdown(mdToAppend: MarkdownString, type: TypeMdType, language: DocLanguage) {
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
 * Normalize string for fuzzy match.
 */
function normalizeName(raw: string): string {
  return raw.replace(/\./g, '').replace(/\-/g, '').toLowerCase()
}

/**
 * Try match with component name and its folder to a component.
 */
export function tryMatchComponentName(symbolName: string, libName: string): string | null {
  // 1. try exact match
  const exactName = Object.keys(antdComponentMap).find(
    (text) => normalizeName(text) === normalizeName(symbolName)
  )
  if (exactName) return exactName

  // 2. try match folder + component name
  const nameWithFolder = Object.keys(antdComponentMap)
    .filter((text) => text.split('.').pop() === symbolName)
    .filter((text) => text.split('.').map(normalizeName).includes(normalizeName(libName)))?.[0]

  if (nameWithFolder) return nameWithFolder

  // 3. try to use folder name
  const folderMatchName = Object.keys(antdComponentMap).find(
    (text) => normalizeName(text) === normalizeName(libName)
  )

  if (folderMatchName) return folderMatchName

  return null
}

/**
 * Get antd component data at position.
 */
export async function getDefinitionInAntdModule(
  document: TextDocument,
  position: Position
): Promise<{ text: string; uri: Uri } | null> {
  const [definitionInAntd, typeDefinitionInAntd] = await Promise.all([
    await recursiveFindDefinition(document, position),
    await findTypeDefinition(document, position),
  ])

  // TODO: difference between definition and type definition
  if (!definitionInAntd) console.info('[antd-rush]: get more than one definition')

  if (definitionInAntd) {
    return definitionInAntd
  }

  if (typeDefinitionInAntd) {
    return typeDefinitionInAntd
  }

  return null
}

/**
 * Transfrom IRange to Range
 *
 * @export
 * @param {IRange} range Used by VSCode internal API
 * @returns {Range} Used by documented extension API
 */
export function IRangeToRange(range: IRange): Range {
  return new Range(
    range.startLineNumber - 1,
    range.startColumn - 1,
    range.endLineNumber - 1,
    range.endColumn - 1
  )
}

/**
 * NOTE: This function uses VSCode internal command.
 * VSCode has changed its internal commands invoke method recently.
 * Try both old/new method for compat.
 *
 * older API:
 * https://github.com/microsoft/vscode/blob/469a9d1cee5e3b351c28b609777d4de76ddd49da/src/vs/workbench/api/common/extHostApiCommands.ts#L312-L319
 *
 * newer API:
 * https://github.com/microsoft/vscode/blob/fd487a7ed6388a465b72cb9091b1a470536b68ed/src/vs/workbench/api/common/extHostApiCommands.ts#L143-L147
 *
 * API changed by this commit: https://github.com/microsoft/vscode/commit/783970456be0c7634348e01ee61b2abb9a6ef3b1
 */
async function adaptVscodeInternalApi<T>(cmd: string, entries: [string, any][]): Promise<T | null> {
  const [oldApiRes, newApiRes] = await Promise.all([
    // newer API
    commands.executeCommand<T>(cmd, Object.fromEntries(entries)).then(
      (res) => res,
      (e) => null
    ),

    // older API
    commands.executeCommand<T>(cmd, ...entries.map(([k, v]) => v)).then(
      (res) => res,
      (e) => null
    ),
  ])

  return oldApiRes ?? newApiRes ?? null
}

/**
 * Find type definition in antd.
 */
async function findTypeDefinition(
  document: TextDocument,
  position: Position
): Promise<{ text: string; uri: Uri } | null> {
  const typeDefinitions = await adaptVscodeInternalApi<ILocationLink[]>(
    '_executeTypeDefinitionProvider',
    [
      ['resource', document.uri],
      ['position', positionToIPosition(position)],
    ]
  ).then((refs) => refs?.filter((ref) => !!isInAntdModule(ref.uri.path)))

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
 * Call "Go to definition" recursively.
 */
async function recursiveFindDefinition(
  document: TextDocument,
  position: Position,
  trace: Position[] = []
): Promise<{ text: string; uri: Uri } | null> {
  if (trace.some((t) => t.isEqual(position))) return null
  trace.push(position)

  const defs = await adaptVscodeInternalApi<ILocationLink[]>('_executeDefinitionProvider', [
    ['resource', document.uri],
    ['position', positionToIPosition(position)],
  ])

  if (!defs) return null

  const antdDef = defs.filter((def: ILocationLink) => !!isInAntdModule(def.uri.path))[0]
  const userlandLineDef = defs.filter((d) => !matchNodeModules(d.uri.path))[0]

  if (antdDef) {
    // endding of recursive
    const text = await extractTextOfRange(
      antdDef.uri,
      IRangeToRange(antdDef.targetSelectionRange || antdDef.range)
    )
    if (!text) return null
    return { text, uri: antdDef.uri }
  } else if (userlandLineDef) {
    let doc = await workspace.openTextDocument(userlandLineDef.uri)
    const nextPos = IRangeToRange(userlandLineDef.targetSelectionRange!).end
    const nextDef = await recursiveFindDefinition(doc, nextPos, trace)
    return nextDef
  }
  return null
}

/**
 * Extract string from of range.
 */
export async function extractTextOfRange(uri: Uri, range: Range): Promise<string>
export function extractTextOfRange(document: TextDocument, range: Range): string
export function extractTextOfRange(d: Uri | TextDocument, range: Range): Thenable<string> | string {
  if (d instanceof Uri) {
    return workspace
      .openTextDocument(d)
      .then((document) =>
        document.lineAt(range.start.line).text.slice(range.start.character, range.end.character)
      )
  } else {
    return d.lineAt(range.start.line).text.slice(range.start.character, range.end.character)
  }
}
