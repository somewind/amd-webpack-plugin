/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/

const ExternalModuleFactoryOverridePlugin = require('./ExternalModuleFactoryOverridePlugin')

class ExternalsOverridePlugin {
  constructor ({ libraryTarget, externals }) {
    this.libraryTarget = libraryTarget
    this.externals = externals
  }

  apply (compiler) {
    compiler.hooks.compile.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === 'ExternalsPlugin') {
          // built-in ExternalsPlugin override
          tapInfo.fn = ({ normalModuleFactory }) => {
            new ExternalModuleFactoryOverridePlugin(this.libraryTarget, this.externals).apply(
              normalModuleFactory
            )
          }
        }
        return tapInfo
      }
    })
  }
}

module.exports = ExternalsOverridePlugin
