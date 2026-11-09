import type { PluggableList, Plugin } from "unified";
import type { Root as MdastRoot } from "mdast";
import type { Root as HastRoot, Element, ElementContent } from "hast";
import type { VFile } from "vfile";
import remarkGfm from "remark-gfm";
import { findAndReplace } from "mdast-util-find-and-replace";
import { visit } from "unist-util-visit";
import type { QuartzTransformerPlugin, BuildCtx } from "@quartz-community/types";
import { HeadingSlugger } from "@quartz-community/utils";
import type { ExampleTransformerOptions } from "./types";

const defaultOptions: ExampleTransformerOptions = {
  highlightToken: "==",
  headingClass: "example-plugin-heading",
  enableGfm: true,
  addHeadingSlugs: true,
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const remarkHighlightToken = (token: string): Plugin<[], MdastRoot> => {
  const escapedToken = escapeRegExp(token);
  const pattern = new RegExp(`${escapedToken}([^\n]+?)${escapedToken}`, "g");
  return () => (tree: MdastRoot, _file: VFile) => {
    findAndReplace(tree, [
      [
        pattern,
        (_match: string, value: string) => ({
          type: "strong",
          children: [{ type: "text", value }],
        }),
      ],
    ]);
  };
};

const rehypeHeadingClass = (className: string): Plugin<[], HastRoot> => {
  return () => (tree: HastRoot, _file: VFile) => {
    visit(tree, "element", (node: Element) => {
      if (!/^h[1-6]$/.test(node.tagName)) {
        return;
      }

      const existing = node.properties?.className;
      const classes: string[] = Array.isArray(existing)
        ? existing.filter((value): value is string => typeof value === "string")
        : typeof existing === "string"
          ? [existing]
          : [];
      node.properties = {
        ...node.properties,
        className: [...classes, className],
      };
    });
  };
};

/** The text of a node and its descendants (what `hast-util-to-string` gives). */
const hastText = (node: ElementContent): string =>
  node.type === "text"
    ? node.value
    : node.type === "element"
      ? node.children.map(hastText).join("")
      : "";

/**
 * Gives each heading without an `id` one, slugged from its text with the shared `HeadingSlugger`
 * from @quartz-community/utils (the same ids as GitHub and `rehype-slug`).
 */
const rehypeHeadingIds: Plugin<[], HastRoot> = () => (tree: HastRoot) => {
  const slugger = new HeadingSlugger();
  visit(tree, "element", (node: Element) => {
    if (!/^h[1-6]$/.test(node.tagName) || node.properties?.id) {
      return;
    }
    node.properties = { ...node.properties, id: slugger.slug(hastText(node)) };
  });
};

/**
 * Example transformer showing remark/rehype usage and resource injection.
 */
export const ExampleTransformer: QuartzTransformerPlugin<Partial<ExampleTransformerOptions>> = (
  userOptions?: Partial<ExampleTransformerOptions>,
) => {
  const options = { ...defaultOptions, ...userOptions };
  return {
    name: "ExampleTransformer",
    textTransform(_ctx: BuildCtx, src: string) {
      return src.endsWith("\n") ? src : `${src}\n`;
    },
    markdownPlugins(): PluggableList {
      const plugins: PluggableList = [remarkHighlightToken(options.highlightToken)];
      if (options.enableGfm) {
        plugins.unshift(remarkGfm);
      }
      return plugins;
    },
    htmlPlugins(): PluggableList {
      const plugins: PluggableList = [rehypeHeadingClass(options.headingClass)];
      if (options.addHeadingSlugs) {
        plugins.unshift(rehypeHeadingIds);
      }
      return plugins;
    },
    externalResources() {
      return {
        css: [
          {
            content: `.${options.headingClass} { letter-spacing: 0.02em; }`,
            inline: true,
          },
        ],
        js: [
          {
            contentType: "inline",
            loadTime: "afterDOMReady",
            script: "document.documentElement.dataset.exampleTransformer = 'true'",
          },
        ],
        additionalHead: [],
      };
    },
  };
};
