import {
  CancellationToken,
  commands,
  Hover,
  Location,
  MarkdownString,
  Position,
  TextDocument,
  workspace,
  Uri,
  window,
} from 'vscode'
import { getClosetAntdJsxElementNode, getContainerSymbolAtLocation } from './ast'
import { antdComponentMap } from './buildResource/componentMap'
import { __intl, DocLanguage } from './buildResource/constant'
import { ComponentsDoc, ComponentsRawDoc } from './buildResource/type'
import _antdDocJson from './definition.json'
import _rawTableJson from './raw-table.json'
import * as vscode from 'vscode'
import {
  antdRushErrorMsg,
  composeCardMessage,
  composeDocLink,
  matchAntdModule,
  matchNodeModules,
  transformConfigurationLanguage,
} from './utils'

const antdDocJson: { [k in DocLanguage]: ComponentsDoc } = _antdDocJson
const rawTableJson: { [k in DocLanguage]: ComponentsRawDoc } = _rawTableJson

export class HoverProvider {
  private document!: TextDocument
  private position!: Position
  private token!: CancellationToken
  private language: DocLanguage = transformConfigurationLanguage(
    workspace.getConfiguration().get('antdRush.language')
  )

  public constructor(document: TextDocument, position: Position, token: CancellationToken) {
    this.document = document
    this.position = position
    this.token = token
  }

  public provideHover = async () => {
    const { document, position } = this

    const range = document.getWordRangeAtPosition(position)
    const propText = document.getText(range)

    const definitionLoc = await this.getDefinitionInAntdModule()
    if (!definitionLoc) return

    const interaceName = definitionLoc.text
    const nodeType = this.getAstNodeType(interaceName)

    /**
     * props hover card
     */
    if (nodeType.type === 'props') {
      const antdComponentName = await getClosetAntdJsxElementNode(document, position)
      if (!antdComponentName) return
      const fuzzyComponentName = this.fuzzySearchComponentMapping(antdComponentName)
      if (!fuzzyComponentName) return
      const matchedComponent = antdDocJson[this.language][fuzzyComponentName]
      if (!matchedComponent)
        throw antdRushErrorMsg(`did not match component for ${fuzzyComponentName}`)

      const desc = matchedComponent[propText].description
      const type = matchedComponent[propText].type
      const version = matchedComponent[propText].version
      const defaultValue = matchedComponent[propText].default

      const md = composeCardMessage(
        [
          { label: 'description', value: desc },
          { label: 'type', value: type },
          { label: 'default', value: defaultValue },
          { label: 'version', value: version },
        ],
        this.language
      )

      return new Hover(md)
    }

    /**
     * component hover card
     */
    if (nodeType.type === 'component') {
      const definitionPath = definitionLoc.location.uri.path

      const antdMatched = matchAntdModule(definitionPath)

      if (antdMatched === null) return // return if not from antd
      const { componentFolder } = antdMatched

      const comName = this.tryMatchComponentName(interaceName, componentFolder)
      if (!comName) return

      const matchedComponent = antdComponentMap[comName]

      if (!matchedComponent) throw antdRushErrorMsg(`did not match component for ${comName}`)

      const enDocLink = `[EN](${composeDocLink(componentFolder, 'en')})`
      const zhDocLink = `[中文](${composeDocLink(componentFolder, 'zh')})`
      const docLinks =
        this.language === 'en' ? `${enDocLink} | ${zhDocLink}` : `${zhDocLink} | ${enDocLink}`

      const headMd = new MarkdownString(
        `**${comName}** ${__intl('componentHint', this.language)} \[ ${docLinks} \]`
      )

      const tablesMd = rawTableJson[this.language][comName].map(table => {
        return new MarkdownString(table)
      })

      return new Hover([headMd, ...tablesMd])
    }

    return
  }

  private normalizeName = (raw: string): string =>
    raw
      .replace(/\./g, '')
      .replace(/\-/g, '')
      .toLowerCase()

  private fuzzySearchComponentMapping = (fuzzyName: string): string | null => {
    const exactKey = Object.keys(antdComponentMap).find(
      com => this.normalizeName(com) === this.normalizeName(fuzzyName)
    )
    if (!exactKey) return null
    return exactKey
  }

