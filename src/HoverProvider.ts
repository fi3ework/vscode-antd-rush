import { CancellationToken, Hover, MarkdownString, Position, TextDocument, workspace } from 'vscode'
import { antdComponentMap } from './buildResource/componentMap'
import { __intl, DocLanguage } from './buildResource/constant'
import { ComponentsDoc, ComponentsRawDoc } from './buildResource/type'
import _antdDocJson from './definition.json'
import _rawTableJson from './raw-table.json'
import { matchAntdModule } from './utils'
import { getClosetAntdJsxElementNode } from './ast'
import {
  antdRushErrorMsg,
  composeCardMessage,
  composeDocLink,
  getDefinitionInAntdModule,
  tryMatchComponentName,
  transformConfigurationLanguage,
  extractTextOfRange,
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
    const hoveredWordRange = document.getWordRangeAtPosition(position)
    if (!hoveredWordRange) return
    const nodeType = this.calcNodeType(extractTextOfRange(document, hoveredWordRange))

    /**
     * props hover card
     */
    if (nodeType.type === 'props') {
      const interfaceName = extractTextOfRange(document, hoveredWordRange)
      const closestComponentName = await getClosetAntdJsxElementNode(document, position)
      if (!closestComponentName) return
      const componentData = antdDocJson[this.language][closestComponentName]
      if (!componentData)
        throw antdRushErrorMsg(`did not match component for ${closestComponentName}`)

      const desc = componentData[interfaceName].description
      const type = componentData[interfaceName].type
      const version = componentData[interfaceName].version
      const defaultValue = componentData[interfaceName].default

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
      const definitionLoc = await getDefinitionInAntdModule(document, position)
      if (!definitionLoc) return

      const interaceName = definitionLoc.text
      const definitionPath = definitionLoc.uri.path
      const antdMatched = matchAntdModule(definitionPath)

      if (antdMatched === null) return // return if not from antd
      const { componentFolder } = antdMatched

      const componentName = tryMatchComponentName(interaceName, componentFolder)
      if (!componentName) return

      const matchedComponent = antdComponentMap[componentName]

      if (!matchedComponent) throw antdRushErrorMsg(`did not match component for ${componentName}`)

      const enDocLink = `[EN](${composeDocLink(componentFolder, 'en')})`
      const zhDocLink = `[中文](${composeDocLink(componentFolder, 'zh')})`
      const docLinks =
        this.language === 'en' ? `${enDocLink} | ${zhDocLink}` : `${zhDocLink} | ${enDocLink}`

      const headMd = new MarkdownString(
        `**${componentName}** ${__intl('componentHint', this.language)} \[ ${docLinks} \]`
      )

      const tablesMd = rawTableJson[this.language][componentName].map(table => {
        return new MarkdownString(table)
      })

      return new Hover([headMd, ...tablesMd])
    }

    return
  }

  private calcNodeType = (name: string): { type: 'component' | 'props' } => {
    return {
      type: name[0].toUpperCase() !== name[0] ? 'props' : 'component',
    }
  }
}
