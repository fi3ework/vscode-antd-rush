import { TextDocument, Position, commands, Location, workspace } from 'vscode'
import { getClosetComponentNode, insertCurrentMemberInClass, buildTsFromDts } from './ast'
import { isClassDeclaration, ClassDeclaration } from 'typescript'
import { matchAntdModule } from './utils'

export const insertHandler = async (document: TextDocument, position: Position) => {
  const classComponent = await getClosetComponentNode(document, position)
  // TODO: getClosetFunction in top scope
  // const functionalComponent = await ...

  if (!classComponent) return

  if (isClassDeclaration(classComponent)) {
    const handlerStrToInsert = await getHandlerDefinition(document, position)
    if (handlerStrToInsert === null) return
    insertCurrentMemberInClass(document, classComponent, position, handlerStrToInsert)
  }

  if (!classComponent) return
}

export const getHandlerDefinition = async (document: TextDocument, position: Position) => {
  const definitions = await commands.executeCommand<Location[]>(
    'vscode.executeDefinitionProvider',
    document.uri,
    position
  )
  if (!definitions) return null
  const antdDefinition = definitions.find(d => matchAntdModule(d.uri.path))
  if (!antdDefinition) return null
  const dtsDocument = await workspace.openTextDocument(antdDefinition.uri)
  const definitionStr = dtsDocument
    .getText()
    .slice(
      dtsDocument.offsetAt(antdDefinition.range.start),
      dtsDocument.offsetAt(antdDefinition.range.end)
    )

  const strToInsert = buildTsFromDts(definitionStr)
  return strToInsert
}
