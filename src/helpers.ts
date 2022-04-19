import { existsSync, readFileSync } from 'fs'
import path from 'path'
import type { ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'

export function getDepsCacheDir(config: ResolvedConfig) {
  return normalizePath(path.resolve(config.cacheDir, 'deps'))
}

function parseOptimizedDepsMetadata(
  jsonMetadata: string,
  depsCacheDir: string,
) {
  const metadata = JSON.parse(jsonMetadata, (key: string, value: string) => {
    // Paths can be absolute or relative to the deps cache dir where
    // the _metadata.json is located
    if (key === 'file' || key === 'src')
      return normalizePath(path.resolve(depsCacheDir, value))

    return value
  })

  return metadata
}

export const getModuleId = (id: string, config: ResolvedConfig) => {
  const depsCacheDir = getDepsCacheDir(config)

  const metadataPath = path.join(depsCacheDir, '_metadata.json')

  if (!existsSync(metadataPath))
    return null

  const metadata = parseOptimizedDepsMetadata(
    readFileSync(metadataPath, 'utf-8'),
    depsCacheDir,
  )

  if (metadata && Reflect.has(metadata?.optimized, id))
    return Reflect.get(metadata?.optimized, id)

  return null
}
