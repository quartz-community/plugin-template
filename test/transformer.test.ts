import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import type { Element, ElementContent, Root } from "hast";
import { ExampleTransformer } from "../src/transformer";
import { createCtx } from "./helpers";

describe("ExampleTransformer", () => {
  it("highlights text wrapped in the token", async () => {
    const ctx = createCtx();
    const transformer = ExampleTransformer({ highlightToken: "==" });
    const plugins = transformer.markdownPlugins?.(ctx) ?? [];

    const file = await unified()
      .use(remarkParse)
      .use(plugins)
      .use(remarkStringify)
      .process("Hello ==Quartz==");

    expect(String(file)).toContain("**Quartz**");
  });
});

describe("ExampleTransformer heading ids", () => {
  const heading = (tagName: string, ...children: ElementContent[]): Element => ({
    type: "element",
    tagName,
    properties: {},
    children,
  });
  const text = (value: string): ElementContent => ({ type: "text", value });

  const ids = async (addHeadingSlugs: boolean, ...headings: Element[]) => {
    const transformer = ExampleTransformer({ addHeadingSlugs });
    const htmlPlugins = transformer.htmlPlugins?.(createCtx()) ?? [];
    const tree = (await unified()
      .use(htmlPlugins)
      .run({ type: "root", children: headings } as Root)) as Root;
    const found: unknown[] = [];
    visit(tree, "element", (node: Element) => {
      if (/^h[1-6]$/.test(node.tagName)) found.push(node.properties?.id);
    });
    return found;
  };

  it("slugs headings like GitHub and rehype-slug, numbering repeats", async () => {
    expect(
      await ids(
        true,
        heading("h1", text("Hello "), heading("em", text("World"))),
        heading("h2", text("Hello World")),
        heading("h3", text("监听 127.0.0.1（推荐）")),
      ),
    ).toEqual(["hello-world", "hello-world-1", "监听-127001推荐"]);
  });

  it("keeps an id a heading already has", async () => {
    const own = heading("h2", text("Title"));
    own.properties = { id: "custom" };
    expect(await ids(true, own, heading("h2", text("Title")))).toEqual(["custom", "title"]);
  });

  it("adds no ids when addHeadingSlugs is off", async () => {
    expect(await ids(false, heading("h1", text("Title")))).toEqual([undefined]);
  });
});
