import { CancellationToken, commands, Hover, Location, Position, TextDocument } from 'vscode'

import { readAst } from './ast'
import antdDocJson from './definition.json'

const isFromNodeModules = (path: string) => path.match(/(.*)\/node_modules\/antd\/lib\/(.*)/)

export const provideHover = async (
  document: TextDocument,
  position: Position,
  token: CancellationToken
) => {
  const range = document.getWordRangeAtPosition(position)
  const text = document.getText(range)

  const definitions = await commands.executeCommand<Location[]>(
    'vscode.executeDefinitionProvider',
    document.uri,
    position
  )

  if (!definitions) return
  if (definitions.length > 1) console.log('[antd-hero]: more than one definition')
  const definition = definitions[0]
  const defPath = definition.uri.path
  const regResult = isFromNodeModules(defPath)
  if (regResult === null) return // not from antd
  readAst(document.getText())

  return new Hover('I am a hover!~')
}