  private tryMatchComponentName = (symbolName: string, libName: string): string | null => {
    // 1. try exact match
    const exactKey = Object.keys(antdComponentMap).find(
      com => this.normalizeName(com) === this.normalizeName(symbolName)
    )
    if (exactKey) return exactKey

    // 2. try exact match folder name
    const libKey = Object.keys(antdComponentMap).find(
      com => this.normalizeName(com) === this.normalizeName(libName)
    )
    if (libKey) return libKey

    // 3. try fuzzy match
    const fuzzyKey = Object.keys(antdComponentMap).find(
      com => this.normalizeName(com) === this.normalizeName(libName + symbolName)
    )

    if (!fuzzyKey) return null
    return fuzzyKey
  }

  private getDefinitionInAntdModule = async () => {
    const { document, position } = this
    const [definitionUnderAntd, typeDefinition] = await Promise.all([
      await this.recursiveFindDefinition(document, position),
      await this.findTypeDefinition(document, position),
    ])

    // TODO: difference between definition and type definition
    if (!definitionUnderAntd) console.info('[antd-rush]: get more than one definition')

    if (typeDefinition) {
      return typeDefinition
    }

    if (definitionUnderAntd) {
      return definitionUnderAntd
    }

    return null
  }

  private findTypeDefinition = async (
    document: TextDocument,
    position: Position
  ): Promise<{ text: string; location: Location } | null> => {
    const typeDefinitions = await commands
      .executeCommand<Location[]>('vscode.executeTypeDefinitionProvider', document.uri, position)
      .then(refs => refs?.filter(ref => !!matchAntdModule(ref.uri.path)))

    const refs = await commands.executeCommand<Location[]>(
      'vscode.executeReferenceProvider',
      document.uri,
      position
    )

    if (!typeDefinitions?.length) return null

    const typeDefinition = typeDefinitions[0]
    return await this.extractTextFromDefinition(typeDefinition, refs)
  }

  private recursiveFindDefinition = async (
    document: TextDocument,
    position: Position
  ): Promise<{ text: string; location: Location } | null> => {
    const defPromise = commands.executeCommand<Location[]>(
      'vscode.executeDefinitionProvider',
      document.uri,
      position
    )

    const refPromise = commands.executeCommand<Location[]>(
      'vscode.executeReferenceProvider',
      document.uri,
      position
    )

    const [defs, refs] = await Promise.all([defPromise, refPromise])

    const condition = (loc: Location) => {
      return !!matchAntdModule(loc.uri.path)
    }

    if (!defs) return null

    const antdDef = defs.filter(condition)[0]
    const userlandLineDef = defs.filter(d => !matchNodeModules(d.uri.path))[0]

    if (antdDef) {
      if (antdDef.range.start.line === antdDef.range.end.line) {
        const antdDefRangeLoc = refs?.find(ref => {
          return antdDef.range.contains(ref.range)
        })
        if (!antdDefRangeLoc) return null
        const _doc = await vscode.workspace.openTextDocument(antdDef.uri)
        const text = _doc
          .lineAt(antdDefRangeLoc.range.start.line)
          .text.slice(antdDefRangeLoc.range.start.character, antdDefRangeLoc.range.end.character)

        return { text, location: antdDefRangeLoc }
      } else {
        const interfaceName = await getContainerSymbolAtLocation(antdDef)
        if (!interfaceName) return null
        return { text: interfaceName, location: antdDef }
      }
    } else if (userlandLineDef) {
      let doc = await vscode.workspace.openTextDocument(userlandLineDef.uri)
      const userlandRangeDef = await this.extractTextFromDefinition(userlandLineDef, refs)
      if (!userlandRangeDef) return null

      const nextDef = await this.recursiveFindDefinition(doc, userlandRangeDef.location.range.end)
      return nextDef
    }
    return null
  }

  private extractTextFromDefinition = async (
    def: Location,
    refs: Location[] | undefined
  ): Promise<{ text: string; location: Location } | null> => {
    let doc = await vscode.workspace.openTextDocument(def.uri)
    const rangeInDef =
      refs?.find(ref => {
        return ref.uri.path === doc.uri.path && ref.range.contains(ref.range)
      }) || def

    const text = doc
      .lineAt(rangeInDef.range.start.line)
      .text.slice(rangeInDef.range.start.character, rangeInDef.range.end.character)

    return { text, location: rangeInDef }
  }

  private getAstNodeType = (name: string): { type: 'component' | 'props' } => {
    return {
      type: name[0].toUpperCase() !== name[0] ? 'props' : 'component',
    }
  }
}
