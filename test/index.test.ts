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
    expect(((result as any).output)
      .map((o: any) => o.facadeModuleId)).toHaveLength(5)
  })

  it('build work', async() => {
    const result: any = await buildVite()
    const code = result.output.map((o: any) => o.code).join('\n')
    expect(code).toContain('__variableDynamicImportRuntime0__')
    expect(code).toContain('GithubOutlined')
    expect(code).toContain('GithubFilled')
    expect(code).not.toContain('import(`@ant-design/icons/es/icons`)')
  })
})
