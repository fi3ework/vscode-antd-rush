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
} from 'typescript'
import { commands, Location, Position, TextDocument, window } from 'vscode'

import { addHandlerPrefix, isFromReactNodeModules } from './utils'

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
 * Return nearest userland class component
 */
export const getClosetClassComponentElement = async (
  document: TextDocument,
  position: Position
): Promise<ClassDeclaration | null> => {
  const sFile = ts.createSourceFile(
    document.uri.toString(),
    document.getText(),
    ts.ScriptTarget.Latest
  )

  const offset = document.offsetAt(position)
  // parents should starts from the closest
  const parents: Node[] = getNodeWithParentsAt(sFile, offset).reverse()

  const classComponentNodePromises = parents.map(parent => {
    return isClassExtendsReactComponent(parent, document)
  })

  const classJudgementResult = await Promise.all(classComponentNodePromises)
  const classComponentNode = parents[classJudgementResult.findIndex(Boolean)] as ClassDeclaration
  return classComponentNode
}

/**
 *
 */
export const insertStringToClassComponent = async (
  document: TextDocument,
  classNode: ClassDeclaration,
  position: Position,
  insertion: string
) => {
  const offset = document.offsetAt(position)

  const memberIndex = classNode.members.findIndex(member => {
    return offsetContains(offset, member.pos, member.end)
  })

  const insertAt = document.positionAt(classNode.members[memberIndex].pos)

  let editor = window.activeTextEditor
  editor?.edit(builder => {
    builder.insert(insertAt, insertion)
  })
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
// TODO: implement by traverseTsAst
const getNodeWithParentsAt = (node: Node, offset: number, initialParents?: Node[]) => {
  const parents: Node[] = initialParents || []
  let hasFind = false
  node.forEachChild(child => {
    const start = child.pos
    const end = child.end
    if (offsetContains(offset, start, end)) {
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
const offsetContains = (offset: number, startOrEnd: number, endOrStart: number) => {
  const [start, end] = startOrEnd > endOrStart ? [endOrStart, startOrEnd] : [startOrEnd, endOrStart]
  return start <= offset && end >= offset
}

/**
 * Create empty function from function dts
 */
export const buildTsFromDts = (dtsString: string): string | null => {
  // NOTE: definition is a property, it should be wrapped in type
  const dtsTypeString = `type DUMMY = {
  ${dtsString}
}`

  const sCode: Node = ts.createSourceFile('', dtsTypeString, ts.ScriptTarget.Latest)
  let handlerName: string = ''
  const paramTexts: string[] = []

  traverseWithParents(sCode, (node, stack) => {
    if (isPropertySignature(node)) {
      if (!node.type) return
      handlerName = node.name.getText(sCode as SourceFile)
      if (isFunctionTypeNode(node.type)) {
        // TODO: lacks ts type, only satisfied JS
        const typeParamsText = node.type.parameters.map(p => {
          return p.name.getText(sCode as SourceFile)
        })
        paramTexts.push(...typeParamsText)
      }
    }
  })

  // TODO: indent
  return `

  ${addHandlerPrefix(handlerName)} = (${paramTexts.join(', ')}) => {

  }`
}

/**
 * Traverse ts ast
 */
interface TraverseActions {
  enter?: Function
  leave?: Function
}

const noop = () => {}

export const traverseTsAst = (entryNode: Node, traverseActions: TraverseActions) => {
  const { enter: _enter, leave: _leave } = traverseActions
  const enter = typeof _enter === 'function' ? _enter : noop
  const leave = typeof _leave === 'function' ? _leave : noop

  const traverseNode = (node: Node) => {
    enter(node)
    node.forEachChild(traverseNode)
    leave(node)
  }

  traverseNode(entryNode)
}

/**
 * Traverse node with parents
 */
export const traverseWithParents = (
  entryNode: Node,
  visitor: (node: Node, stack: Node[]) => boolean | void
) => {
  const nodeStack: Node[] = []

  const enter = (node: Node) => {
    nodeStack.push(node)
    visitor(node, nodeStack)
  }

  const leave = (node: Node) => {
    const topNode = nodeStack.pop()
  }

  traverseTsAst(entryNode, {
    enter: enter,
    leave: leave,
  })
}
