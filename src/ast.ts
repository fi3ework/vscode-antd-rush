import ts, {
  ClassDeclaration,
  isClassDeclaration,
  isJsxOpeningElement,
  isJsxSelfClosingElement,
  isJsxText,
  Node,
  createProgram,
} from 'typescript'
import { commands, Location, Position, TextDocument } from 'vscode'

import { isFromReactNodeModules, throwAntdHeroError, antdHeroErrorMsg } from './utils'
import { isClass, ClassMethod } from 'babel-types'

/**
 * NOTE: https://github.com/microsoft/TypeScript/blob/master/lib/typescript.d.ts
 * JsxText = 11,
 * ClassDeclaration = 244,
 * JsxSelfClosingElement = 265,
 * JsxOpeningElement = 266,
 */

/**
 * Return nearest JsxElement at position, return null if not found.
 */
export const getClosetElementNode = (document: TextDocument, position: Position): string | null => {
  const sFile = ts.createSourceFile(
    document.uri.toString(),
    document.getText(),
    ts.ScriptTarget.Latest
  )

  const offset = document.offsetAt(position)
  const parents: Node[] = getNodeWithParentsAt(sFile, offset)

  if (!parents.length) return null
  const [jsxElement, jsxText] = parents.slice(-2) // TS do not support array deconstruction operator?

  if (
    (isJsxOpeningElement(jsxElement) || isJsxSelfClosingElement(jsxElement)) &&
    isJsxText(jsxText)
  ) {
    const componentName = jsxElement.tagName.getText(sFile)
    // TODO: rename import
    return componentName
  }

  return null
}

/**
 * Return nearest userland class component or functional component
 */
export const getClosetComponentNode = async (
  document: TextDocument,
  position: Position
): Promise<ClassDeclaration | null> => {
  const sFile = ts.createSourceFile(
    document.uri.toString(),
    document.getText(),
    ts.ScriptTarget.Latest
  )

  const offset = document.offsetAt(position)
  // parents starts from closest
  const parents: Node[] = getNodeWithParentsAt(sFile, offset).reverse()

  const classComponentNodePromises = parents.map(parent => {
    return isClassExtendsReactComponent(parent, document)
  })

  const classJudgementResult = await Promise.all(classComponentNodePromises)
  const classComponentNode = parents[classJudgementResult.findIndex(Boolean)]

  // TODO: functional component

  // TODO: type guard should has narrowed type in above context
  if (!isClassDeclaration(classComponentNode)) {
    throw Error(antdHeroErrorMsg('should return classComponentNode node'))
  } else {
    return classComponentNode
  }
}

/**
 *
 */
export const insertCurrentMemberInClass = async (
  document: TextDocument,
  classNode: ClassDeclaration,
  position: Position,
  insertionStr: string
) => {
  const offset = document.offsetAt(position)

  const memberIndex = classNode.members.findIndex(member => {
    return offSetContains(offset, member.pos, member.end)
  })

  const handlerInsertOffset = classNode.members[memberIndex].pos
  // TODO: insert it!
}

/**
 *
 */
export const composeHandlerAst = (handlerName: string, ...args: string[]) => {}

/**
 * Get ast node at postion, return with it's parent nodes
 */
const isClassExtendsReactComponent = async (
  node: Node,
  document: TextDocument
): Promise<boolean> => {
  if (!isClassDeclaration(node)) return false
  if (!node.heritageClauses?.length) return false
  const isReactClassPromises = node.heritageClauses.map(async heritage => {
    const expressions = heritage.types.map(type => type.expression)
    const isFromReactPromises = expressions.map(async expression => {
      const position = document.positionAt(expression.pos + 1)
      const typeDefinition = await commands.executeCommand<Location[]>(
        'vscode.executeTypeDefinitionProvider',
        document.uri,
        position
      )

      const hasDefinitionFromReact = !!typeDefinition?.some(definition =>
        isFromReactNodeModules(definition.uri.path)
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
 * Get ast node at postion, return with it's parent nodes
 */
const getNodeWithParentsAt = (node: Node, offset: number, initialParents?: Node[]) => {
  const parents: Node[] = initialParents || []
  let hasFind = false
  node.forEachChild(child => {
    const start = child.pos
    const end = child.end
    if (offSetContains(offset, start, end)) {
      parents.push(child)
      hasFind = true
    }
    return
  })

  if (hasFind) {
    getNodeWithParentsAt(parents[parents.length - 1], offset, parents)
  }

  return parents
}

/**
 * Whether offset between start and end
 */
const offSetContains = (offset: number, startOrEnd: number, endOrStart: number) => {
  const [start, end] = startOrEnd > endOrStart ? [endOrStart, startOrEnd] : [startOrEnd, endOrStart]
  return start <= offset && end >= offset
}

/**
 * Create empty function from function dts
 */
export const buildTsFromDts = (dtsStr: string): string | null => {
  // FIXME: only a simple workaround
  // TODO: ast is too complex
  const regResult = dtsStr.match(/(.*?)\??: (.*) => (.*)/)
  if (!regResult) return null
  const [, handlerName, argsTypeStr, returnTypeStr] = regResult
  return `${handlerName} = ${argsTypeStr} => {

  }`
}
