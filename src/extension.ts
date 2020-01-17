import { commands, ExtensionContext, languages, Range, TextDocument } from 'vscode'

import { AntdProvideCompletionItem, InsertKind } from './CompletionItem'
import { HoverProvider } from './HoverProvider'
import { HandlerInsert } from './HandlerInsert'
import { ClassDeclaration } from 'typescript'

export function activate(context: ExtensionContext) {
  console.log('✨ ANTD HERO STARTED')

  const cmdAfterCompletion = commands.registerTextEditorCommand(
    'antdHero.afterCompletion',
    async (
      editor,
      edit,
      rangeToDelete: Range,
      document: TextDocument,
      handlerName: string,
      insertKind: InsertKind,
      classComponentParent: ClassDeclaration | null
    ) => {
      const handlerInsert = new HandlerInsert(
        editor,
        edit,
        rangeToDelete,
        document,
        handlerName,
        insertKind,
        classComponentParent
      )
      handlerInsert.cleanCompletionPrefix()
      await handlerInsert.tryRiseInputBox()
      handlerInsert.tryFillCompletionBind()
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
        const provider = new AntdProvideCompletionItem(document, postion, token, context)
        return provider.provideCompletionItems()
      },
    },
    ':', // ! - insert handler with prefix in configuration
    '#' // # - insert handler name with user input
  )

  context.subscriptions.push(hoverRegistration, completionItemRegistration, cmdAfterCompletion)
}
