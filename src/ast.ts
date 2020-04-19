import ts, {
  ClassDeclaration,
  isClassDeclaration,
  isFunctionTypeNode,
  isJsxOpeningElement,
  isJsxSelfClosingElement,
  isJsxText,
  isPropertySignature,
  Node,
  SourceFile,
  FunctionDeclaration,
  isVariableStatement,
  isJsxAttribute,
  isJsxAttributes,
  VariableStatement,
  isReturnStatement,
  isIdentifier,
  isJsxClosingFragment,
  isJsxOpeningFragment,
  isJsxElement,
  isBlock,
  FunctionTypeNode,
  PropertySignature,
  isTypeLiteralNode,
  isUnionTypeNode,
  isParenthesizedTypeNode,
  isFunctionExpression,
  Block,
} from 'typescript'
import { commands, Location, Position, TextDocument, TextEditor, SymbolInformation } from 'vscode'

import {
  isInReactModule,
  getDefinitionInAntdModule,
  matchAntdModule,
  tryMatchComponentName,
} from './utils'
import { composeHandlerString, addHandlerPrefix } from './insertion'

/**
 * NOTE: https://github.com/microsoft/TypeScript/blob/master/lib/typescript.d.ts
 * JsxText = 11,
 * PropertySignature = 157,
 * FunctionType = 169,
 * ClassDeclaration = 244,
 * JsxSelfClosingElement = 265,
 * JsxOpeningElement = 266,
 */

/**
 * Return nearest JsxElement at position, return null if not found.
 */
export async function getClosetAntdJsxElementNode(
  document: TextDocument,
  position: Position
): Promise<string | null> {
  const offset = document.offsetAt(position)

  // NOTE: change symbol to common letter as a legal JSX attribute for AST right paring
  const firstHalf = document.getText().slice(0, offset - 1)
  const secondHalf = document.getText().slice(offset)
  const source = firstHalf + 'Q' + secondHalf // 'Q' could be any character
  const sFile = ts.createSourceFile(document.uri.toString(), source, ts.ScriptTarget.Latest)

  const parents: Node[] = getNodeWithParentsAt(sFile, offset - 1)
  if (!parents.length) return null

  const [jsxElement, jsxAttributes, jsxAttribute, identifier] = parents.slice(-4)

  if (
    (isJsxSelfClosingElement(jsxElement) || isJsxOpeningElement(jsxElement)) &&
    isJsxAttributes(jsxAttributes) &&
    isJsxAttribute(jsxAttribute) &&
    isIdentifier(identifier)
  ) {
    const definitionLoc = await getDefinitionInAntdModule(
      document,
      document.positionAt(jsxElement.tagName.end)
    )
    if (!definitionLoc) return null
    const definitionPath = definitionLoc.uri.path
    const antdMatched = matchAntdModule(definitionPath)
    const interaceName = definitionLoc.text
    if (antdMatched === null) return null // return if not from antd
    const { componentFolder } = antdMatched
    const fullComponentName = tryMatchComponentName(interaceName, componentFolder)
    if (!fullComponentName) return null

    return fullComponentName
  }

  return null
}

/**
 * Get symbol name of given VSCode location
 */
export async function getContainerSymbolAtLocation(loc: Location) {
  const { uri, range } = loc
  const symbols = await commands.executeCommand<SymbolInformation[]>(
    'vscode.executeDocumentSymbolProvider',
    uri
  )

  if (!symbols) return null
  const container = symbols.find((symbol) => {
    // NOTE: symbol tree is not from line start and line end
    return (
      symbol.location.range.start.line <= range.start.line &&
      symbol.location.range.end.line >= range.end.line
    )
  })
  return container ? container.name : null
}

/**
 * Return nearest userland component (class component / functional component) with condition
 */
