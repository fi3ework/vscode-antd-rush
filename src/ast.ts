import ts, { Node, isJsxOpeningElement, isJsxSelfClosingElement, isJsxText } from 'typescript'
import { TextDocument, Position } from 'vscode'

export function getNodes(node: ts.Node) {
  const nodes: ts.Node[] = []
  ts.forEachChild(node, cbNode => {
    nodes.push(cbNode)
  })
  return nodes
}

export const readAst = (document: TextDocument) => {
  const sFile = ts.createSourceFile(
    document.uri.toString(),
    document.getText(),
    ts.ScriptTarget.Latest
  )

  const ast = getNodes(sFile)
  console.log(ast)
}

/**
 * NOTE: https://github.com/microsoft/TypeScript/blob/master/lib/typescript.d.ts
 * JsxText = 11,
 * JsxSelfClosingElement = 265,
 * JsxOpeningElement = 266,
 */

export const getClosetComponentNode = (document: TextDocument, position: Position) => {
  const sFile = ts.createSourceFile(
    document.uri.toString(),
    document.getText(),
    ts.ScriptTarget.Latest
  )

  const offset = document.offsetAt(position)
  const parents: Node[] = getNodeWithParentsAt(sFile, offset)

  if (!parents.length) return
  const [jsxElement, jsxText] = parents.slice(-2) // TS do not support array deconstruction operator?

  if (
    (isJsxOpeningElement(jsxElement) || isJsxSelfClosingElement(jsxElement)) &&
    isJsxText(jsxText)
  ) {
    const componentName = jsxElement.tagName.getText(sFile)
    // TODO: rename import
    console.log(componentName)
  }
}

const getNodeWithParentsAt = (node: Node, offset: number, initialParents?: Node[]) => {
  const parents: Node[] = initialParents || []
  let hasFind = false
  node.forEachChild(child => {
    const start = child.pos
    const end = child.end
    if (start <= offset && end >= offset) {
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
