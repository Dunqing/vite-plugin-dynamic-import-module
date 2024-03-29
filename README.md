# vite-plugin-dynamic-import-module

[![NPM version](https://img.shields.io/npm/v/vite-plugin-dynamic-import-module.svg)](https://npmjs.org/package/vite-plugin-dynamic-import-module)


A vite plugin to support variables in dynamic imports module in Vite


## Installation

```bash
pnpm add vite-plugin-dynamic-import-module -D
```

## Usage

```typescript

import { defineConfig } from 'vite'
import importDynamicModule from 'vite-plugin-dynamic-import-module'

export default defineConfig({
  plugins: [importDynamicModule()],
})

```


### Options

#### `include`

Type: `string` | `Array<string>`<br>
Default: `[]`

Files to include in this plugin (default all).

#### `exclude`

Type: `string` | `Array<string>`<br>
Default: `[]`

Files to exclude in this plugin (default none).


#### `extensions`

Type: `Array<string>`
Default: `['js', 'cjs', 'ts', 'tsx', 'jsx', 'mjs', 'mts', 'mtsx']`

Automatically add default extensions when your import path has no extensions

## How it works?

```typescript
// Allowed
import(`@ant-design/icons/${name}`)
import(`@ant-design/icons/${name}.js`)
import(`@ant-design/icons/${name}Outlined`)
import(`@ant-design/icons/${name}Outlined.js`)

// Not allowed
// cannot find module
import(`@ant-design/${module}/${name}`)
```

## Limitations

### module name does not allow use variables

```typescript
// module as @ant-design
import(`@ant-design/${module}${name}`)

// module as @ant-design/icons/es/icons
import(`@ant-design/icons/es/icons/${name}`)
```

## Examples

- [vite-ant-design-pro](https://github.com/Dunqing/vite-ant-design-pro)

## Thanks

- [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars)

[LICENSE (MIT)](/LICENSE)
