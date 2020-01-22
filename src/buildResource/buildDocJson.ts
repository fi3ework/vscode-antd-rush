import decamelize from 'decamelize'
import fs from 'fs'
import path from 'path'
import markdown from 'remark-parse'
import stringify from 'remark-stringify'
import unified from 'unified'
import { Node, Parent, Position } from 'unist'
// @ts-ignore
import find from 'unist-util-find'
import { promisify } from 'util'

import { ComponentDocLocation, ComponentMapping } from './componentMap'
import { ANTD_GITHUB, STORAGE, DocLanguage } from './constant'
import { ComponentsDoc, ComponentsRawDoc, Prop, Props } from './type'

export class DefinitionBuilder {
  public constructor(mapping: ComponentMapping) {
    this.mapping = mapping
  }

  public async emitJson(language: DocLanguage) {
    return await this.buildComponentDefinition(language)
  }

  private langToMdName: { [k in DocLanguage]: string } = {
    en: ANTD_GITHUB.EN_MD_NAME,
    zh: ANTD_GITHUB.ZH_MD_NAME,
  }
  private mapping: ComponentMapping
  private processor = unified().use(markdown)
  private stringifier = unified()
    .use(markdown)
    .use(stringify)
    .data('settings', { looseTable: true })

  private async buildComponentDefinition(
    language: DocLanguage
  ): Promise<{
    propDefJson: ComponentsDoc
    rawTableJson: ComponentsRawDoc
  }> {
    const propDefJson: ComponentsDoc = {}
    const rawTableJson: ComponentsRawDoc = {}

    const promises = Object.entries(this.mapping).map(async ([componentName, loc]) => {
      const rawMd = await this.findComponentMd(componentName, loc, language)
      const mdAst = this.processor.parse(rawMd) as Parent
      // `loc.anchorBeforeProps` can be string[], and string can be regexp
      const anchorProps = Array.isArray(loc.anchorBeforeProps)
        ? loc.anchorBeforeProps
        : [loc.anchorBeforeProps]
      const anchor = this.findAnchorNode(mdAst, anchorProps)
      const table = this.findFirstTableAfterAnchor(mdAst, anchor) as Parent
      if (table === null) {
        console.error(
          `😭 failed to find table after ${anchorProps[0]} for component ${componentName}(${language})`
        )
        return
      }

      const componentDoc: Props = this.extractPropsFromTable(table)
      propDefJson[componentName] = componentDoc
      rawTableJson[componentName] = this.stringifier.stringify(table)
    })

    await Promise.all(promises)
    return { propDefJson, rawTableJson }
  }

  private composeProp(tableRow: Parent): Prop {
    if (tableRow.type !== 'tableRow')
      throw Error(`should pass tableRow, but receive ${tableRow.type}`)

    const [
      property,
      description,
      type,
      _default,
      // TODO: AutoComplete.defaultValue missing default
      version = '',
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

  private extractPropsFromTable(table: Parent) {
    const prosDoc: Props = {}
    // TODO: adapt dynamic table head, bad case: https://ant.design/components/breadcrumb-cn/
    const [tableHead, ...propRows] = table.children
    propRows.forEach(tableRow => {
      const prop = this.composeProp(tableRow as Parent)
      prosDoc[prop.property] = prop
    })

    return prosDoc
  }

  private findComponentMd(componentName: string, loc: ComponentDocLocation, language: DocLanguage) {
    const mdName = this.langToMdName[language]
    const docFolderName = decamelize(loc.docAlias || componentName, '-')
    const docContentPath = path.resolve(__dirname, `${STORAGE.mdPath}/${docFolderName}/${mdName}`)

    return promisify(fs.readFile)(docContentPath, { encoding: 'utf-8' })
  }

  private findAnchorNode(mdAst: Node, anchors: string[]) {
    return find(mdAst, (node: Node) => {
      // anchor's type will not be `tableRow`
      if (node.type === 'tableRow') return false
      const stringifiedNode = this.stringifier.stringify(node)
      const isMatch = anchors.some(anchor => {
        const anchorReg = new RegExp('^' + anchor + '$')
        return !!stringifiedNode.match(anchorReg)
      })
      return isMatch
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
    const anchorPosition = anchor?.position
    if (!anchorPosition) return null

    let hasReachAnchor = false
    let hasFindTable = false
    let siblingTable: null | Node = null

    parent.children.forEach(child => {
      if (hasFindTable) return

      if (this.isSamePosition(child.position!, anchorPosition)) {
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
