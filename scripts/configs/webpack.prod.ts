import { Configuration } from 'webpack'
import merge from 'webpack-merge'
import TerserPlugin from 'terser-webpack-plugin'

import { baseWebpackConfig } from './webpack.base'

const prodConfig: Configuration = merge(baseWebpackConfig, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        extractComments: false,
      }),
    ],
  },
})

export { prodConfig }
