import {
  TextDocument,
  Position,
  commands,
  Location,
  workspace,
  TextEditorEdit,
  Range,
} from 'vscode'
import { getClosetClassComponentElement, insertStringToClassComponent, buildTsFromDts } from './ast'
import { isClassDeclaration, ClassDeclaration } from 'typescript'
import { matchAntdModule } from './utils'

export class HandlerInsert {
  private edit: TextEditorEdit
  private document: TextDocument
  private sharpSymbolRange: Range
  private handlerName: string

  constructor(
    edit: TextEditorEdit,
    sharpSymbolRange: Range,
    document: TextDocument,
    handlerName: string
  ) {
    this.document = document
    this.sharpSymbolRange = sharpSymbolRange
    this.edit = edit
    this.handlerName = handlerName
  }

  public insertHandler = async () => {
    const { document, sharpSymbolRange } = this
    const position = sharpSymbolRange.end
    // 1. Get closet outer class component
    const classComponent = await getClosetClassComponentElement(document, position)

    if (classComponent) {
      // 2. insert class component handler
      const stringToInsert = await this.getHandlerDefinition()
      if (stringToInsert === null) return
      insertStringToClassComponent(document, classComponent, position, stringToInsert)
    } else {
      // 2. if not found outer class component, it should be functional component
      // TODO: getClosetFunction in top scope
      // const functionalComponent = await ...
    }
  }

  private getHandlerDefinition = async (): Promise<string | null> => {
    const { document, sharpSymbolRange } = this
    const position = sharpSymbolRange.end

    const definitions = await commands.executeCommand<Location[]>(
      'vscode.executeDefinitionProvider',
      document.uri,
      position
    )

    if (!definitions) return null
    const antdDefinition = definitions.find(d => matchAntdModule(d.uri.path))
    if (!antdDefinition) return null
    const dtsDocument = await workspace.openTextDocument(antdDefinition.uri)
    const definitionString = dtsDocument
      .getText()
      .slice(
        dtsDocument.offsetAt(antdDefinition.range.start),
        dtsDocument.offsetAt(antdDefinition.range.end)
      )

    const stringToInsert = buildTsFromDts(definitionString)
    return stringToInsert
  }

  public cleanCompletionPrefix = () => {
    const { edit, sharpSymbolRange } = this
    edit.delete(sharpSymbolRange)
  }
}
