/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/
const path = require('path')

function modifySource(source, reg, replaceValue) {
  if (!source || !source.children) {
    return
  }
  for(let i = 0; i < source.children.length; i++) {
    const c = source.children[i]
    if (typeof c === 'string') {
      if (reg.test(c)) {
        source.children[i] = c.replace(reg, replaceValue)
        return
      }
    } else {
      modifySource(c, reg, replaceValue)
    }
  }
}

module.exports = class ChunkAssetModifyPlugin {

  constructor(options) {
    this.wrapper = options.wrapper
  }

  /**
   * @param {Compilation} compilation the compilation instance
   * @returns {void}
   */
  apply(compilation) {
    // fix chunkFilename setting did not take effect
    compilation.hooks.chunkAsset.tap('ChunkAssetModifyPlugin', (chunk, filename) => {
      if (!chunk.hasRuntime() && chunk.chunkReason && chunk.chunkReason.startsWith('split chunk')) {
        const { assets } = compilation
        const wrapper = this.wrapper || 'define'
        chunk.groupsIterable.forEach(group => {
          const ctor = Reflect.getPrototypeOf(group).constructor.toString()
          if (ctor && ctor.startsWith('class Entrypoint')) {
            const entryChunk = group.chunks.find(c => c.hasRuntime())
            if (entryChunk) {
              const [entryFilename] = entryChunk.files
              const source = assets[entryFilename]
              if (source) {
                // remove cache
                const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.js'))
                delete source._cachedSource
                modifySource(
                  source._source, 
                  new RegExp(`^(${wrapper}\\([\\[a-z0-9\", .\/]*)(${chunk.name})"`), 
                  `$1${nameWithoutExt}"`
                )
              }
            }
          }
        })
      }
    })
  }
}
