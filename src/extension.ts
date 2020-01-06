import { commands, ExtensionContext, languages, Range } from 'vscode'

import { provideCompletionItems, resolveCompletionItem } from './completionItem'
import { provideHover } from './hoverProvider'

export function activate(context: ExtensionContext) {
  console.log('✨ ANTD HERO STARTED')

  const commandDeletePrefix = commands.registerTextEditorCommand(
    'editor.antdHeroDeletePrefix',
    (editor, edit, rangeToDelete: Range) => {
      edit.delete(rangeToDelete)
    }
  )

  const hoverRegistration = languages.registerHoverProvider('javascript', {
    provideHover(document, position, token) {
      return provideHover(document, position, token)
    },
  })

  const completionItemRegistration = languages.registerCompletionItemProvider(
    [{ language: 'javascript', scheme: 'file' }],
    {
      provideCompletionItems,
      resolveCompletionItem,
    },
    '#'
  )

  context.subscriptions.push(hoverRegistration, completionItemRegistration, commandDeletePrefix)
}
