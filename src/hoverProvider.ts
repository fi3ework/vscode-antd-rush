import {
  CancellationToken,
  commands,
  Hover,
  Location,
  MarkdownString,
  Position,
  SymbolInformation,
  TextDocument,
  workspace,
} from 'vscode'

import { antdComponentMap } from './buildResource/componentMap'
import { DocLanguage, getPropsLabel } from './buildResource/constant'
import { ComponentsDoc } from './buildResource/type'
import _antdDocJson from './definition.json'
import {
  composeDocLink,
  matchAntdModule,
  throwAntdHeroError,
  transformConfigurationLanguage,
} from './utils'

const antdDocJson: { [k in DocLanguage]: ComponentsDoc } = _antdDocJson

export class HoverProvider {
  private document!: TextDocument
  private position!: Position
  private token!: CancellationToken
  private language: DocLanguage = transformConfigurationLanguage(
    workspace.getConfiguration().get('antdHero.language')
  )

  public constructor(document: TextDocument, position: Position, token: CancellationToken) {
    this.document = document
    this.position = position
    this.token = token
  }

  public provideHover = async () => {
    const { document, position } = this

    const range = document.getWordRangeAtPosition(position)
    const propText = document.getText(range)

    const definitionLoc = await this.getDefinitionUnderAntdModule()
    const definitionPath = definitionLoc.uri.path
    const antdMatched = matchAntdModule(definitionPath)
    // not from antd
    if (antdMatched === null) return
    const { componentFolder, filePath } = antdMatched

    const symbolTree = await commands.executeCommand<SymbolInformation[]>(
      'vscode.executeDocumentSymbolProvider',
      definitionLoc.uri
    )

    const propsInteraceName = this.getProps(symbolTree, definitionLoc)
    if (propsInteraceName === null) return
    const nodeName = this.getAstNodeName(propsInteraceName)
    if (nodeName === null) return

    // prop provider
    if (nodeName.type === 'props') {
      const matchedComponent = antdDocJson[this.language][nodeName.name]
      if (!matchedComponent)
        throw throwAntdHeroError(`did not match component for ${nodeName.name}`)

      const desc = matchedComponent[propText].description
      const type = matchedComponent[propText].type
      const version = matchedComponent[propText].version
      const defaultValue = matchedComponent[propText].default
      const md = new MarkdownString(
        `**${getPropsLabel('description', this.language)}**: ${desc}  \n`
      )
      this.appendType(md, type)
      md.appendMarkdown(`**${getPropsLabel('default', this.language)}**: ${defaultValue}  \n`)
      if (version) {
        md.appendMarkdown(`**${getPropsLabel('version', this.language)}**: ${version}  \n`)
      }
      md.isTrusted = true

      return new Hover(md)
    }

    // component provider
    if (nodeName.type === 'component') {
      const matchedComponent = antdComponentMap[nodeName.name]

      if (!matchedComponent)
        throw throwAntdHeroError(`did not match component for ${nodeName.name}`)

      const aliasName = componentFolder
      const md = new MarkdownString(
        // TODO: dynamic component name
        `**Alert** ${getPropsLabel('componentHint', this.language)} \[ [en](${composeDocLink(
          aliasName,
          'en'
        )}) | [中文](${composeDocLink(aliasName, this.language)}) \]`
      )

      return new Hover(md)
    }

    return
  }

  private getDefinitionUnderAntdModule = async () => {
    const { document, position } = this
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
    const typeDefinitionsUnderAntd = (typeDefinitions || []).filter(d =>
      matchAntdModule(d.uri.path)
    )

    if (typeDefinitionsUnderAntd.length > 1)
      console.info('[antd-hero]: get more than one type definition')
    if (definitionsUnderAntd.length > 1) console.info('[antd-hero]: get more than one definition')

    // TODO: difference between definition and type definition
    const definition = typeDefinitionsUnderAntd.concat(definitionsUnderAntd)[0] || null
    return definition
  }

  private appendType = (md: MarkdownString, typeStr: string) => {
    const types = typeStr.split('\\|')
    md.appendMarkdown(`**${getPropsLabel('type', this.language)}**: `)
    types.forEach((type, index) => {
      md.appendMarkdown(`\`${type}\``)
      if (index !== types.length - 1) {
        md.appendMarkdown(' | ')
      }
    })
    md.appendMarkdown('  \n')
    return md
  }

  private getProps = (symbols: SymbolInformation[] | undefined, loc: Location) => {
    if (!symbols) return null
    const outerContainer = symbols.find(symbol => {
      return symbol.location.range.contains(loc.range)
    })
    return outerContainer ? outerContainer.name : null
  }

  private getAstNodeName = (name: string): null | { type: 'component' | 'props'; name: string } => {
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
}
