import { antdRushErrorMsg } from './utils'
import { FunctionParam } from './ast'
import { __intl, DocLanguage, LabelType } from './build-resource/constant'
import { workspace } from 'vscode'

/**
 * Fill handler template with parameters and its type
 */
export const composeHandlerString = (
  fullHandlerName: string,
  params: FunctionParam[],
  indent: number,
  type: 'class' | 'functional'
) => {
  const paramsText = params.map((p) => p.text).join(', ')
  // TODO: inset param types in ts
  if (type === 'class') {
    return (
      '\n\n' +
      withIndent(
        `${fullHandlerName} = (${paramsText}) => {
${' '.repeat(indent)}
}\n`,
        indent
      )
    )
  }
  if (type === 'functional') {
    return withIndent(
      '\n\n' +
        `const ${fullHandlerName} = useCallback((${paramsText}) => {\n${' '.repeat(
          indent
        )}\n}, [])\n`,
      indent
    )
  }
  throw Error(antdRushErrorMsg(`should not accept component type of ${type}`))
}

/**
 * Add indent to string at start at each line
 */
export const withIndent = (raw: string, indent: number): string => {
  return raw
    .split('\n')
    .map((line) => ' '.repeat(indent) + line)
    .join('\n')
}

export const addHandlerPrefix = (handlerName: string): string => {
  const handlerPrefix = workspace.getConfiguration().get('antdRush.handlerPrefix')
  const camelizedHandlerName = handlerName.slice(0, 1).toUpperCase() + handlerName.slice(1)
  return `${handlerPrefix}${camelizedHandlerName}`
}
