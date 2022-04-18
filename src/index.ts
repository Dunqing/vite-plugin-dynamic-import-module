import path from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { walk } from 'estree-walker'
import type { ImportExpression } from 'estree'
import MagicString from 'magic-string'
import fastGlob from 'fast-glob'
import { parseImportExpression } from './parseImportExpression'
import { getModuleId } from './helpers'

interface ImportDynamicModulePluginOptions {
  include?: string | string[]
  exclude?: string | string[]
}

const Extension = ['js', 'cjs', 'ts', 'tsx', 'jsx', 'mjs', 'mts', 'mtsx']
const filterRe = new RegExp(`\\.(?:${Extension.join('|')})$`)

export default function importDynamicModule({ include = [], exclude = [] }: ImportDynamicModulePluginOptions = {}): Plugin {
  const filter = createFilter([filterRe, include].flat(), exclude)

  let config: ResolvedConfig

  return {
    enforce: 'post',
    name: 'vite-plugin-import-dynamic-module',
    configResolved(resolved) {
      config = resolved
    },
    transform(code, id) {
      if (!filter(id))
        return null
      const parsed = this.parse(code)

      let ms: MagicString
      let dynamicImportIndex = -1

      walk(parsed, {
        enter: async(node) => {
          if (node.type !== 'ImportExpression')
            return

          dynamicImportIndex += 1
          const glob = parseImportExpression((node as ImportExpression).source!)
          if (!glob)
            return

          const matched = glob.match(/([\w+\@\_\-\/]+)/)
          if (matched?.length !== 2)
            return

          const [fullMatch, libId] = matched

          let moduleId = getModuleId(libId, config)?.src

          if (!moduleId) {
            const resolved = await this.resolve(libId, id, { skipSelf: true })
            if (!resolved)
              return
            moduleId = resolved.id
          }

          const modulePath = path.posix.dirname(moduleId)

          const sources = fastGlob.sync(`${glob.substring(fullMatch.length)}.\{${Extension.join(',')}\}`, {
            cwd: modulePath,
          })
          ms = new MagicString(code)
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
