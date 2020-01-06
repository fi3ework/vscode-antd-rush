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
} from 'vscode'

import { getClosetComponentNode } from './ast'
import { matchAntdModule, throwAntdHeroError } from './utils'

// TODO: just for prototype, move to assets
const handlerMapping: { [k: string]: string[] } = {
  Affix: ['onChange'],
  Alert: ['afterClose', 'onClose'],
}

const transformHandlerToItem = (handlerName: string, position: Position): CompletionItem => {
  const item = new CompletionItem(handlerName, CompletionItemKind.Method)
  // TODO: handler documentation
  // item.documentation =
  item.insertText = handlerName
  const rangeOfSharp = new Range(
    new Position(position.line, position.character - 1),
    new Position(position.line, position.character)
  )
  const cmd: Command = {
    title: 'delete #',
    command: 'editor.antdHeroDeletePrefix',
    arguments: [rangeOfSharp],
  }

  item.command = cmd
  return item
}

export const provideCompletionItems = (
  document: TextDocument,
  position: Position
): CompletionItem[] => {
  const componentName = getClosetComponentNode(document, position)
  if (componentName === null) return []

  const availableHandler = handlerMapping[componentName]
  if (!availableHandler) return []

  const items = availableHandler.map(h => transformHandlerToItem(h, position))

  return items
}

export const resolveCompletionItem = (item: CompletionItem, token: CancellationToken) => {
  console.log(item)
  return item

  // return new CompletionItem(`kkkk`, CompletionItemKind.Method)
}
