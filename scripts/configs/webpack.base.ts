import { resolve } from 'path'
import { Configuration } from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'

const projectRoot = resolve(__dirname, '../../src')
const distDir = resolve(__dirname, '../../dist')

const baseWebpackConfig: Configuration = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  entry: resolve(projectRoot, './extension.ts'), // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: resolve(distDir),
    libraryTarget: 'commonjs2',
    filename: 'extension.js',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js', 'json'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: resolve(projectRoot, 'tsconfig.json'),
        },
      },
    ],
  },
  plugins: [new FriendlyErrorsPlugin(), new CleanWebpackPlugin(), new HardSourceWebpackPlugin()],
}

export { baseWebpackConfig }
