import { transformFromAst } from '@babel/core'
import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

export const readAst = (documentStr: string) => {
  console.log(documentStr)
  console.log(parser.parse)
  const ast = parser.parse('class Example {}', {
    // parse in strict mode and allow module declarations
    sourceType: 'module',
    plugins: [
      // enable jsx and flow syntax
      'jsx',
      'flow',
    ],
  })
}
