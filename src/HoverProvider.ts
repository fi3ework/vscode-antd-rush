import {
  CancellationToken,
  commands,
  Hover,
  Location,
  MarkdownString,
  Position,
  TextDocument,
  workspace,
} from 'vscode'

import { getContainerSymbolAtLocation, getClosetAntdJsxElementNode } from './ast'
import { antdComponentMap } from './buildResource/componentMap'
import { __intl, DocLanguage } from './buildResource/constant'
import { ComponentsDoc, ComponentsRawDoc } from './buildResource/type'
import _antdDocJson from './definition.json'
import _rawTableJson from './raw-table.json'
import { matchNodeModules } from './utils'
import {
  antdRushErrorMsg,
  composeCardMessage,
  composeDocLink,
  matchAntdModule,
  transformConfigurationLanguage,
} from './utils'

const antdDocJson: { [k in DocLanguage]: ComponentsDoc } = _antdDocJson
const rawTableJson: { [k in DocLanguage]: ComponentsRawDoc } = _rawTableJson

export class HoverProvider {
  private document!: TextDocument
  private position!: Position
  private token!: CancellationToken
  private language: DocLanguage = transformConfigurationLanguage(
    workspace.getConfiguration().get('antdRush.language')
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

    const definitionLoc = await this.getDefinitionInAntdModule()
    if (!definitionLoc) return

    const interaceName = await getContainerSymbolAtLocation(definitionLoc)
    if (interaceName === null) return

    const nodeType = this.getAstNodeType(interaceName)

    /**
     * props hover card
     */
    if (nodeType.type === 'props') {
      // TODO: not ok for Carousel.props.erase
      const antdComponentName = await getClosetAntdJsxElementNode(document, position)
      if (!antdComponentName) return
      const matchedComponent = antdDocJson[this.language][antdComponentName]
      if (!matchedComponent)
        throw antdRushErrorMsg(`did not match component for ${antdComponentName}`)

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
    if (nodeType.type === 'component') {
      const comName = this.fuzzySearchComponentMapping(interaceName)
      if (!comName) return
      const definitionPath = definitionLoc.uri.path

      const antdMatched = matchAntdModule(definitionPath)

      if (antdMatched === null) return // return if not from antd
      const { componentFolder } = antdMatched

      const matchedComponent = antdComponentMap[comName]

      if (!matchedComponent) throw antdRushErrorMsg(`did not match component for ${comName}`)

      const enDocLink = `[EN](${composeDocLink(componentFolder, 'en')})`
      const zhDocLink = `[中文](${composeDocLink(componentFolder, 'zh')})`
      const docLinks =
        this.language === 'en' ? `${enDocLink} | ${zhDocLink}` : `${zhDocLink} | ${enDocLink}`

      const headMd = new MarkdownString(
        `**${comName}** ${__intl('componentHint', this.language)} \[ ${docLinks} \]`
      )

      const tableMd = new MarkdownString(rawTableJson[this.language][comName])

      return new Hover([headMd, tableMd])
    }

    return
  }

  private normalizeName = (raw: string): string =>
    raw
      .split('.')
      .join('')
      .toLowerCase()

  private fuzzySearchComponentMapping = (fuzzyName: string): string | null => {
    const exactKey = Object.keys(antdComponentMap).find(
      com => this.normalizeName(com) === this.normalizeName(fuzzyName)
    )
    if (!exactKey) return null
    return exactKey
  }

  private getDefinitionInAntdModule = async () => {
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

    const definitionsUnderAntd = (definitions || []).filter(d => matchNodeModules(d.uri.path))
    const typeDefinitionsUnderAntd = (typeDefinitions || []).filter(d =>
      matchNodeModules(d.uri.path)
    )

    if (typeDefinitionsUnderAntd.length > 1)
      console.info('[antd-rush]: get more than one type definition')

    // TODO: difference between definition and type definition
    if (definitionsUnderAntd.length > 1) console.info('[antd-rush]: get more than one definition')

    if (typeDefinitionsUnderAntd.length) {
      return typeDefinitionsUnderAntd[0]
    }

    if (definitionsUnderAntd.length) {
      return definitionsUnderAntd[0]
    }

    return null
  }

  private getAstNodeType = (name: string): { type: 'component' | 'props' } => {
    return {
      type: name.endsWith('Props') ? 'props' : 'component',
    }
  }
}
