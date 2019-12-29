import decamelize from 'decamelize'
import fs from 'fs'
import path from 'path'
import markdown from 'remark-parse'
import unified from 'unified'
import { promisify } from 'util'

import { antdComponentMap, ComponentDocLocation, ComponentMapping } from './componentMap'
import { ANTD_GITHUB } from './constant'

const processor = unified().use(markdown)

// const res = processor.parse()

class DefinitionBuilder {
  private mapping: ComponentMapping

  constructor(mapping: ComponentMapping) {
    this.mapping = mapping
  }

  public buildComponentDefinition() {
    Object.entries(this.mapping).forEach(([componentName, loc]) => {
      const md = this.findComponentMd(componentName, loc)
    })
  }

  private async findComponentMd(componentName: string, loc: ComponentDocLocation) {
    const docFolderName = decamelize(loc.docAlias || componentName)
    const docContentPath = path.resolve(
      __dirname,
      `../doc/${docFolderName}/${ANTD_GITHUB.ZH_MD_NAME}`
    )

    const docRaw = await promisify(fs.readFile)(docContentPath, { encoding: 'utf-8' })
    this.findPropsTableFromDoc(docRaw, loc.anchorBeforeProps)
  }

  private findPropsTableFromDoc(docRaw: string, anchor: string) {
    console.log(docRaw)
  }
}

const builder = new DefinitionBuilder(antdComponentMap)
builder.buildComponentDefinition()
