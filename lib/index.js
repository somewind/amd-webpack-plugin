/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/
const webpack = require('webpack')

class AmdWebpackPlugin {
  constructor ({
    wrapper,
    hashedModuleIds
  } = {}) {
    this.wrapper = wrapper
    this.hashedModuleIds = hashedModuleIds
  }

  /**
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply (compiler) {
    const { output: { library, libraryTarget }, externals } = compiler.options

    const options = {
      name: library,
      libraryTarget,
      externals
    }

    if (this.wrapper) {
      options.wrapper = this.wrapper
    } else if (libraryTarget === 'amd-require') {
      options.wrapper = 'require'
    } else {
      options.wrapper = 'define'
    }

    // use root external
    const ExternalsOverridePlugin = require('./ExternalsOverridePlugin')
    new ExternalsOverridePlugin(options).apply(compiler)

    // inject amd modules
    compiler.hooks.thisCompilation.tap('AmdWebpackPlugin', compilation => {
      const AmdMainTemplateOverridePlugin = require('./AmdMainTemplateOverridePlugin')
      const JsonpChunkTemplateOverridePlugin = require('./JsonpChunkTemplateOverridePlugin')
      const JsonpMainTemplateBootstrapOverridePlugin = require('./JsonpMainTemplateBootstrapOverridePlugin')
      if (library && typeof library !== 'string') {
        throw new Error('library name must be a string for amd target')
      }
      // entry chunk
      new AmdMainTemplateOverridePlugin(options).apply(compilation)

      // split chunk
      new JsonpChunkTemplateOverridePlugin(options).apply(compilation)

      // bootstrap override
      new JsonpMainTemplateBootstrapOverridePlugin(options).apply(compilation)
    })

    // override chunkIds moduleIds
    // must be named!
    if (compiler.options.mode === 'production') {
      compiler.options.optimization.chunkIds = 'named'
      if (this.hashedModuleIds !== false) {
        new webpack.HashedModuleIdsPlugin(this.hashedModuleIds || {
          hashFunction: 'md4',
          hashDigest: 'base64',
          hashDigestLength: 16
        }).apply(compiler)
      }
    }
  }
}

module.exports = AmdWebpackPlugin
