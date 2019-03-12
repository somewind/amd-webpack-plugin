/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/

const { ConcatSource } = require('webpack-sources')
const Template = require('webpack/lib/Template')

/**
 * amd wrapper
 * @param {*} options
 */
function wrapper ({
  template,
  name,
  wrapper
}) {
  return (source, chunk, hash) => {
    const externals = chunk.getModules()
      .filter(m => m.external && (typeof m.request === 'object' ? !!m.request.amd : !!m.request))

    const externalDependencies = externals.map(m => (typeof m.request === 'object' ? m.request.amd : m.request))
    // add split chunks
    Array.from(chunk.groupsIterable)[0]
      .chunks.filter(c => c !== chunk && !c.hasRuntime()) // not the current and has no runtime
      .map(c => c.name)
      .forEach(name => externalDependencies.push(name))

    const externalsDepsArray = JSON.stringify(externalDependencies)
    const externalsArguments = externals
      .map(
        m => `__WEBPACK_EXTERNAL_MODULE_${Template.toIdentifier(`${m.id}`)}__`
      )
      .join(', ')

    wrapper = wrapper || 'define'

    if (name) {
      const realName = template.getAssetPath(name, {
        hash,
        chunk
      })

      return new ConcatSource(
        `${wrapper}(${JSON.stringify(
          realName
        )}, ${externalsDepsArray}, function(${externalsArguments}) { return `,
        source,
        '});'
      )
    }

    if (externalDependencies.length !== 0) {
      return new ConcatSource(
        `${wrapper}(${externalsDepsArray}, function(${externalsArguments}) { return `,
        source,
        '});'
      )
    }
    return new ConcatSource(`${wrapper}(function() { return `, source, '});')
  }
}

module.exports = wrapper
