import { Position, Uri, Range } from 'vscode'

// from https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/core/position.ts
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

export function positionToModePosition(position: Position): IPosition {
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

export function modeRangeToRange(range: IRange): Range {
  return new Range(
    range.startLineNumber - 1,
    range.startColumn - 1,
    range.endLineNumber - 1,
    range.endColumn - 1
  )
}
