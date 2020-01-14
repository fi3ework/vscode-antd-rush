import { commands, ExtensionContext, languages, Range, TextDocument } from 'vscode'

import { AntdCompletionItem, resolveCompletionItem } from './CompletionItem'
import { HoverProvider } from './HoverProvider'
import { HandlerInsert } from './HandlerInsert'

export function activate(context: ExtensionContext) {
  console.log('✨ ANTD HERO STARTED')

  const cmdAfterCompletion = commands.registerTextEditorCommand(
    'antdHero.afterCompletion',
    (editor, edit, rangeToDelete: Range, document: TextDocument, handlerName: string) => {
      const handlerInsert = new HandlerInsert(editor, edit, rangeToDelete, document, handlerName)
      handlerInsert.cleanCompletionPrefix()
      handlerInsert.insertHandler()
    }
  )

  const hoverRegistration = languages.registerHoverProvider('javascript', {
    provideHover(document, position, token) {
      const hoverProvider = new HoverProvider(document, position, token)
      return hoverProvider.provideHover()
    },
  })

  const completionItemRegistration = languages.registerCompletionItemProvider(
    ['javascript', 'javascriptreact', 'typescriptreact'],
    {
      provideCompletionItems(document, postion, token, context) {
        const item = new AntdCompletionItem(document, postion)
        return item.provideCompletionItems()
      },
      resolveCompletionItem,
    },
    '#'
  )

  context.subscriptions.push(hoverRegistration, completionItemRegistration, cmdAfterCompletion)
}
