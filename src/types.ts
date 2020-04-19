/**
 * Available language
 */
export type DocLanguage = 'en' | 'zh'

/**
 * Content for a props hint
 */
export interface Prop {
  property: string
  description: string
  type: string
  default: string
  version: string
}

/**
 * Props hints
 */
export interface Props {
  [k: string]: Prop
}

/**
 * Components props hints
 */
export interface ComponentsDoc {
  [k: string]: Props
}

/**
 * Components table hints
 */
export interface ComponentsRawDoc {
  [k: string]: string[]
}

/**
 * Multiple language of components props hints
 */
export type PropsJson = {
  [k in DocLanguage]: ComponentsDoc
}

/**
 * Multiple language of components table hints
 */
export type ComponentsJson = {
  [k in DocLanguage]: ComponentsRawDoc
}

/**
 * Contains everything, different versions, different languages, props hints and table hints.
 */
export type VersionJson = {
  [k in ResourceVersion]: {
    propsJson: PropsJson
    componentJson: ComponentsJson
  }
}

/**
 * ===== start =====
 * https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/core/position.ts
 */
import { Position, Uri, Range } from 'vscode'

/**
 * Major version of antd that resource based on
 */
export type ResourceVersion = 'v3' | 'v4'

/**
 * A position in the editor. This interface is suitable for serialization.
 */
export interface IPosition {
  /**
   * line number (starts at 1)
   */
  readonly lineNumber: number
  /**
   * column (the first character in a line is between column 1 and column 2)
   */
  readonly column: number
}

export function positionToIPosition(position: Position): IPosition {
  return { lineNumber: position.line + 1, column: position.character + 1 }
}

/**
 * A range in the editor. This interface is suitable for serialization.
 */
export interface IRange {
  /**
   * Line number on which the range starts (starts at 1).
   */
  readonly startLineNumber: number
  /**
   * Column on which the range starts in line `startLineNumber` (starts at 1).
   */
  readonly startColumn: number
  /**
   * Line number on which the range ends.
   */
  readonly endLineNumber: number
  /**
   * Column on which the range ends in line `endLineNumber`.
   */
  readonly endColumn: number
}

export interface ILocationLink {
  /**
   * A range to select where this link originates from.
   */
  originSelectionRange?: IRange

  /**
   * The target uri this link points to.
   */
  uri: Uri

  /**
   * The full range this link points to.
   */
  range: IRange

  /**
   * A range to select this link points to. Must be contained
   * in `LocationLink.range`.
   */
  targetSelectionRange?: IRange
}
/**
 * ==== end =====
 */
