import path from 'path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import dynamicImportModule from '../src'

const buildVite = async() => {
  return await build({
    plugins: [
      dynamicImportModule(),
    ],
    build: {
      polyfillModulePreload: false,
      write: false,
      minify: false,
    },
    cacheDir: path.resolve('./test'),
    root: path.resolve('./test'),
  })
}

describe('should', () => {
  it('found module work', async() => {
    const result = await buildVite()
    expect(((result as any).output).map((o: any) => o.facadeModuleId)).toMatchInlineSnapshot(`
      [
        "/Users/dengqing/Documents/github/vite-plugin-import-dynamic-module/test/index.html",
        "/Users/dengqing/Documents/github/vite-plugin-import-dynamic-module/node_modules/.pnpm/@ant-design+icons@4.7.0/node_modules/@ant-design/icons/es/icons/GithubFilled.js",
        null,
        "/Users/dengqing/Documents/github/vite-plugin-import-dynamic-module/node_modules/.pnpm/@ant-design+icons@4.7.0/node_modules/@ant-design/icons/es/icons/GithubOutlined.js",
        undefined,
      ]
    `)
  })

  it('build work', async() => {
    const result: any = await buildVite()
    result.output.forEach((o) => {
      expect(o.code).toMatchSnapshot()
    })
  })
})
