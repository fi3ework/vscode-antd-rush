import {
  CancellationToken,
  commands,
  Hover,
  Location,
  Position,
  TextDocument,
  SymbolInformation,
  MarkdownString,
} from 'vscode'

import { LanguageService, createLanguageService } from 'typescript'
import { readAst } from './ast'
import antdDocJson from './definition.json'
import * as vscode from 'vscode'

const isFromNodeModules = (path: string) => path.match(/(.*)\/node_modules\/antd\/lib\/(.*)\/(.*)/)

export const provideHover = async (
  document: TextDocument,
  position: Position,
  token: CancellationToken
) => {
  const range = document.getWordRangeAtPosition(position)
  const text = document.getText(range)

  const definitionLocs = await commands.executeCommand<Location[]>(
    'vscode.executeDefinitionProvider',
    document.uri,
    position
  )

  // not definition available
  if (!definitionLocs?.length) return
  if (definitionLocs.length > 1) console.log('[antd-hero]: more than one definition')
  const definitionLoc = definitionLocs[0]
  const definitionPath = definitionLoc.uri.path
  const regResult = isFromNodeModules(definitionPath)
  // not from antd
  if (regResult === null) return
  const [, , componentFolder, filePath] = regResult
  // readAst(document)

  const symbolTree = await commands.executeCommand<SymbolInformation[]>(
    'vscode.executeDocumentSymbolProvider',
    definitionLoc.uri
  )

  const propsInteraceName = getProps(symbolTree, definitionLoc)
  if (propsInteraceName === null) return
  const componentName = getComponentFromIterface(propsInteraceName)
  if (componentName === null) return
  // @ts-ignore
  const desc = antdDocJson[componentName][text].description
  // @ts-ignore
  const defaultValue = antdDocJson[componentName][text].default
  const md = new MarkdownString(`**描述**: ${desc}  \n`)
  md.appendMarkdown(`**默认值**: ${defaultValue}  \n`)
  md.isTrusted = true

  return new Hover(md)
}

const getProps = (symbols: SymbolInformation[] | undefined, loc: Location) => {
  if (!symbols) return null
  const outerContainer = symbols.find(symbol => {
    return symbol.location.range.contains(loc.range)
  })
  return outerContainer ? outerContainer.name : null
}

const getComponentFromIterface = (interfaceName: string) => {
  if (!interfaceName.endsWith('Props')) return null
  const breadName = interfaceName.slice(0, interfaceName.length - 'Props'.length).split(/(?=[A-Z])/)
  return breadName.join('.')
}
