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

const transformHandlerToItem = (handlerName: string, range: Range): CompletionItem => {
  const item = new CompletionItem(handlerName, CompletionItemKind.Method)
  // TODO: handler documentation
  // item.documentation =
  item.insertText = handlerName
  // item.range = range
  const cmd = {
    title: 'delete #',
    command: 'editor.antdHeroReplace',
  }
  item.command = cmd
  return item
}

export const provideCompletionItems = (
  document: TextDocument,
  position: Position
): CompletionItem[] => {
  const range: Range = new Range(
    new Position(position.line, position.character - 5),
    new Position(position.line, position.character + 5)
  )

  const range2 = document.getWordRangeAtPosition(position)
  const r3 = document.getWordRangeAtPosition(position)

  const componentName = getClosetComponentNode(document, position)
  if (componentName === null) return []

  const availableHandler = handlerMapping[componentName]
  if (!availableHandler) return []

  const items = availableHandler.map(h => transformHandlerToItem(h, range))

  return items
}

export const resolveCompletionItem = (item: CompletionItem, token: CancellationToken) => {
  console.log(item)
  return item

  // return new CompletionItem(`kkkk`, CompletionItemKind.Method)
}
