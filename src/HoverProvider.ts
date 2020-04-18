import { CancellationToken, Hover, MarkdownString, Position, TextDocument, workspace } from 'vscode'

import { getClosetAntdJsxElementNode } from './ast'
import { antdComponentMap } from './build-resource/componentMap'
import { __intl } from './build-resource/constant'
import { DocLanguage, ResourceVersion } from './types'
import { PropsJson, ComponentsJson, VersionJson } from './build-resource/type'
import {
  antdRushErrorMsg,
  composeCardMessage,
  composeDocLink,
  extractTextOfRange,
  getAntdMajorVersionConfiguration,
  getDefinitionInAntdModule,
  getLanguageConfiguration,
  matchAntdModule,
  tryMatchComponentName,
} from './utils'
import { versionsJson } from './cache'

export class HoverProvider {
  private document!: TextDocument
  private position!: Position
  private token!: CancellationToken
  private language: DocLanguage = getLanguageConfiguration(
    workspace.getConfiguration().get('antdRush.language')
  )
  private antdVersion: ResourceVersion = getAntdMajorVersionConfiguration(
    workspace.getConfiguration().get('antdRush.defaultAntdMajorVersion') || 'v4'
  )
  private antdDocJson: PropsJson
  private rawTableJson: ComponentsJson

  public constructor(document: TextDocument, position: Position, token: CancellationToken) {
    this.document = document
    this.position = position
    this.token = token
    this.antdDocJson = versionsJson[this.antdVersion].propsJson
    this.rawTableJson = versionsJson[this.antdVersion].componentJson
  }

  public provideHover = async () => {
    const { document, position, token } = this
    if (token.isCancellationRequested) return

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
      const componentData = this.antdDocJson[this.language][closestComponentName]
      if (!componentData)
        throw antdRushErrorMsg(`did not match component for ${closestComponentName}`)

      const { description: desc, type, version, default: defaultValue } = componentData[
        interfaceName
      ]

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

      const tablesMd = this.rawTableJson[this.language][componentName].map(
        (table) => new MarkdownString(table)
      )

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
