import decamelize from 'decamelize'
import fs from 'fs'
import path from 'path'
import markdown from 'remark-parse'
import unified from 'unified'
import stringify from 'remark-stringify'
import { Node, Parent, Position } from 'unist'
// @ts-ignore
import find from 'unist-util-find'

import { promisify } from 'util'

import { antdComponentMap, ComponentDocLocation, ComponentMapping } from './componentMap'
import { ANTD_GITHUB, STORAGE } from './constant'
import { ComponentsDoc, Props, Prop } from './type'

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

  public async buildComponentDefinition(): Promise<ComponentsDoc> {
    const defJson: ComponentsDoc = {}

    const promises = Object.entries(this.mapping).map(async ([componentName, loc]) => {
      const rawMd = await this.findComponentMd(componentName, loc)
      const mdAst = this.processor.parse(rawMd) as Parent
      const anchor = this.findAnchorNode(mdAst, loc.anchorBeforeProps)
      const table = this.findFirstTableAfterAnchor(mdAst, anchor) as Parent
      if (table === null) {
        throw Error(`failed to find table after ${componentName} - ${loc.anchorBeforeProps}`)
      }

      const componentDoc = this.extractDocFromTable(table)
      defJson[componentName] = componentDoc
    })

    await Promise.all(promises)
    return defJson
  }

  private composeProp(tableRow: Parent): Prop {
    if (tableRow.type !== 'tableRow')
      throw Error(`should pass tableRow, but receive ${tableRow.type}`)

    const [
      property,
      description,
      type,
      _default,
      version,
    ] = (tableRow as Parent).children.map(cell => this.stringifier.stringify(cell))

    const prop: Prop = {
      property,
      description,
      type,
      default: _default,
      version,
    }

    return prop
  }

  private extractDocFromTable(table: Parent) {
    const prosDoc: Props = {}
    // TODO: adapt dynamic table head
    const [tableHead, ...propRows] = table.children
    propRows.forEach(tableRow => {
      const prop = this.composeProp(tableRow as Parent)
      prosDoc[prop.property] = prop
    })

    return prosDoc
  }

  private findComponentMd(componentName: string, loc: ComponentDocLocation) {
    const docFolderName = decamelize(loc.docAlias || componentName)
    const docContentPath = path.resolve(
      __dirname,
      `${STORAGE.mdPath}/${docFolderName}/${ANTD_GITHUB.ZH_MD_NAME}`
    )

    return promisify(fs.readFile)(docContentPath, { encoding: 'utf-8' })
  }

  private findAnchorNode(mdAst: Node, anchorStr: string) {
    return find(mdAst, (node: Node) => {
      // anchor's type will not be `tableRow` :)
      if (node.type === 'tableRow') return false
      const stringifiedNode = this.stringifier.stringify(node)
      if (stringifiedNode === anchorStr) return true
      return false
    })
  }

  private isSamePosition = (pos1: Position, pos2: Position) => {
    return (
      pos1.start.line === pos2.start.line &&
      pos1.start.column === pos2.start.column &&
      pos1.start.offset === pos2.start.offset &&
      pos1.end.line === pos2.end.line &&
      pos1.end.column === pos2.end.column &&
      pos1.end.offset === pos2.end.offset
    )
  }

  private findFirstTableAfterAnchor = (parent: Parent, anchor: Node): Node | null => {
    let hasReachAnchor = false
    let hasFindTable = false
    let siblingTable: null | Node = null

    parent.children.forEach(child => {
      if (hasFindTable) return

      if (this.isSamePosition(child.position!, anchor.position!)) {
        hasReachAnchor = true
      }

      if (hasReachAnchor) {
        if (child.type === 'table') {
          hasFindTable = true
          siblingTable = child
        }
      }
    })

    return siblingTable
  }
}

const buildComponentsJson = async () => {
  const builder = new DefinitionBuilder(antdComponentMap)
  const json = await builder.buildComponentDefinition()
  // TODO: antd tag as its filename
  const writeFileP = promisify(fs.writeFile)
  writeFileP(path.resolve(__dirname, `${STORAGE.definitionPath}`), JSON.stringify(json, null, 2), {
    encoding: 'utf8',
  })
}

buildComponentsJson()
