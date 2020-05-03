// ref: https://github.com/tjx666/vscode-extension-boilerplate

import webpack from 'webpack'

import { devConfig } from './configs/webpack.dev'
import { prodConfig } from './configs/webpack.prod'

const isProd = process.env.NODE_ENV !== 'development'
const compiler = webpack(isProd ? prodConfig : devConfig)

compiler.run((error) => {
  const compileError: Error & { details?: string } = error

  if (error) {
    console.error(error)
    compileError.details && console.error(compileError.details)
    return
  }
})
