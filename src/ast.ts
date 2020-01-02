// import { transformFromAst } from '@babel/core'
// import * as parser from '@babel/parser'
// import traverse from '@babel/traverse'
// import * as t from '@babel/types'
import * as ts from 'typescript'
import { TextDocument } from 'vscode'

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
