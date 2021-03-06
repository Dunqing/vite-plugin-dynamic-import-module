import path from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { asyncWalk } from 'estree-walker'
import type { ImportExpression } from 'estree'
import MagicString from 'magic-string'
import fastGlob from 'fast-glob'
import { parseImportExpression } from './parseImportExpression'
import { getModuleId } from './helpers'

interface ImportDynamicModulePluginOptions {
  include?: string | string[]
  exclude?: string | string[]
  extensions?: string[]
}

const defaultExtensions = ['js', 'cjs', 'ts', 'tsx', 'jsx', 'mjs', 'mts', 'mtsx']

export default function importDynamicModule({ include = [], exclude = [], extensions = defaultExtensions }: ImportDynamicModulePluginOptions = {}): Plugin {
  const filterRe = new RegExp(`\\.(?:${extensions.join('|')})$`)

  const filter = createFilter([filterRe, include].flat(), exclude)

  let config: ResolvedConfig

  return {
    name: 'vite-plugin-dynamic-import-module',
    configResolved(resolved) {
      config = resolved
    },
    async transform(code, id) {
      if (!filter(id))
        return null
      const parsed = this.parse(code)

      let ms: MagicString
      let dynamicImportIndex = -1

      await asyncWalk(parsed, {
        enter: async(node) => {
          if (node.type !== 'ImportExpression')
            return

          dynamicImportIndex += 1
          const glob = parseImportExpression((node as ImportExpression).source!)
          if (!glob)
            return

          /**
             * @rollup/plugin-dynamic-import-vars handler
             */
          if (glob.startsWith('./') || glob.startsWith('../'))
            return

          const libPart: string[] = []
          glob.split('\/').every(i => i.includes('*') || libPart.push(i))
          const libId = path.posix.join(...libPart)

          const moduleId = getModuleId(libId, config)?.src || (await this.resolve(libId, id, { skipSelf: true }))?.id

          if (!moduleId)
            return

          const globExtensions = `.\{${extensions.join(',')}\}`
          const globPattern = glob.substring(libId.length).replace('/', '')

          const sources = fastGlob.sync(
            globPattern.includes('.') ? globPattern : `${globPattern}${globExtensions}`,
            { cwd: path.posix.dirname(moduleId) },
          )

          ms = ms || new MagicString(code)

          ms.prepend(
              `function __variableDynamicImportRuntime${dynamicImportIndex}__(path) {
  switch (path) {
${sources.map((s) => { const p = path.posix.join(libId, s.substring(0, s.indexOf('.'))); return `    case '${p}': return import('${p}');` }).join('\n')}
${`    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })\n`}   }
 }\n\n`,
          )

          ms.overwrite((node as any).start, (node as any).start + 6, `__variableDynamicImportRuntime${dynamicImportIndex}__`)
        },
      })
      if (ms!) {
        return {
          code: ms.toString(),
          map: ms.generateMap({
            file: id,
            includeContent: true,
            hires: true,
          }),
        }
      }
      return null
    },

  }
}
