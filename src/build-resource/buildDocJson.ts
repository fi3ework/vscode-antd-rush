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
import { ANTD_GITHUB, STORAGE } from './constant'
import { ComponentsDoc, ComponentsRawDoc, Prop, Props } from './type'
import { ResourceVersion, DocLanguage } from '../types'

export class DefinitionBuilder {
  public constructor(version: ResourceVersion, mapping: ComponentMapping) {
    this.version = version
    this.mapping = mapping
  }

  public async emitJson(language: DocLanguage) {
    return await this.buildComponentDefinition(language)
  }

  private langToMdName: { [k in DocLanguage]: string } = {
    en: ANTD_GITHUB.EN_MD_NAME,
    zh: ANTD_GITHUB.ZH_MD_NAME,
  }

  private version: ResourceVersion
  private mapping: ComponentMapping
  private processor = unified().use(markdown)
  private stringifier = unified()
    .use(markdown)
    .use(stringify)
    .data('settings', { looseTable: false })

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

      const anchors = this.findAnchorNode(mdAst, anchorProps)
      const tables: Parent[] = anchors
        .map((anchor) => this.findFirstTableAfterAnchor(mdAst, anchor) as Parent)
        .filter(Boolean)

      if (!tables.length) {
        console.error(
          `😭 failed to find table after ${anchorProps[0]} for component ${componentName}(${language})`
        )
        return
      }

      const componentDoc: Props = this.extractPropsFromTables(tables)
      propDefJson[componentName] = componentDoc
      rawTableJson[componentName] = tables.map((table) => this.stringifier.stringify(table))
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
      version = '',
    ] = (tableRow as Parent).children.map((cell) => this.stringifier.stringify(cell))

    const prop: Prop = {
      property,
      description,
      type,
      default: _default,
      version,
    }

    return prop
  }

  private extractPropsFromTables(tables: Parent[]) {
    const prosDoc: Props = {}
    tables.forEach((table) => {
      const [tableHead, ...propRows] = table.children
      // check is valid table
      // if ((tableHead as Parent).children.length <= 3) return

      propRows.forEach((tableRow) => {
        const prop = this.composeProp(tableRow as Parent)
        prosDoc[prop.property] = prop
      })
    })

    return prosDoc
  }

  private findComponentMd(componentName: string, loc: ComponentDocLocation, language: DocLanguage) {
    const mdName = this.langToMdName[language]
    const docFolderName = decamelize(loc.docAlias || componentName, '-')
    const docContentPath = STORAGE.getMarkdownPath(docFolderName, mdName, this.version)

    return promisify(fs.readFile)(docContentPath, { encoding: 'utf-8' })
  }

  private findAnchorNode(mdAst: Node, anchors: string[]): Node[] {
    const anchorNodes: Node[] = []
    find(mdAst, (node: Node) => {
      // anchor's type will not be `tableRow`
      if (node.type === 'tableRow') return false
      const stringifiedNode = this.stringifier.stringify(node)
      const isMatch = anchors.forEach((anchor) => {
        const anchorReg = new RegExp('^' + anchor + '$')
        if (!!stringifiedNode.match(anchorReg)) anchorNodes.push(node)
      })
      return isMatch
    })
    return anchorNodes
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

    parent.children.forEach((child) => {
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
