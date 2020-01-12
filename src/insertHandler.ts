import {
  TextDocument,
  Position,
  commands,
  Location,
  workspace,
  TextEditorEdit,
  Range,
  TextEditor,
} from 'vscode'
import {
  getClosetClassComponentElement,
  insertStringToClassComponent,
  buildTsFromDts,
  FunctionParam,
} from './ast'
import { isClassDeclaration, ClassDeclaration } from 'typescript'
import { matchAntdModule } from './utils'

export class HandlerInsert {
  private editor: TextEditor
  private edit: TextEditorEdit
  private document: TextDocument
  private sharpSymbolRange: Range
  private handlerName: string

  constructor(
    editor: TextEditor,
    edit: TextEditorEdit,
    sharpSymbolRange: Range,
    document: TextDocument,
    handlerName: string
  ) {
    this.editor = editor
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
      const functionParams = await this.getHandlerParams()
      if (functionParams === null) return
      insertStringToClassComponent(
        this.editor,
        document,
        classComponent,
        position,
        this.handlerName,
        functionParams
      )
    } else {
      // 2. if not found outer class component, it should be functional component
      // TODO: getClosetFunction in top scope
      // const functionalComponent = await ...
    }
  }

  private getHandlerParams = async (): Promise<FunctionParam[] | null> => {
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

    const functionParams = buildTsFromDts(definitionString)
    return functionParams
  }

  public cleanCompletionPrefix = () => {
    const { edit, sharpSymbolRange } = this
    edit.delete(sharpSymbolRange)
  }
}
