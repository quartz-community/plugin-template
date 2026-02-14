import { defineConfig } from "tsup";
import type { Plugin } from "esbuild";
import path from "path";

/**
 * Esbuild plugin that bundles `.inline.ts` files into browser-ready JavaScript strings.
 *
 * Problem: Inline scripts are embedded as raw text into `<script>` tags in the browser.
 * The previous text-loader read `.inline.ts` files verbatim, meaning TypeScript syntax
 * (type annotations, `as` casts, non-null assertions, interfaces) survived into the
 * browser and caused parse errors.
 *
 * Solution: Use `esbuild.build()` to transpile TypeScript and bundle local/npm imports
 * into a single self-contained script. The result is returned as a text string that can
 * be safely injected into a `<script>` tag.
 *
 * This mirrors Quartz v5's own `inline-script-loader` in `quartz/cli/handlers.js`.
 */
const inlineScriptPlugin: Plugin = {
  name: "inline-script-loader",
  setup(parentBuild) {
    const absWorkingDir = parentBuild.initialOptions.absWorkingDir ?? process.cwd();

    // SCSS files are loaded as raw text (CSS injected via style tags)
    parentBuild.onLoad({ filter: /\.scss$/ }, async (args) => {
      const fs = await import("fs");
      const text = await fs.promises.readFile(args.path, "utf8");
      return {
        contents: text,
        loader: "text",
      };
    });

    // Inline TypeScript files are transpiled + bundled for the browser
    parentBuild.onLoad({ filter: /\.inline\.ts$/ }, async (args) => {
      const esbuild = await import("esbuild");
      const fs = await import("fs");
      let text = await fs.promises.readFile(args.path, "utf8");

      // Strip export statements that were added for the module system —
      // inline scripts run in a <script> tag, not as ES modules
      text = text.replace(/^export default /gm, "");
      text = text.replace(/^export /gm, "");

      const resolveDir = path.dirname(args.path);
      const sourcefile = path.relative(absWorkingDir, args.path);

      const result = await esbuild.build({
        stdin: {
          contents: text,
          loader: "ts",
          resolveDir,
          sourcefile,
        },
        write: false,
        bundle: true,
        minify: true,
        platform: "browser",
        format: "esm",
        target: "es2020",
        sourcemap: false,
        // Preserve dynamic CDN imports (e.g. graph plugin loading d3/pixi from CDN)
        external: ["http://*", "https://*"],
      });

      const js = result.outputFiles?.[0]?.text;
      if (!js) throw new Error(`inline-script-loader: no JS output for ${args.path}`);

      return {
        contents: js,
        loader: "text",
      };
    });
  },
};

export default defineConfig({
  entry: {
    index: "src/index.ts",
    types: "src/types.ts",
    "components/index": "src/components/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  splitting: false,
  outDir: "dist",
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "preact";
  },
  esbuildPlugins: [inlineScriptPlugin],
});
