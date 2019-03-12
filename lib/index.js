/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/

class AmdWebpackPlugin {
  constructor ({
    wrapper
  } = {}) {
    this.wrapper = wrapper
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
  }
}

module.exports = AmdWebpackPlugin
