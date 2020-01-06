import { commands, ExtensionContext, languages, Range, TextDocument } from 'vscode'

import { cleanCompletion, provideCompletionItems, resolveCompletionItem } from './completionItem'
import { provideHover } from './hoverProvider'
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
      return provideHover(document, position, token)
    },
  })

  const completionItemRegistration = languages.registerCompletionItemProvider(
    // TODO: JSX | TS? | TSX
    [{ language: 'javascript', scheme: 'file' }],
    {
      provideCompletionItems,
      resolveCompletionItem,
    },
    '#'
  )

  context.subscriptions.push(hoverRegistration, completionItemRegistration, commandAfterCompletion)
}
