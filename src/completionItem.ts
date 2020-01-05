import { TextDocument, Position, CompletionItem, Range, CompletionItemKind } from 'vscode'
import { matchAntdModule } from './utils'
import { getClosetComponentNode } from './ast'

export const provideCompletionItems = (
  document: TextDocument,
  position: Position
): CompletionItem[] => {
  const start: Position = new Position(0, 0)
  const range: Range = new Range(start, position)
  const text = document.getText(range)
  // get all text until the `position` and check if it reads `console.`
  // and if so then complete if `log`, `warn`, and `error`
  let linePrefix = document.lineAt(position).text.substr(0, position.character)
  // if (!linePrefix.endsWith('xxx.$')) {
  //   return []
  // }

  getClosetComponentNode(document, position)

  return [
    new CompletionItem('#log', CompletionItemKind.Method),
    new CompletionItem('#warn', CompletionItemKind.Method),
    new CompletionItem('#error', CompletionItemKind.Method),
  ]
}
