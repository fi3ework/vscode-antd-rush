import { addHandlerPrefix, antdHeroErrorMsg } from './utils'
import { FunctionParam } from './ast'

/**
 * Fill handler template with parameters and its type
 */
export const composeHandlerString = (
  handlerName: string,
  params: FunctionParam[],
  indent: number,
  type: 'class' | 'functional'
) => {
  const paramsText = params.map(p => p.text).join(', ')
  // TODO: ts param type
  if (type === 'class') {
    return (
      '\n\n' +
      withIndent(
        `${addHandlerPrefix(handlerName)} = (${paramsText}) => {

}`,
        indent
      )
    )
  }
  if (type === 'functional') {
    return withIndent(
      '\n\n' +
        `const ${addHandlerPrefix(handlerName)} = useCallback((${paramsText}) => {

})`,
      indent
    )
  }
  throw Error(antdHeroErrorMsg(`should not accept component type of ${type}`))
}

/**
 * Add indent to string at start at each line
 */
export const withIndent = (raw: string, indent: number): string => {
  return raw
    .split('\n')
    .map(line => ' '.repeat(indent) + line)
    .join('\n')
}
