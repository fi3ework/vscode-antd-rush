import {
  CancellationToken,
  CompletionItem,
  CompletionItemKind,
  Position,
  Range,
  TextDocument,
  TextEdit,
  Command,
  commands,
  window,
  TextEditorEdit,
} from 'vscode'

import { getClosetElementNode } from './ast'
import { matchAntdModule, throwAntdHeroError } from './utils'

// TODO: just for prototype, move to assets
const handlerMapping: { [k: string]: string[] } = {
  Affix: ['onChange'],
  Alert: ['afterClose', 'onClose'],
}

const transformHandlerToItem = (
  handlerName: string,
  position: Position,
  document: TextDocument
): CompletionItem => {
  const item = new CompletionItem(handlerName, CompletionItemKind.Method)
  // TODO: show documentation of handler
  // item.documentation =
  // FIXME: hand coded for class component
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

export const provideCompletionItems = (
  document: TextDocument,
  position: Position
): CompletionItem[] => {
  const componentName = getClosetElementNode(document, position)
  if (componentName === null) return []

  const availableHandler = handlerMapping[componentName]
  if (!availableHandler) return []

  const items = availableHandler.map(h => transformHandlerToItem(h, position, document))

  return items
}

export const resolveCompletionItem = (item: CompletionItem, token: CancellationToken) => {
  return item
}

export const cleanCompletion = (edit: TextEditorEdit, rangeToDelete: Range) => {
  edit.delete(rangeToDelete)
}
