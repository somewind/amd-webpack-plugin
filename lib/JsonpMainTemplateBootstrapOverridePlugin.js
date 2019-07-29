/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author somewind https://github.com/somewind
*/
const Template = require('webpack/lib/Template')

class JsonpMainTemplateBootstrapOverridePlugin {
  _wrapper (mainTemplate) {
    const needChunkLoadingCode = chunk => {
      for (const chunkGroup of chunk.groupsIterable) {
        if (chunkGroup.chunks.length > 1) return true
        if (chunkGroup.getNumberOfChildren() > 0) return true
      }
      return false
    }
    const needEntryDeferringCode = chunk => {
      for (const chunkGroup of chunk.groupsIterable) {
        if (chunkGroup.chunks.length > 1) return true
      }
      return false
    }
    const needPrefetchingCode = chunk => {
      const allPrefetchChunks = chunk.getChildIdsByOrdersMap(true).prefetch
      return allPrefetchChunks && Object.keys(allPrefetchChunks).length
    }
    return (source, chunk, hash) => {
      if (needChunkLoadingCode(chunk)) {
        // add split chunks
        const externalDependencies = Array.from(chunk.groupsIterable)[0]
          .chunks.filter(c => c !== chunk && !c.hasRuntime()) // not the current and has no runtime
          .map(c => c.name)
        // and import() chunks
        const chunkMaps = chunk.getChunkMaps()
        if (chunkMaps && chunkMaps.name) {
          const asyncChunkNames = Object.keys(chunkMaps.name)
          externalDependencies.push.apply(externalDependencies, asyncChunkNames)
        }
        const externalsDepsArray = JSON.stringify(externalDependencies)

        const withDefer = needEntryDeferringCode(chunk)
        const withPrefetch = needPrefetchingCode(chunk)
        return Template.asString([
          source,
          '',
          '// install a JSONP callback for chunk loading',
          'function webpackJsonpCallback(data) {',
          Template.indent([
            'var chunkIds = data[0];',
            'var moreModules = data[1];',
            `var externalDependencies = ${externalsDepsArray};`,
            withPrefetch ? 'var prefetchChunks = data[3] || [];' : '',
            '// add "moreModules" to the modules object,',
            '// then flag all "chunkIds" as loaded and fire callback',
            'var moduleId, chunkId, i = 0, resolves = [];',
            'for(;i < chunkIds.length; i++) {',
            Template.indent([
              'chunkId = chunkIds[i];',
              'if (!externalDependencies.includes(chunkId)) {',
              Template.indent('if(parentJsonpFunction) parentJsonpFunction(data);'),
              Template.indent('return'),
              '}',
              'if(installedChunks[chunkId]) {',
              Template.indent('resolves.push(installedChunks[chunkId][0]);'),
              '}',
              'installedChunks[chunkId] = 0;'
            ]),
            '}',
            'for(moduleId in moreModules) {',
            Template.indent([
              'if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {',
              Template.indent(
                mainTemplate.renderAddModule(
                  hash,
                  chunk,
                  'moduleId',
                  'moreModules[moduleId]'
                )
              ),
              '}'
            ]),
            '}',
            'if(parentJsonpFunction) parentJsonpFunction(data);',
            withPrefetch
              ? Template.asString([
                '// chunk prefetching for javascript',
                'prefetchChunks.forEach(function(chunkId) {',
                Template.indent([
                  'if(installedChunks[chunkId] === undefined) {',
                  Template.indent([
                    'installedChunks[chunkId] = null;',
                    mainTemplate.hooks.linkPrefetch.call('', chunk, hash),
                    'document.head.appendChild(link);'
                  ]),
                  '}'
                ]),
                '});'
              ])
              : '',
            'while(resolves.length) {',
            Template.indent('resolves.shift()();'),
            '}',
            '// ignore deferred entry modules in AMD mode'
          ]),
          '};',
          withDefer
            ? Template.asString([
              'function checkDeferredModules() {',
              Template.indent([
                'var result;',
                'for(var i = 0; i < deferredModules.length; i++) {',
                Template.indent([
                  'var deferredModule = deferredModules[i];',
                  'var fulfilled = true;',
                  'for(var j = 1; j < deferredModule.length; j++) {',
                  Template.indent([
                    'var depId = deferredModule[j];',
                    'if(installedChunks[depId] !== 0) fulfilled = false;'
                  ]),
                  '}',
                  'if(fulfilled) {',
                  Template.indent([
                    'deferredModules.splice(i--, 1);',
                    'result = ' +
                        mainTemplate.requireFn +
                        '(' +
                        mainTemplate.requireFn +
                        '.s = deferredModule[0]);'
                  ]),
                  '}'
                ]),
                '}',
                'return result;'
              ]),
              '}'
            ])
            : ''
        ])
      }
      return source
    }
  }

  /**
   * @param {Compilation} compilation the compilation instance
   * @returns {void}
   */
  apply (compilation) {
    const { mainTemplate } = compilation
    mainTemplate.hooks.bootstrap.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === 'JsonpMainTemplatePlugin') {
          // built-in JsonpMainTemplatePlugin bootstrap override
          tapInfo.fn = this._wrapper(mainTemplate)
        }
        return tapInfo
      }
    })
  }
}
module.exports = JsonpMainTemplateBootstrapOverridePlugin
