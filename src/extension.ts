import { ExtensionContext, languages, commands, Range } from 'vscode'

import { provideCompletionItems, resolveCompletionItem } from './completionItem'
import { provideHover } from './hoverProvider'

export function activate(context: ExtensionContext) {
  console.log('✨ ANTD HERO STARTED')

  const commandRegistration = commands.registerTextEditorCommand(
    'editor.antdHeroReplace',
    (editor, cb) => {
      console.log(editor)
      // const uri = encodeLocation(editor.document.uri, editor.selection.active)
      // return workspace
      //   .openTextDocument(uri)
      //   .then(doc => window.showTextDocument(doc, editor.viewColumn! + 1))
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

  context.subscriptions.push(hoverRegistration, completionItemRegistration, commandRegistration)
}
