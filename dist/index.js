import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { findAndReplace } from 'mdast-util-find-and-replace';
import { visit } from 'unist-util-visit';
import path from 'path';
import fs from 'fs/promises';
import { jsx } from 'preact/jsx-runtime';

// src/transformer.ts
var defaultOptions = {
  highlightToken: "==",
  headingClass: "example-plugin-heading",
  enableGfm: true,
  addHeadingSlugs: true
};
var escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var remarkHighlightToken = (token) => {
  const escapedToken = escapeRegExp(token);
  const pattern = new RegExp(`${escapedToken}([^
]+?)${escapedToken}`, "g");
  return () => (tree, _file) => {
    findAndReplace(tree, [
      [
        pattern,
        (_match, value) => ({
          type: "strong",
          children: [{ type: "text", value }]
        })
      ]
    ]);
  };
};
var rehypeHeadingClass = (className) => {
  return () => (tree, _file) => {
    visit(tree, "element", (node) => {
      if (!/^h[1-6]$/.test(node.tagName)) {
        return;
      }
      const existing = node.properties?.className;
      const classes = Array.isArray(existing) ? existing.filter((value) => typeof value === "string") : typeof existing === "string" ? [existing] : [];
      node.properties = {
        ...node.properties,
        className: [...classes, className]
      };
    });
  };
};
var ExampleTransformer = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  return {
    name: "ExampleTransformer",
    textTransform(_ctx, src) {
      return src.endsWith("\n") ? src : `${src}
`;
    },
    markdownPlugins() {
      const plugins = [remarkHighlightToken(options.highlightToken)];
      if (options.enableGfm) {
        plugins.unshift(remarkGfm);
      }
      return plugins;
    },
    htmlPlugins() {
      const plugins = [rehypeHeadingClass(options.headingClass)];
      if (options.addHeadingSlugs) {
        plugins.unshift(rehypeSlug);
      }
      return plugins;
    },
    externalResources() {
      return {
        css: [
          {
            content: `.${options.headingClass} { letter-spacing: 0.02em; }`,
            inline: true
          }
        ],
        js: [
          {
            contentType: "inline",
            loadTime: "afterDOMReady",
            script: "document.documentElement.dataset.exampleTransformer = 'true'"
          }
        ],
        additionalHead: []
      };
    }
  };
};

// src/filter.ts
var defaultOptions2 = {
  allowDrafts: false,
  excludeTags: ["private"],
  excludePathPrefixes: ["_drafts/", "_private/"]
};
var normalizeTag = (tag) => typeof tag === "string" ? tag.trim().toLowerCase() : "";
var includesTag = (tags, excludedTags) => {
  if (!Array.isArray(tags)) {
    return false;
  }
  const normalizedExcluded = excludedTags.map((tag) => tag.toLowerCase());
  return tags.some((tag) => normalizedExcluded.includes(normalizeTag(tag)));
};
var ExampleFilter = (userOptions) => {
  const options = { ...defaultOptions2, ...userOptions };
  return {
    name: "ExampleFilter",
    shouldPublish(_ctx, [_tree, vfile]) {
      const frontmatter = vfile.data?.frontmatter ?? {};
      const isDraft = frontmatter.draft === true || frontmatter.draft === "true";
      if (isDraft && !options.allowDrafts) {
        return false;
      }
      if (includesTag(frontmatter.tags, options.excludeTags)) {
        return false;
      }
      const filePath = typeof vfile.data?.filePath === "string" ? vfile.data.filePath : "";
      const normalizedPath = filePath.replace(/\\/g, "/");
      if (options.excludePathPrefixes.some((prefix) => normalizedPath.startsWith(prefix))) {
        return false;
      }
      return true;
    }
  };
};
var defaultOptions3 = {
  manifestSlug: "plugin-manifest",
  includeFrontmatter: true,
  metadata: {
    generator: "Quartz Plugin Template"
  }
};
var joinSegments = (...segments) => segments.filter((segment) => segment.length > 0).join("/").replace(/\/+/g, "/");
var writeFile = async (outputDir, slug, ext, content) => {
  const outputPath = joinSegments(outputDir, `${slug}${ext}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, content);
  return outputPath;
};
var ExampleEmitter = (userOptions) => {
  const options = { ...defaultOptions3, ...userOptions };
  const emitManifest = async (ctx, content) => {
    const manifest = {
      ...options.metadata,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      pages: content.map(([_tree, vfile]) => {
        const frontmatter = vfile.data?.frontmatter ?? {};
        return {
          slug: vfile.data?.slug ?? null,
          title: frontmatter.title ?? null,
          tags: frontmatter.tags ?? null,
          filePath: vfile.data?.filePath ?? null,
          frontmatter: options.includeFrontmatter ? frontmatter : void 0
        };
      })
    };
    let json = `${JSON.stringify(manifest, null, 2)}
`;
    if (options.transformManifest) {
      json = options.transformManifest(json);
    }
    const output = await writeFile(
      ctx.argv.output,
      options.manifestSlug,
      ".json",
      json
    );
    return [output];
  };
  return {
    name: "ExampleEmitter",
    async emit(ctx, content, _resources) {
      return emitManifest(ctx, content);
    },
    async *partialEmit(ctx, content, _resources, _changeEvents) {
      const outputPaths = await emitManifest(ctx, content);
      for (const outputPath of outputPaths) {
        yield outputPath;
      }
    }
  };
};

// src/util/lang.ts
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/components/styles/example.scss
var example_default = ".example-component {\n  padding: 8px 16px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border-radius: 4px;\n  font-weight: 600;\n  display: inline-block;\n}";

// src/components/scripts/example.inline.ts
var example_inline_default = 'function c(){let e=window.location.pathname;return e.startsWith("/")&&(e=e.slice(1)),e.endsWith("/")&&(e=e.slice(0,-1)),e||"index"}function r(){let e=document.querySelectorAll(".example-component");if(e.length===0)return;let t=[];function o(n){(n.ctrlKey||n.metaKey)&&n.shiftKey&&n.key.toLowerCase()==="e"&&(n.preventDefault(),console.log("[ExampleComponent] Keyboard shortcut triggered!"))}document.addEventListener("keydown",o),t.push(()=>document.removeEventListener("keydown",o));for(let n of e){let i=()=>{console.log("[ExampleComponent] Clicked!")};n.addEventListener("click",i),t.push(()=>n.removeEventListener("click",i))}typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>{t.forEach(n=>n())}),console.log("[ExampleComponent] Initialized with",e.length,"component(s)")}document.addEventListener("nav",e=>{let t=e.detail?.url||c();console.log("[ExampleComponent] Navigation to:",t),r()});document.addEventListener("render",()=>{console.log("[ExampleComponent] Render event - re-initializing"),r()});document.addEventListener("prenav",()=>{let e=document.querySelector(".example-component");e&&sessionStorage.setItem("exampleScrollTop",e.scrollTop?.toString()||"0")});\n';
var ExampleComponent_default = ((opts) => {
  const { prefix = "", suffix = "", className = "example-component" } = opts ?? {};
  const Component = (props) => {
    const frontmatter = props.fileData?.frontmatter;
    const title = frontmatter?.title ?? "Untitled";
    const fullText = `${prefix}${title}${suffix}`;
    return /* @__PURE__ */ jsx("div", { class: classNames(className), children: fullText });
  };
  Component.css = example_default;
  Component.afterDOMLoaded = example_inline_default;
  return Component;
});

export { ExampleComponent_default as ExampleComponent, ExampleEmitter, ExampleFilter, ExampleTransformer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map