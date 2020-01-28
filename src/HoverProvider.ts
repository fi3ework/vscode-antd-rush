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
    const definitionLoc = await getDefinitionInAntdModule(document, position)
    if (!definitionLoc) return

    const interaceName = definitionLoc.text
    const nodeType = this.getAstNodeType(interaceName)

    /**
     * props hover card
     */
    if (nodeType.type === 'props') {
      const closetComponentName = await getClosetAntdJsxElementNode(document, position)
      if (!closetComponentName) return
      const componentData = antdDocJson[this.language][closetComponentName]
      if (!componentData)
        throw antdRushErrorMsg(`did not match component for ${closetComponentName}`)

      const desc = componentData[interaceName].description
      const type = componentData[interaceName].type
      const version = componentData[interaceName].version
      const defaultValue = componentData[interaceName].default

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

  private getAstNodeType = (name: string): { type: 'component' | 'props' } => {
    return {
      type: name[0].toUpperCase() !== name[0] ? 'props' : 'component',
    }
  }
}
