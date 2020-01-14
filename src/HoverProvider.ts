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
import { DocLanguage, __intl } from './buildResource/constant'
import { ComponentsDoc, ComponentsRawDoc } from './buildResource/type'
import _antdDocJson from './definition.json'
import _rawTableJson from './raw-table.json'
import { composeCardMessage } from './utils'
import {
  composeDocLink,
  matchAntdModule,
  antdHeroErrorMsg,
  transformConfigurationLanguage,
} from './utils'

const antdDocJson: { [k in DocLanguage]: ComponentsDoc } = _antdDocJson
const rawTableJson: { [k in DocLanguage]: ComponentsRawDoc } = _rawTableJson

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

    /**
     * prop hover card
     */
    if (nodeName.type === 'props') {
      const matchedComponent = antdDocJson[this.language][nodeName.name]
      if (!matchedComponent) throw antdHeroErrorMsg(`did not match component for ${nodeName.name}`)

      const desc = matchedComponent[propText].description
      const type = matchedComponent[propText].type
      const version = matchedComponent[propText].version
      const defaultValue = matchedComponent[propText].default

      const md = composeCardMessage(
        [
          { label: 'description', value: desc },
          { label: 'type', value: type },
          { label: 'default', value: defaultValue },
          { label: 'version', value: version },
        ],
        this.language
      )

      return new Hover(md)
    }

    /**
     * component hover card
     */
    if (nodeName.type === 'component') {
      const matchedComponent = antdComponentMap[nodeName.name]

      if (!matchedComponent) throw antdHeroErrorMsg(`did not match component for ${nodeName.name}`)

      const aliasName = componentFolder
      const zhDocLink = `[en](${composeDocLink(aliasName, 'en')})`
      const enDocLink = `[中文](${composeDocLink(aliasName, 'zh')})`
      const docLinks =
        this.language === 'en' ? `${enDocLink} | ${zhDocLink}` : `${zhDocLink} | ${enDocLink}`

      const headMd = new MarkdownString(
        `**${nodeName.name}** ${__intl('componentHint', this.language)} \[ ${docLinks} \]`
      )

      const tableMd = new MarkdownString(rawTableJson[this.language][nodeName.name])

      return new Hover([headMd, tableMd])
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
