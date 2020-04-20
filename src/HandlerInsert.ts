import {
  ClassDeclaration,
  createSourceFile,
  FunctionDeclaration,
  isFunctionDeclaration,
  isVariableStatement,
  Node,
  ScriptTarget,
  SourceFile,
  VariableStatement,
} from 'typescript'
import {
  commands,
  Location,
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  TextEditorRevealType,
  window,
  workspace,
} from 'vscode'

import {
  FunctionParam,
  getFunctionParams,
  getParentsWhen,
  insertStringToClassComponent,
  insertStringToFunctionalComponent,
} from './ast'
import { InsertKind } from './CompletionItem'
import { addHandlerPrefix } from './insertion'

export class HandlerInsert {
  private document: TextDocument
  private sFile: SourceFile
  private editor: TextEditor
  private edit: TextEditorEdit
  private triggerCharRange: Range
  private handlerName: string // onChange, onSelect ...
  private fullHandlerName: string // handleOnChange, myOnSelect ...
  private insertKind: InsertKind // handleOnChange, myOnSelect ...
  private classComponentParent: ClassDeclaration | null

  public constructor(
    editor: TextEditor,
    edit: TextEditorEdit,
    triggerCharRange: Range,
    document: TextDocument,
    handlerName: string,
    insertKind: InsertKind,
    classComponentParent: ClassDeclaration | null
  ) {
    this.editor = editor
    this.document = document
    this.sFile = createSourceFile(document.uri.toString(), document.getText(), ScriptTarget.Latest)
    this.triggerCharRange = triggerCharRange
    this.edit = edit
    this.handlerName = handlerName
    this.fullHandlerName = addHandlerPrefix(handlerName)
    this.insertKind = insertKind // handleOnChange, myOnSelect ...
    this.classComponentParent = classComponentParent // `is JSX in class component
  }

  public insertHandler = async () => {
    const { document, triggerCharRange, classComponentParent } = this
    const symbolPosition = triggerCharRange.end
    // 1. Get closest outer class component

    if (classComponentParent) {
      // 2-a. insert class component handler
      const functionParams = await this.getHandlerParams()
      const indent = this.countIndentsInNode(classComponentParent)
      if (functionParams === null) return

      const insertAt = await insertStringToClassComponent({
        editor: this.editor,
        document,
        indent,
        classNode: classComponentParent,
        symbolPosition,
        fullHandlerName: this.fullHandlerName,
        handlerParams: functionParams,
      })

      this.moveCursor(insertAt, indent * 2)
    } else {
      // 2-b. if not found outer class component, it should be functional component
      const functionalComponent = await getParentsWhen<FunctionDeclaration | VariableStatement>(
        document,
        symbolPosition,
        async (node) => {
          return isFunctionDeclaration(node) || isVariableStatement(node)
        },
        'inward'
      )

      const handlerParams = await this.getHandlerParams()
      if (functionalComponent === null || handlerParams === null) return
      const indent = this.countIndentsInNode(functionalComponent)

      const insertAt = await insertStringToFunctionalComponent({
        editor: this.editor,
        document,
        indent,
        position: this.triggerCharRange.end,
        symbolPosition,
        fullHandlerName: this.fullHandlerName,
        handlerParams,
      })

      this.moveCursor(insertAt, indent * 2)
    }
  }

  public tryRiseInputBox = async (): Promise<void> => {
    if (this.insertKind === 'direct') return Promise.resolve()

    const fullHandlerNameInput = await window.showInputBox({
      value: '',
      ignoreFocusOut: true,
      placeHolder: 'Input handler name. e.g. `handleOnChange`',
      validateInput: (text) => {
        return text === '' ? 'Please input handler name' : null
      },
    })

    const fullHandlerName = fullHandlerNameInput || addHandlerPrefix(this.handlerName)
    this.fullHandlerName = fullHandlerName
    return
  }

  public cleanCompletionPrefix = () => {
    const { edit, triggerCharRange } = this
    edit.delete(triggerCharRange)
  }

  public tryFillCompletionBind = () => {
    const { insertKind } = this
    // `direct` mode has been filled by `completionItem`
    if (insertKind === 'direct') return

    const handlerBindObject = this.classComponentParent ? 'this.' : ''
    const cursor = this.editor.selection.active
    const suffix = `={${handlerBindObject}${this.fullHandlerName}}`
    this.editor.edit((build) => {
      // NOTE: can not use edit.insert, as it only can be called synchronously
      build.insert(cursor, suffix)
    })
  }

  private moveCursor = (insertAt: Position | null, xDelta: number) => {
    if (!insertAt) return
    const DELTA_TO_TRAIL_OF_INSERTION = 3
    const deltaPosition = insertAt.translate(DELTA_TO_TRAIL_OF_INSERTION, xDelta)
    const cursorTarget = new Selection(deltaPosition, deltaPosition)
    this.editor.selection = cursorTarget
    this.editor.revealRange(cursorTarget, TextEditorRevealType.InCenterIfOutsideViewport)
  }

  private getHandlerParams = async (): Promise<FunctionParam[] | null> => {
    const { document, triggerCharRange } = this
    const position = triggerCharRange.end

    const definitions = await commands.executeCommand<Location[]>(
      'vscode.executeDefinitionProvider',
      document.uri,
      position
    )
    if (!definitions) return null
    const antdDefinition = definitions[0]
    if (!antdDefinition) return null

    const dtsDocument = await workspace.openTextDocument(antdDefinition.uri)
    const definitionString = dtsDocument
      .getText()
      .slice(
        dtsDocument.offsetAt(antdDefinition.range.start),
        dtsDocument.offsetAt(antdDefinition.range.end)
      )

    const functionParams = getFunctionParams(definitionString)
    return functionParams
  }

  private countIndentsInNode = (node: Node): number => {
    let nodeBodyIndent = 0
    const startLine = this.document.positionAt(node.pos).line + 1
    const endLine = this.document.positionAt(node.end).line

    for (let line = startLine; line <= endLine; line++) {
      const lineText = this.editor.document.lineAt(line).text
      const indentCount = this.countMinIndentsOfText(lineText)

      if (nodeBodyIndent === 0 && indentCount > 0) {
        nodeBodyIndent = indentCount
      } else if (indentCount > 0) {
        nodeBodyIndent = Math.min(nodeBodyIndent, indentCount)
      }
    }

    return nodeBodyIndent
  }

  // forked from https://github.com/rubymaniac/vscode-paste-and-indent/blob/master/src/extension.ts#L30-L45
  private countMinIndentsOfText = (line: string) => {
    // TODO: indent by space or tab?
    let indentCount = line.search(/\S/) // -1 means the line is blank (full of space characters)
    if (indentCount !== -1) {
      // Normalize the line according to the indentation preferences
      if (this.editor.options.insertSpaces) {
        // When we are in SPACE mode
        const numberOfTabs = line.substring(0, indentCount).split(/\t/).length - 1
        indentCount += numberOfTabs * (Number(this.editor.options.tabSize) - 1)
      } else {
        // When we are in TAB mode
        // Reduce _xmin by how many space characters are in the line
        indentCount -= (line.substring(0, indentCount).match(/[^\t]+/g) || []).length
      }
    }

    return indentCount
  }
}
