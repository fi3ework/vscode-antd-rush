import { commands, Disposable, ExtensionContext, Hover, languages, window, workspace } from 'vscode'

// import { provideCompletionItems } from './completionItem'
import { provideHover } from './hoverProvider'

export function activate(context: ExtensionContext) {
  console.log('✨ ANTD HERO STARTED')

  const hoverRegistration = languages.registerHoverProvider('javascript', {
    provideHover(document, position, token) {
      return provideHover(document, position, token)
    },
  })

  // const completionItemRegistration = languages.registerCompletionItemProvider('javascript', {
  //   provideCompletionItems,
  // })

  context.subscriptions.push(hoverRegistration)
  // completionItemRegistration)
}
