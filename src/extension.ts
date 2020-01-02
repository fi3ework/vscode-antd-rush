import { workspace, languages, window, commands, ExtensionContext, Disposable, Hover } from 'vscode'
import ContentProvider, { encodeLocation } from './provider'
import { provideHover } from './hoverProvider'
import * as vscode from 'vscode'

export function activate(context: ExtensionContext) {
  console.log('✨ ANTD HERO START')
  // const provider = new ContentProvider()

  // // register content provider for scheme `references`
  // // register document link provider for scheme `references`
  // const providerRegistrations = Disposable.from(
  //   workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider),
  //   languages.registerDocumentLinkProvider({ scheme: ContentProvider.scheme }, provider)
  // )

  // // register command that crafts an uri with the `references` scheme,
  // // open the dynamic document, and shows it in the next editor
  // const commandRegistration = commands.registerTextEditorCommand(
  //   'editor.printReferences',
  //   editor => {
  //     const uri = encodeLocation(editor.document.uri, editor.selection.active)
  //     return workspace
  //       .openTextDocument(uri)
  //       .then(doc => window.showTextDocument(doc, editor.viewColumn! + 1))
  //   }
  // )

  // context.subscriptions.push(provider, commandRegistration, providerRegistrations)

  const hoverRegistration = languages.registerHoverProvider('javascript', {
    provideHover(document, position, token) {
      return provideHover(document, position, token)
    },
  })

  context.subscriptions.push(hoverRegistration)
}
