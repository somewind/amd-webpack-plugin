/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/

class AmdWebpackPlugin {
  /**
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply (compiler) {
    const { output: { library, libraryTarget }, externals } = compiler.options

    const options = {
      name: library,
      requireAsWrapper: libraryTarget === 'amd-require',
      libraryTarget,
      externals
    }
    const ExternalsOverridePlugin = require('./ExternalsOverridePlugin')
    new ExternalsOverridePlugin(options).apply(compiler)

    compiler.hooks.thisCompilation.tap('AmdWebpackPlugin', compilation => {
      const AmdMainTemplateOverridePlugin = require('./AmdMainTemplateOverridePlugin')
      const JsonpChunkTemplateOverridePlugin = require('./JsonpChunkTemplateOverridePlugin')
      if (library && typeof library !== 'string') {
        throw new Error('library name must be a string for amd target')
      }
      new AmdMainTemplateOverridePlugin(options).apply(compilation)
      new JsonpChunkTemplateOverridePlugin(options).apply(compilation)
    })
  }
}

module.exports = AmdWebpackPlugin
