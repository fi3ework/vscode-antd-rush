import { TextDocument, Position, CompletionItem, Range, CompletionItemKind } from 'vscode'
import { matchAntdModule, throwAntdHeroError } from './utils'
import { getClosetComponentNode } from './ast'

// TODO: just for prototype, move to assets
const handlerMapping: { [k: string]: string[] } = {
  Affix: ['onChange'],
  Alert: ['afterClose', 'onClose'],
}

const transformHandlerToItem = (handlerName: string): CompletionItem => {
  return new CompletionItem(`#${handlerName}`, CompletionItemKind.Method)
}

export const provideCompletionItems = (
  document: TextDocument,
  position: Position
): CompletionItem[] => {
  const start: Position = new Position(0, 0)
  const range: Range = new Range(start, position)
  const text = document.getText(range)

  let linePrefix = document.lineAt(position).text.substr(0, position.character)

  const componentName = getClosetComponentNode(document, position)
  if (componentName === null) return []

  const availableHandler = handlerMapping[componentName]
  if (!availableHandler) return []

  const items = availableHandler.map(transformHandlerToItem)

  return items
}
