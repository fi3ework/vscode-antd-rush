import { Configuration } from 'webpack'
import merge from 'webpack-merge'

import { baseWebpackConfig } from './webpack.base'

const devConfig: Configuration = merge(baseWebpackConfig, {
  mode: 'development',
  devtool: 'source-map',
})

export { devConfig }
