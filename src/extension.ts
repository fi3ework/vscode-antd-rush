import { commands, ExtensionContext, languages, Range, TextDocument } from 'vscode'

import {
  cleanCompletion,
  // provideCompletionItems,
  AntdCompletionItem,
  resolveCompletionItem,
} from './completionItem'
import { HoverProvider } from './hoverProvider'
import { insertHandler } from './insertHandler'

export function activate(context: ExtensionContext) {
  console.log('✨ ANTD HERO STARTED')

  const commandAfterCompletion = commands.registerTextEditorCommand(
    'editor.antdHeroAfterCompletion',
    (editor, edit, rangeToDelete: Range, document: TextDocument) => {
      cleanCompletion(edit, rangeToDelete)
      insertHandler(document, rangeToDelete.end)
    }
  )

  const hoverRegistration = languages.registerHoverProvider('javascript', {
    provideHover(document, position, token) {
      const hoverProvider = new HoverProvider(document, position, token)
      return hoverProvider.provideHover()
    },
  })

  const completionItemRegistration = languages.registerCompletionItemProvider(
    // TODO: JSX | TS? | TSX
    [{ language: 'javascript', scheme: 'file' }],
    {
      provideCompletionItems(document, postion, token, context) {
        const item = new AntdCompletionItem(document, postion)
        return item.provideCompletionItems()
      },
      resolveCompletionItem,
    },
    '#'
  )

  context.subscriptions.push(hoverRegistration, completionItemRegistration, commandAfterCompletion)
}