export async function getParentsWhen<T extends Node>(
  document: TextDocument,
  position: Position,
  condition: (parent: Node, document: TextDocument) => Promise<boolean>,
  direction: 'inward' | 'outward'
): Promise<T | null> {
  const sFile = ts.createSourceFile(
    document.uri.toString(),
    document.getText(),
    ts.ScriptTarget.Latest
  )

  const offset = document.offsetAt(position)
  // parents should starts from the closest
  let parents: Node[] = getNodeWithParentsAt(sFile, offset)
  if (direction === 'outward') parents = parents.reverse()

  const typeComponentNodePromises = parents.map((parent) => {
    return condition(parent, document)
  })

  const typeJudgementResult = await Promise.all(typeComponentNodePromises)
  const targetNodeIndex = typeJudgementResult.findIndex(Boolean)
  if (targetNodeIndex === -1) return null
  const typeComponentNode = parents[targetNodeIndex] as T
  return typeComponentNode
}

/**
 * Insert string to class component
 * This function adapt indent and fill in handler template
 */
export async function insertStringToClassComponent(args: {
  editor: TextEditor
  document: TextDocument
  classNode: ClassDeclaration
  symbolPosition: Position
  fullHandlerName: string
  indent: number
  handlerParams: FunctionParam[]
}): Promise<Position | null> {
  const {
    editor,
    document,
    indent,
    classNode,
    symbolPosition,
    fullHandlerName,
    handlerParams,
  } = args
  const offset = document.offsetAt(symbolPosition)

  const memberContainsSymbol = classNode.members.find((member) => {
    return offsetContains(offset, member.pos, member.end)
  })

  if (!memberContainsSymbol) return null

  // memberContainsSymbol.pos point to the previous member ending position
  const insertAt = document.positionAt(memberContainsSymbol.pos)

  await editor.edit((builder) => {
    builder.insert(insertAt, composeHandlerString(fullHandlerName, handlerParams, indent, 'class'))
  })

  return insertAt
}

/**
 * Insert string to functional component
 * This function adapt indent and fill in handler template
 */
export async function insertStringToFunctionalComponent(args: {
  editor: TextEditor
  document: TextDocument
  indent: number
  position: Position
  symbolPosition: Position
  fullHandlerName: string
  handlerParams: FunctionParam[]
}): Promise<Position | null> {
  const {
    editor,
    document,
    indent,
    position,
    symbolPosition,
    fullHandlerName,
    handlerParams,
  } = args

  const sFile = ts.createSourceFile(
    document.uri.toString(),
    document.getText(),
    ts.ScriptTarget.Latest
  )

  // find outermost statement
  const parents = getNodeWithParentsAt(sFile, document.offsetAt(symbolPosition))
  // exclude outermost component, cause we should insert handler in it
  const closetBlock = parents.slice(1).find((parent) => {
    return isBlock(parent)
  }) as Block

  // arrow function
  // function declaration
  // function variable
  // anonymous function

  if (!closetBlock) return null
  const subStatement = closetBlock.statements.find((statement) =>
    offsetContains(document.offsetAt(position), statement.pos, statement.end)
  )

  if (!subStatement) return null

  const insertAt = document.positionAt(subStatement.pos)
  editor.edit((builder) => {
    builder.insert(
      insertAt,
      composeHandlerString(fullHandlerName, handlerParams, indent, 'functional')
    )
  })

  return insertAt
}

/**
 * Get ast node at postion, return with it's parent nodes
 */
export async function isClassExtendsReactComponent(
  node: Node,
  document: TextDocument
): Promise<boolean> {
  if (!isClassDeclaration(node)) return false
  if (!node.heritageClauses?.length) return false
  const isReactClassPromises = node.heritageClauses.map(async (heritage) => {
    const expressions = heritage.types.map((type) => type.expression)
    const isFromReactPromises = expressions.map(async (expression) => {
      const position = document.positionAt(expression.pos + 1)
      const typeDefinition = await commands.executeCommand<Location[]>(
        'vscode.executeTypeDefinitionProvider',
        document.uri,
        position
      )

      const hasDefinitionFromReact = !!typeDefinition?.some((definition) =>
        isInReactModule(definition.uri.path)
      )

      return hasDefinitionFromReact
    })

    const result = await Promise.all(isFromReactPromises)
    return result.some(Boolean)
  })

  const isReactClassResult = await Promise.all(isReactClassPromises)
  const isReactClass = isReactClassResult.some(Boolean)

  return isReactClass
}

