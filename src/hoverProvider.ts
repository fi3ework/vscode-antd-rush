import decamelize from 'decamelize'
import {
  CancellationToken,
  commands,
  Hover,
  Location,
  MarkdownString,
  Position,
  SymbolInformation,
  TextDocument,
} from 'vscode'

import { antdComponentMap } from './defComposer/componentMap'
import { ComponentsDoc } from './defComposer/type'
import _antdDocJson from './definition.json'
import { composeDocLink, matchAntdModule, throwAntdHeroError } from './utils'

const antdDocJson: ComponentsDoc = _antdDocJson

export const provideHover = async (
  document: TextDocument,
  position: Position,
  token: CancellationToken
) => {
  const range = document.getWordRangeAtPosition(position)
  const propText = document.getText(range)

  const definitionLocs = await commands.executeCommand<Location[]>(
    'vscode.executeDefinitionProvider',
    document.uri,
    position
  )

  // not definition available
  if (!definitionLocs?.length) return
  if (definitionLocs.length > 1) console.info('[antd-hero]: get more than one definition')
  const definitionLoc = definitionLocs[0]
  const definitionPath = definitionLoc.uri.path
  const antdMatched = matchAntdModule(definitionPath)
  // not from antd
  if (antdMatched === null) return
  const { componentFolder, filePath } = antdMatched

  const symbolTree = await commands.executeCommand<SymbolInformation[]>(
    'vscode.executeDocumentSymbolProvider',
    definitionLoc.uri
  )

  const propsInteraceName = getProps(symbolTree, definitionLoc)
  if (propsInteraceName === null) return
  const componentName = getAstNodeName(propsInteraceName)
  if (componentName === null) return

  if (componentName.type === 'props') {
    const matchedComponent = antdDocJson[componentName.name]
    if (!matchedComponent)
      throw throwAntdHeroError(`did not match component for ${componentName.name}`)

    const desc = matchedComponent[propText].description
    const type = matchedComponent[propText].type
    const version = matchedComponent[propText].version
    const defaultValue = matchedComponent[propText].default
    const md = new MarkdownString(`**描述**: ${desc}  \n`)
    appendType(md, type)
    md.appendMarkdown(`**默认值**: ${defaultValue}  \n`)
    if (version) {
      md.appendMarkdown(`**版本**: ${version}  \n`)
    }
    md.isTrusted = true

    return new Hover(md)
  }

  if (componentName.type === 'component') {
    const matchedComponent = antdComponentMap[componentName.name]

    if (!matchedComponent)
      throw throwAntdHeroError(`did not match component for ${componentName.name}`)

    const aliasName = decamelize(matchedComponent.docAlias || componentName.name)
    const md = new MarkdownString(
      `**Alert** documentation \[ [en](${composeDocLink(
        aliasName,
        'en'
      )}) | [中文](${composeDocLink(aliasName, 'zh')}) \]`
    )

    return new Hover(md)
  }

  return
}

const appendType = (md: MarkdownString, typeStr: string) => {
  const types = typeStr.split('\\|')
  md.appendMarkdown(`**类型**: `)
  types.forEach((type, index) => {
    md.appendMarkdown(`\`${type}\``)
    if (index !== types.length - 1) {
      md.appendMarkdown(' | ')
    }
  })
  md.appendMarkdown('  \n')
  return md
}

const getProps = (symbols: SymbolInformation[] | undefined, loc: Location) => {
  if (!symbols) return null
  const outerContainer = symbols.find(symbol => {
    return symbol.location.range.contains(loc.range)
  })
  return outerContainer ? outerContainer.name : null
}

type DocType = 'component' | 'props'

const getAstNodeName = (name: string): null | { type: DocType; name: string } => {
  if (name.endsWith('Props')) {
    const breadName = name.slice(0, name.length - 'Props'.length).split(/(?=[A-Z])/)

    return {
      type: 'props',
      name: breadName.join('.'),
    }
  }

  return {
    type: 'component',
    name: name,
  }
}
