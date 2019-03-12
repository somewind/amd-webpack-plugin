/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/

const { ConcatSource } = require('webpack-sources')
const wrapper = require('./wrapper')

const getEntryInfo = chunk => [chunk.entryModule].filter(Boolean).map(m => [m.id].concat(
  Array.from(chunk.groupsIterable)[0]
    .chunks.filter(c => c !== chunk)
    .map(c => c.id)
))

class JsonpChunkTemplateOverridePlugin {
  /**
   * @param {JsonpChunkTemplateOverridePluginOptions} options the plugin options
   */
  constructor (options) {
    if (!options || typeof options === 'string') {
      this.name = options
    } else {
      this.name = options.name
      this.wrapper = options.wrapper
    }
  }

  _wrapper (chunkTemplate) {
    return (source, chunk) => {
      const { jsonpFunction, globalObject } = chunkTemplate.outputOptions
      const newSource = new ConcatSource()
      const prefetchChunks = chunk.getChildIdsByOrders().prefetch
      newSource.add(
        `(${globalObject}[${JSON.stringify(
          jsonpFunction
        )}] = ${globalObject}[${JSON.stringify(
          jsonpFunction
        )}] || []).push([${JSON.stringify(chunk.ids)},`
      )
      newSource.add(source)
      const entries = getEntryInfo(chunk)
      if (entries.length > 0) {
        newSource.add(`,${JSON.stringify(entries)}`)
      } else if (prefetchChunks && prefetchChunks.length) {
        newSource.add(',0')
      }

      if (prefetchChunks && prefetchChunks.length) {
        newSource.add(`,${JSON.stringify(prefetchChunks)}`)
      }
      newSource.add('])')

      if (!Array.from(chunk.groupsIterable)[0].isInitial()) {
        return newSource
      }

      return wrapper({
        template: chunkTemplate,
        name: this.name,
        wrapper: this.wrapper
      })(newSource, chunk)
    }
  }

  /**
   * @param {Compilation} compilation the compilation instance
   * @returns {void}
   */
  apply (compilation) {
    const { chunkTemplate } = compilation
    chunkTemplate.hooks.render.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === 'JsonpChunkTemplatePlugin') {
          // built-in JsonpChunkTemplatePlugin override
          tapInfo.fn = this._wrapper(chunkTemplate)
        }
        return tapInfo
      }
    })
  }
}
module.exports = JsonpChunkTemplateOverridePlugin
