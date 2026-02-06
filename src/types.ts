export type {
  ChangeEvent,
  QuartzEmitterPlugin,
  QuartzEmitterPluginInstance,
  QuartzFilterPlugin,
  QuartzFilterPluginInstance,
  QuartzTransformerPlugin,
  QuartzTransformerPluginInstance,
} from "@jackyzha0/quartz/plugins/types";
export type { ProcessedContent, QuartzPluginData } from "@jackyzha0/quartz/plugins/vfile";
export type { BuildCtx } from "@jackyzha0/quartz/util/ctx";
export type { CSSResource, JSResource, StaticResources } from "@jackyzha0/quartz/util/resources";

export interface ExampleTransformerOptions {
  /** Token used to highlight text, defaults to ==highlight== */
  highlightToken: string;
  /** Add a CSS class to all headings in the rendered HTML. */
  headingClass: string;
  /** Enable remark-gfm for tables/task lists. */
  enableGfm: boolean;
  /** Enable adding slug IDs to headings. */
  addHeadingSlugs: boolean;
}

export interface ExampleFilterOptions {
  /** Allow pages marked draft: true to publish. */
  allowDrafts: boolean;
  /** Exclude pages that contain any of these frontmatter tags. */
  excludeTags: string[];
  /** Exclude paths that start with any of these prefixes (relative to content root). */
  excludePathPrefixes: string[];
}

export interface ExampleEmitterOptions {
  /** Filename to emit at the site root. */
  manifestSlug: string;
  /** Whether to include the frontmatter block in the manifest. */
  includeFrontmatter: boolean;
  /** Extra metadata to write at the top level of the manifest. */
  metadata: Record<string, unknown>;
  /** Optional hook to transform the emitted manifest JSON string. */
  transformManifest?: (json: string) => string;
  /** Add a custom class to the emitted manifest <script> tag if used in HTML. */
  manifestScriptClass?: string;
}

export interface ExampleComponentOptions {
  /** Text to prefix before the title */
  prefix?: string;
  /** Text to suffix after the title */
  suffix?: string;
  /** CSS class name to apply */
  className?: string;
}
