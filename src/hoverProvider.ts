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

import { antdComponentMap } from './buildResource/componentMap'
import { ComponentsDoc } from './buildResource/type'
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

  const definitionLoc = await getDefinitionUnderAntdModule(document, position)
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
  const nodeName = getAstNodeName(propsInteraceName)
  if (nodeName === null) return

  // prop provider
  if (nodeName.type === 'props') {
    const matchedComponent = antdDocJson[nodeName.name]
    if (!matchedComponent) throw throwAntdHeroError(`did not match component for ${nodeName.name}`)

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

  // component provider
  if (nodeName.type === 'component') {
    const matchedComponent = antdComponentMap[nodeName.name]

    if (!matchedComponent) throw throwAntdHeroError(`did not match component for ${nodeName.name}`)

    const aliasName = componentFolder
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

const getDefinitionUnderAntdModule = async (document: TextDocument, position: Position) => {
  const [definitions, typeDefinitions] = await Promise.all([
    await commands.executeCommand<Location[]>(
      'vscode.executeDefinitionProvider',
      document.uri,
      position
    ),
    await commands.executeCommand<Location[]>(
      'vscode.executeTypeDefinitionProvider',
      document.uri,
      position
    ),
  ])

  const definitionsUnderAntd = (definitions || []).filter(d => matchAntdModule(d.uri.path))
  const typeDefinitionsUnderAntd = (typeDefinitions || []).filter(d => matchAntdModule(d.uri.path))

  if (typeDefinitionsUnderAntd.length > 1)
    console.info('[antd-hero]: get more than one type definition')
  if (definitionsUnderAntd.length > 1) console.info('[antd-hero]: get more than one definition')

  // TODO: difference between definition and type definition
  const definition = typeDefinitionsUnderAntd.concat(definitionsUnderAntd)[0] || null
  return definition
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

const getAstNodeName = (name: string): null | { type: 'component' | 'props'; name: string } => {
  let type: 'component' | 'props' = 'component'
  let breadName = name.split(/(?=[A-Z])/).join('.')

  if (name.endsWith('Props')) {
    type = 'props'
    breadName = name
      .slice(0, name.length - 'Props'.length)
      .split(/(?=[A-Z])/)
      .join('.')
  }

  return {
    type,
    name: breadName,
  }
}