/**
 * Whether offset between start and end
 */
function offsetContains(offset: number, startOrEnd: number, endOrStart: number) {
  const [start, end] = startOrEnd > endOrStart ? [endOrStart, startOrEnd] : [startOrEnd, endOrStart]
  return start <= offset && end >= offset
}

/**
 * Get function params from dts string
 */
export interface FunctionParam {
  type: string
  text: string
}

export function getFunctionParams(dtsString: string): FunctionParam[] | null {
  // NOTE: definition is a property, it should be wrapped in type
  const dtsTypeString = `type DUMMY = {
  ${dtsString}
}`

  const sCode: SourceFile = ts.createSourceFile('', dtsTypeString, ts.ScriptTarget.Latest)
  let paramTexts: string[] = []

  traverseWithParents(sCode, (node, stack) => {
    if (isPropertySignature(node)) {
      paramTexts = extractParamsFromPropertySignature(node, sCode)
    }
  })

  return paramTexts.map((param) => ({ type: '', text: param }))
}

/**
 * Extract function params from property signature
 */
function extractParamsFromPropertySignature(
  signature: PropertySignature,
  sCode: SourceFile
): string[] {
  const paramTexts: string[] = []
  const sigType = signature.type
  if (!sigType) return paramTexts

  // e.g. onChange?: (affixed?: boolean) => void;
  if (isFunctionTypeNode(sigType)) {
    paramTexts.push(...extractParamsFromFunctionType(sigType, sCode))
  }

  // e.g. tipFormatter?: null | ((value: number) => React.ReactNode);
  if (isUnionTypeNode(sigType)) {
    // should not can accept two function type
    const functionType = sigType.types.filter(isParenthesizedTypeNode)[0].type
    if (!functionType) return paramTexts
    if (isFunctionTypeNode(functionType)) {
      paramTexts.push(...extractParamsFromFunctionType(functionType, sCode))
    }
  }

  return paramTexts
}

/**
 * Extract parameter and its type from FunctionType node
 */
function extractParamsFromFunctionType(node: FunctionTypeNode, sCode: SourceFile): string[] {
  const typeParamsText = node.parameters.map((p) => {
    return p.name.getText(sCode as SourceFile)
  })

  return typeParamsText
}

/**
 * Traverse ts ast
 */
interface TraverseActions {
  enter?: (node: Node) => boolean
  leave?: Function
}

const noop = () => true

export function traverseTsAst(entryNode: Node, traverseActions: TraverseActions) {
  const { enter: _enter, leave: _leave } = traverseActions
  const enter = typeof _enter === 'function' ? _enter : noop
  const leave = typeof _leave === 'function' ? _leave : noop

  const traverseNode = (node: Node) => {
    const shouldVisitChildren = enter(node)
    if (shouldVisitChildren) {
      node.forEachChild(traverseNode)
    }
    leave(node)
  }

  traverseNode(entryNode)
}

/**
 * Traverse node with parents
 */
export function traverseWithParents(
  entryNode: Node,
  visitor: (node: Node, stack: Node[]) => boolean | void
) {
  const parentStack: Node[] = []

  const enter = (node: Node) => {
    parentStack.push(node)
    visitor(node, parentStack)
    return true
  }

  traverseTsAst(entryNode, {
    enter: enter,
  })
}

/**
 * Get ast node at postion, return with it's parent nodes
 */
function getNodeWithParentsAt(entryNode: Node, offset: number) {
  const parentStack: Node[] = []

  const enter = (node: Node) => {
    const start = node.pos
    const end = node.end
    const hasFind = offsetContains(offset, start, end)

    if (hasFind) {
      parentStack.push(node)
      return true
    } else {
      return false
    }
  }

  traverseTsAst(entryNode, {
    enter: enter,
  })

  return parentStack
}
