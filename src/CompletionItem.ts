import {
  CancellationToken,
  Command,
  CompletionItem,
  CompletionItemKind,
  Position,
  Range,
  TextDocument,
  workspace,
  CompletionItemProvider,
  CompletionContext,
} from 'vscode'

import { getClosetElementNode } from './ast'
import { antdComponentMap } from './buildResource/componentMap'
import { DocLanguage } from './buildResource/constant'
import { ComponentsDoc } from './buildResource/type'
import _antdDocJson from './definition.json'
import { composeCardMessage, transformConfigurationLanguage } from './utils'
import { addHandlerPrefix } from './insertion'

const antdDocJson: { [k in DocLanguage]: ComponentsDoc } = _antdDocJson

export type InsertKind = 'direct' | 'inquiry'

export class AntdProvideCompletionItem implements CompletionItemProvider {
  static insertKindMapping: { [k: string]: InsertKind } = {
    ':': 'direct',
    '#': 'inquiry',
  }
  private document: TextDocument
  private position: Position
  private token: CancellationToken
  private context: CompletionContext
  private language: DocLanguage = transformConfigurationLanguage(
    workspace.getConfiguration().get('antdHero.language')
  )

  public constructor(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
    context: CompletionContext
  ) {
    this.document = document
    this.position = position
    this.token = token
    this.context = context
  }

  private getHandlerDocument = (componentName: string, handlerName: string) => {
    const componentDoc = antdDocJson[this.language][componentName]
    if (!componentDoc) return null

    const { description, type, default: defaultValue, version } = componentDoc[handlerName]

    return composeCardMessage(
      [
        { label: 'type', value: type, display: 'blockCode' },
        { label: 'description', value: description },
        { label: 'default', value: defaultValue },
        { label: 'version', value: version },
      ],
      this.language
    )
  }

  private transformHandlerToItem = (componentName: string, handlerName: string): CompletionItem => {
    const { document, position } = this
    const item = new CompletionItem(handlerName, CompletionItemKind.Method)
    const doc = this.getHandlerDocument(componentName, handlerName)
    if (doc) item.documentation = doc

    const isInClassComponent = !!getClosetElementNode(this.document, this.position)

    const sharpSymbolRange = new Range(
      new Position(position.line, position.character - 1),
      new Position(position.line, position.character)
    )

    const triggerChar = this.context.triggerCharacter
    const insertKind = AntdProvideCompletionItem.insertKindMapping[triggerChar || '#']

    if (insertKind === 'direct') {
      item.insertText = `${handlerName}={${isInClassComponent ? 'this.' : ''}${addHandlerPrefix(
        handlerName
      )}} `
    }

    if (insertKind === 'inquiry') {
      item.insertText = handlerName
    }

    const handlerBindObject = isInClassComponent ? 'this.' : ''

    const cmd: Command = {
      title: 'afterCompletion',
      command: 'antdHero.afterCompletion',
      arguments: [sharpSymbolRange, document, handlerName, insertKind, handlerBindObject],
    }

    item.command = cmd
    return item
  }

  public provideCompletionItems = (): CompletionItem[] => {
    const { document, position } = this
    const componentName = getClosetElementNode(document, position)
    // not in a JSX element
    if (componentName === null) return []

    const availableHandler = antdComponentMap[componentName].methods
    // element not from antd
    if (!availableHandler) return []

    const items = availableHandler.map(h => this.transformHandlerToItem(componentName, h))

    return items
  }

  public resolveCompletionItem = async (item: any) => {
    return item
  }
}
