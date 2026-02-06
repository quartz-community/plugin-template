# Quartz Community Plugin Template

Production-ready template for building, testing, and publishing Quartz community plugins. It mirrors
Quartz's native plugin patterns and uses a factory-function API similar to Astro integrations:
plugins are created by functions that return objects with `name` and lifecycle hooks.

## Highlights

- ✅ Quartz-compatible transformer/filter/emitter examples
- ✅ TypeScript-first with exported types for consumers
- ✅ `tsup` bundling + declaration output
- ✅ Vitest testing setup with example tests
- ✅ Linting/formatting with ESLint + Prettier
- ✅ CI workflow for checks and npm publishing
- ✅ Demonstrates CSS/JS resource injection and remark/rehype usage

## Getting started

```bash
npm install
npm run build
```

## Usage in Quartz

Install your plugin into a Quartz site and register it in `quartz.config.ts`:

```ts
import {
  ExampleTransformer,
  ExampleFilter,
  ExampleEmitter,
} from "@quartz-community/plugin-template";

export default {
  configuration: {
    pageTitle: "My Garden",
  },
  plugins: {
    transformers: [ExampleTransformer({ highlightToken: "==" })],
    filters: [ExampleFilter({ allowDrafts: false })],
    emitters: [ExampleEmitter({ manifestSlug: "plugin-manifest" })],
  },
};
```

## Plugin factory pattern (Astro-style)

Quartz plugins are factory functions that return an object with a `name` and hook implementations.
This mirrors Astro's integration pattern (a function returning an object of hooks), which makes
composition and configuration explicit and predictable.

```ts
import type { QuartzTransformerPlugin } from "@jackyzha0/quartz/plugins/types";

export const MyTransformer: QuartzTransformerPlugin<{ enabled: boolean }> = (opts) => {
  return {
    name: "MyTransformer",
    markdownPlugins() {
      return [];
    },
  };
};
```

## Examples included

### Transformer

`ExampleTransformer` shows how to:

- apply a custom remark plugin
- run a rehype plugin
- inject CSS/JS resources
- perform a text transform hook

```ts
import { ExampleTransformer } from "@quartz-community/plugin-template";

ExampleTransformer({
  highlightToken: "==",
  headingClass: "example-plugin-heading",
  enableGfm: true,
  addHeadingSlugs: true,
});
```

The transformer uses a custom remark plugin to convert `==highlight==` into bold text and a rehype
plugin to attach a class to all headings. It also injects a small inline CSS/JS snippet.

### Filter

`ExampleFilter` demonstrates frontmatter-driven filtering:

```ts
ExampleFilter({
  allowDrafts: false,
  excludeTags: ["private", "wip"],
  excludePathPrefixes: ["_drafts/", "_private/"],
});
```

### Emitter

`ExampleEmitter` emits a JSON manifest of all pages:

```ts
ExampleEmitter({
  manifestSlug: "plugin-manifest",
  includeFrontmatter: true,
  metadata: { project: "My Garden" },
  transformManifest: (json) => json.replace("My Garden", "Quartz"),
});
```

## API reference

### `ExampleTransformer(options)`

| Option            | Type      | Default                    | Description                   |
| ----------------- | --------- | -------------------------- | ----------------------------- |
| `highlightToken`  | `string`  | `"=="`                     | Token used to highlight text. |
| `headingClass`    | `string`  | `"example-plugin-heading"` | Class added to headings.      |
| `enableGfm`       | `boolean` | `true`                     | Enables `remark-gfm`.         |
| `addHeadingSlugs` | `boolean` | `true`                     | Enables `rehype-slug`.        |

### `ExampleFilter(options)`

| Option                | Type       | Default                     | Description               |
| --------------------- | ---------- | --------------------------- | ------------------------- |
| `allowDrafts`         | `boolean`  | `false`                     | Publish draft pages.      |
| `excludeTags`         | `string[]` | `["private"]`               | Tags to exclude.          |
| `excludePathPrefixes` | `string[]` | `["_drafts/", "_private/"]` | Path prefixes to exclude. |

### `ExampleEmitter(options)`

| Option                | Type                       | Default                                   | Description                               |
| --------------------- | -------------------------- | ----------------------------------------- | ----------------------------------------- |
| `manifestSlug`        | `string`                   | `"plugin-manifest"`                       | Output filename (without extension).      |
| `includeFrontmatter`  | `boolean`                  | `true`                                    | Include frontmatter in output.            |
| `metadata`            | `Record<string, unknown>`  | `{ generator: "Quartz Plugin Template" }` | Extra metadata in manifest.               |
| `transformManifest`   | `(json: string) => string` | `undefined`                               | Custom transformer for emitted JSON.      |
| `manifestScriptClass` | `string`                   | `undefined`                               | Optional CSS class if rendered into HTML. |

## Testing

```bash
npm test
```

## Build and lint

```bash
npm run build
npm run lint
npm run format
```

## Publishing

Tags matching `v*` trigger the GitHub Actions publish workflow. Ensure `NPM_TOKEN` is set in the
repository secrets.

## License

MIT
