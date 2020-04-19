import { ClassDeclaration } from 'typescript'
import {
  commands,
  ExtensionContext,
  languages,
  Range,
  TextDocument,
  window,
  QuickPickItem,
} from 'vscode'

import { AntdProvideCompletionItem, InsertKind } from './CompletionItem'
import { HandlerInsert } from './HandlerInsert'
import { HoverProvider } from './HoverProvider'
import { toAntdMajorVersion } from './utils'
import { ConfigHelper } from './utils/ConfigHelper'

export function activate(context: ExtensionContext) {
  console.log('⚡️ ANTD RUSH STARTED')
  const configHelper = new ConfigHelper(context)

  /**
   * Command after compilation (insert handler template).
   */
  const cmdAfterCompletion = commands.registerTextEditorCommand(
    'antdRush.afterCompletion',
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

  /**
   * Hover hint for component and props.
   */
  const hoverRegistration = languages.registerHoverProvider(
    ['javascript', 'javascriptreact', 'typescriptreact'],
    {
      provideHover(document, position, token) {
        const hoverProvider = new HoverProvider(document, position, token, configHelper)
        return hoverProvider.provideHover()
      },
    }
  )

  /**
   * Press `!` or `#` to trigger handler intellisense for antd component.
   */
  const completionItemRegistration = languages.registerCompletionItemProvider(
    ['javascript', 'javascriptreact', 'typescriptreact'],
    {
      provideCompletionItems(document, postion, token, context) {
        const provider = new AntdProvideCompletionItem(
          document,
          postion,
          token,
          context,
          configHelper
        )
        return provider.provideCompletionItems()
      },
    },
    ...Object.keys(AntdProvideCompletionItem.insertKindMapping)
  )

  /**
   * Change antd major version for current workspace
   */
  commands.registerCommand('antdRush.setWorkspaceAntdMajorVersion', () => {
    const currVer = configHelper.getCurrConfig().antdVersion
    const options: QuickPickItem[] = ['^3', '^4'].map((label) => {
      return {
        label,
        description: toAntdMajorVersion(label) === currVer ? 'Current using' : undefined,
      }
    })

    window.showQuickPick(options).then((option) => {
      if (!option) return
      const ver = toAntdMajorVersion(option.label)
      configHelper.setCurrConfig({
        antdVersion: ver,
      })
    })
  })

  /**
   * Clean listeners.
   */
  context.subscriptions.push(hoverRegistration, completionItemRegistration, cmdAfterCompletion)
}
