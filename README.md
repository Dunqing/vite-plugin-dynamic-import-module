# vite-plugin-import-dynamic-module

[![NPM version](https://img.shields.io/npm/v/vite-plugin-dynamic-import-module.svg)](https://npmjs.org/package/vite-plugin-dynamic-import-module)

## Install

```bash
pnpm add vite-plugin-import-dynamic-module -D
```

## Usage

```typescript

import { defineConfig } from 'vite'
import importDynamicModule from 'vite-plugin-import-dynamic-module'

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

### How to use?

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

### Limitations

#### module name does not allow variables

```typescript
// module as @ant-design
import(`@ant-design/${module}${name}`)

// module as @ant-design/icons/es/icons
import(`@ant-design/icons/es/icons/${name}`)
```

### Thanks

- [@rollup/plugin-import-dynamic-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars)

[LICENSE (MIT)](/LICENSE)