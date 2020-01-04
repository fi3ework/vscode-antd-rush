// import { TextDocument, Position, CompletionItem, Range, CompletionItemKind } from 'vscode'
// import { matchAntdModule } from './utils'

// export const provideCompletionItems = (
//   document: TextDocument,
//   position: Position
// ): CompletionItem[] => {
//   const start: Position = new Position(0, 0)
//   const range: Range = new Range(start, position)
//   const text = document.getText(range)

//   // 暂时只匹配import方式引入
//   const importRegex = /import[\s\S]*from\s'antd'/g
//   const componentRegex = /<([A-Z][a-zA-Z0-9]*)\b[^<>]*$/g

//   if (importRegex.test(text) && componentRegex.test(text)) {
//     text.match(componentRegex)
//     const name = RegExp.$1

//     const params = components[name]
//     if (params) {
//       const properties = Object.keys(params)

//       const completionItems = properties.map(prop => {
//         // CompletionItemKind用于决定提示项前面的icon图标，有多种类型，Class是其中一种
//         // https://code.visualstudio.com/docs/extensionAPI/vscode-api#CompletionItemKind
//         const completionItem = new CompletionItem(prop, CompletionItemKind.Variable)
//         completionItem.detail = params[prop]

//         return completionItem
//       })

//       return completionItems
//     }
//     return []
//   }
//   return []
// }
