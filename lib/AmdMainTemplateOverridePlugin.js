/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/

const wrapper = require('./wrapper')

class AmdMainTemplateOverridePlugin {
  /**
   * @param {AmdMainTemplateOverridePluginOptions} options the plugin options
   */
  constructor (options) {
    if (!options || typeof options === 'string') {
      this.name = options
      this.requireAsWrapper = false
    } else {
      this.name = options.name
      this.requireAsWrapper = options.requireAsWrapper
    }
  }

  _wrapper (mainTemplate) {
    return wrapper({
      template: mainTemplate,
      name: this.name,
      requireAsWrapper: this.requireAsWrapper
    })
  }

  /**
   * @param {Compilation} compilation the compilation instance
   * @returns {void}
   */
  apply (compilation) {
    const { mainTemplate } = compilation
    mainTemplate.hooks.renderWithEntry.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === 'AmdMainTemplatePlugin') {
          // built-in AmdMainTemplatePlugin override
          tapInfo.fn = this._wrapper(mainTemplate)
        }
        return tapInfo
      }
    })
  }
}

module.exports = AmdMainTemplateOverridePlugin
