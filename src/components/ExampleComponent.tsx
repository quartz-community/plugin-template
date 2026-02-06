import type { VNode } from "preact";

export interface ExampleComponentOptions {
  prefix?: string;
  suffix?: string;
  className?: string;
}

export interface QuartzComponentProps {
  ctx: {
    cfg: {
      configuration: Record<string, unknown>;
    };
    allFiles: string[];
  };
  fileData: {
    slug?: string;
    frontmatter?: {
      title?: string;
      description?: string;
    };
  };
}

export interface QuartzComponent {
  (props: QuartzComponentProps): VNode;
  css?: string;
  beforeDOMLoaded?: string;
  afterDOMLoaded?: string;
}

export const ExampleComponent = (opts?: ExampleComponentOptions) => {
  const { prefix = "", suffix = "", className = "example-component" } = opts ?? {};

  const Component: QuartzComponent = (props: QuartzComponentProps) => {
    const title = props.fileData.frontmatter?.title ?? "Untitled";
    const fullText = `${prefix}${title}${suffix}`;

    return <div class={className}>{fullText}</div>;
  };

  Component.css = `
    .example-component {
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
    }
  `;

  Component.afterDOMLoaded = `
    document.addEventListener('nav', () => {
      console.log('ExampleComponent: page navigation occurred');
    });
  `;

  return Component;
};

export default ExampleComponent;
