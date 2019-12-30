import decamelize from 'decamelize'
import fs from 'fs'
import path from 'path'
import markdown from 'remark-parse'
import unified from 'unified'
import stringify from 'remark-stringify'
import { Node } from 'unist'
// @ts-ignore
import find from 'unist-util-find'

import { promisify } from 'util'

import { antdComponentMap, ComponentDocLocation, ComponentMapping } from './componentMap'
import { ANTD_GITHUB } from './constant'

class DefinitionBuilder {
  private mapping: ComponentMapping
  private processor = unified().use(markdown)
  private stringifier = unified()
    .use(markdown)
    .use(stringify)
    .data('settings', { looseTable: true })

  constructor(mapping: ComponentMapping) {
    this.mapping = mapping
  }

  public buildComponentDefinition() {
    Object.entries(this.mapping).forEach(async ([componentName, loc]) => {
      const rawMd = await this.findComponentMd(componentName, loc)
      const table = this.findPropsTableFromDoc(rawMd, loc.anchorBeforeProps)
    })
  }

  private async findComponentMd(componentName: string, loc: ComponentDocLocation) {
    const docFolderName = decamelize(loc.docAlias || componentName)
    const docContentPath = path.resolve(
      __dirname,
      `../doc/${docFolderName}/${ANTD_GITHUB.ZH_MD_NAME}`
    )

    return promisify(fs.readFile)(docContentPath, { encoding: 'utf-8' })
  }

  private findPropsTableFromDoc(rawMd: string, anchorStr: string) {
    const mdAst = this.processor.parse(rawMd)
    const anchorNode = find(mdAst, (node: Node) => {
      // anchor's type will not be `tableRow` :)
      if (node.type === 'tableRow') return

      const stringifiedNode = this.stringifier.stringify(node)
      if (stringifiedNode === anchorStr) {
        console.log(anchorStr)
      }
    })
  }
}

const builder = new DefinitionBuilder(antdComponentMap)
builder.buildComponentDefinition()
