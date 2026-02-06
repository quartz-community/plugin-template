declare module "@jackyzha0/quartz/components/types" {
  export type QuartzComponent = unknown;
}

declare module "@jackyzha0/quartz/util/path" {
  export type FilePath = string & { _brand: "FilePath" };
  export type FullSlug = string & { _brand: "FullSlug" };
  export function joinSegments(...segments: string[]): FilePath;
}

declare module "@jackyzha0/quartz/util/resources" {
  export type JSResource =
    | {
        loadTime: "beforeDOMReady" | "afterDOMReady";
        moduleType?: "module";
        spaPreserve?: boolean;
        src: string;
        contentType: "external";
      }
    | {
        loadTime: "beforeDOMReady" | "afterDOMReady";
        moduleType?: "module";
        spaPreserve?: boolean;
        script: string;
        contentType: "inline";
      };

  export type CSSResource = {
    content: string;
    inline?: boolean;
    spaPreserve?: boolean;
  };

  export interface StaticResources {
    css: CSSResource[];
    js: JSResource[];
    additionalHead: unknown[];
  }
}

declare module "@jackyzha0/quartz/util/ctx" {
  import type { QuartzConfig } from "@jackyzha0/quartz/cfg";
  import type { FilePath, FullSlug } from "@jackyzha0/quartz/util/path";

  export interface Argv {
    directory: string;
    verbose: boolean;
    output: string;
    serve: boolean;
    watch: boolean;
    port: number;
    wsPort: number;
    remoteDevHost?: string;
    concurrency?: number;
  }

  export interface BuildCtx {
    buildId: string;
    argv: Argv;
    cfg: QuartzConfig;
    allSlugs: FullSlug[];
    allFiles: FilePath[];
    incremental: boolean;
  }
}

declare module "@jackyzha0/quartz/cfg" {
  export interface QuartzConfig {
    configuration: {
      baseUrl?: string;
    };
  }
}

declare module "@jackyzha0/quartz/plugins/vfile" {
  import type { Root as HtmlRoot } from "hast";
  import type { Root as MdRoot } from "mdast";
  import type { Data, VFile } from "vfile";

  export type QuartzPluginData = Data;
  export type MarkdownContent = [MdRoot, VFile];
  export type ProcessedContent = [HtmlRoot, VFile];
}

declare module "@jackyzha0/quartz/plugins/types" {
  import type { PluggableList } from "unified";
  import type { StaticResources } from "@jackyzha0/quartz/util/resources";
  import type { ProcessedContent } from "@jackyzha0/quartz/plugins/vfile";
  import type { QuartzComponent } from "@jackyzha0/quartz/components/types";
  import type { FilePath } from "@jackyzha0/quartz/util/path";
  import type { BuildCtx } from "@jackyzha0/quartz/util/ctx";
  import type { VFile } from "vfile";

  export interface PluginTypes {
    transformers: QuartzTransformerPluginInstance[];
    filters: QuartzFilterPluginInstance[];
    emitters: QuartzEmitterPluginInstance[];
  }

  type OptionType = object | undefined;
  type ExternalResourcesFn = (ctx: BuildCtx) => Partial<StaticResources> | undefined;

  export type QuartzTransformerPlugin<Options extends OptionType = undefined> = (
    opts?: Options,
  ) => QuartzTransformerPluginInstance;

  export type QuartzTransformerPluginInstance = {
    name: string;
    textTransform?: (ctx: BuildCtx, src: string) => string;
    markdownPlugins?: (ctx: BuildCtx) => PluggableList;
    htmlPlugins?: (ctx: BuildCtx) => PluggableList;
    externalResources?: ExternalResourcesFn;
  };

  export type QuartzFilterPlugin<Options extends OptionType = undefined> = (
    opts?: Options,
  ) => QuartzFilterPluginInstance;

  export type QuartzFilterPluginInstance = {
    name: string;
    shouldPublish(ctx: BuildCtx, content: ProcessedContent): boolean;
  };

  export type ChangeEvent = {
    type: "add" | "change" | "delete";
    path: FilePath;
    file?: VFile;
  };

  export type QuartzEmitterPlugin<Options extends OptionType = undefined> = (
    opts?: Options,
  ) => QuartzEmitterPluginInstance;

  export type QuartzEmitterPluginInstance = {
    name: string;
    emit: (
      ctx: BuildCtx,
      content: ProcessedContent[],
      resources: StaticResources,
    ) => Promise<FilePath[]> | AsyncGenerator<FilePath>;
    partialEmit?: (
      ctx: BuildCtx,
      content: ProcessedContent[],
      resources: StaticResources,
      changeEvents: ChangeEvent[],
    ) => Promise<FilePath[]> | AsyncGenerator<FilePath> | null;
    getQuartzComponents?: (ctx: BuildCtx) => QuartzComponent[];
    externalResources?: ExternalResourcesFn;
  };
}
