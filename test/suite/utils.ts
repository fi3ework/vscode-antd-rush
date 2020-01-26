import vscode from 'vscode'
import path from 'path'

export function buildJsxTemplate(options: {
  componentName: string
  props: { name: string; value: string }[]
}): string {
  const { componentName, props } = options
  /**
   * <Button />
   *
   * <Button
   *   onClick={}
   * />
   */
  const propsStr = props.map(p => `  ${p.name}={${p.value}}`).join('\n')
  return `<${componentName}${propsStr}/>`
}

export function position(line: number, char: number) {
  return new vscode.Position(line, char)
}

export function range(startLine: number, startChar: number, endLine: number, endChar: number) {
  return new vscode.Range(position(startLine, startChar), position(endLine, endChar))
}

export function sameLineRange(line: number, startChar: number, endChar: number) {
  return new vscode.Range(position(line, startChar), position(line, endChar))
}

export function location(
  uri: vscode.Uri,
  startLine: number,
  startChar: number,
  endLine: number,
  endChar: number
) {
  return new vscode.Location(uri, range(startLine, startChar, endLine, endChar))
}

export function sameLineLocation(
  uri: vscode.Uri,
  line: number,
  startChar: number,
  endChar: number
) {
  return new vscode.Location(uri, sameLineRange(line, startChar, endChar))
}

export const getDocPath = (p: string) => {
  return path.resolve(__dirname, '../../test/suite/fixture', p)
}

export const getDocUri = (p: string) => {
  return vscode.Uri.file(getDocPath(p))
}

export const getDocUriAbsolute = (p: string) => {
  return vscode.Uri.file(p)
}

export const findAllIndexInString = (raw: string, targetChar: string): number[] => {
  const result: number[] = []
  ;[...raw].forEach((char, index) => {
    if (char === targetChar) result.push(index)
  })
  return result
}
