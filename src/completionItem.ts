import {
  CancellationToken,
  Command,
  CompletionItem,
  CompletionItemKind,
  MarkdownString,
  Position,
  Range,
  TextDocument,
  TextEditorEdit,
  workspace,
} from 'vscode'

import { getClosetElementNode } from './ast'
import { antdComponentMap } from './buildResource/componentMap'
import { DocLanguage } from './buildResource/constant'
import { ComponentsDoc } from './buildResource/type'
import _antdDocJson from './definition.json'
import { transformConfigurationLanguage, composeCardMessage } from './utils'

const antdDocJson: { [k in DocLanguage]: ComponentsDoc } = _antdDocJson

export class AntdCompletionItem {
  private document: TextDocument
  private position: Position
  private language: DocLanguage = transformConfigurationLanguage(
    workspace.getConfiguration().get('antdHero.language')
  )

  public constructor(document: TextDocument, position: Position) {
    this.document = document
    this.position = position
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

    // FIXME: hard coded for class component
    const camelizedHandlerName = handlerName.slice(0, 1).toUpperCase() + handlerName.slice(1)
    item.insertText = `${handlerName}={handle${camelizedHandlerName}}`
    const rangeOfSharp = new Range(
      new Position(position.line, position.character - 1),
      new Position(position.line, position.character)
    )

    const cmd: Command = {
      title: 'delete #',
      command: 'editor.antdHeroAfterCompletion',
      arguments: [rangeOfSharp, document],
    }

    item.command = cmd
    return item
  }

  public provideCompletionItems = (): CompletionItem[] => {
    const { document, position } = this
    const componentName = getClosetElementNode(document, position)
    if (componentName === null) return []

    const availableHandler = antdComponentMap[componentName].methods
    if (!availableHandler) return []

    const items = availableHandler.map(h => this.transformHandlerToItem(componentName, h))

    return items
  }

  // public resolveCompletionItem = (item: CompletionItem, token: CancellationToken) => {
  //   return item
  // }

  // public cleanCompletion = (edit: TextEditorEdit, rangeToDelete: Range) => {
  //   edit.delete(rangeToDelete)
  // }
}

export const resolveCompletionItem = (item: CompletionItem, token: CancellationToken) => {
  return item
}

export const cleanCompletion = (edit: TextEditorEdit, rangeToDelete: Range) => {
  edit.delete(rangeToDelete)
}
