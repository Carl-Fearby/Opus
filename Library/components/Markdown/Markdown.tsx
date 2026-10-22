import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./Markdown.module.css";

export type MarkdownProps = {
  /** Markdown source. */
  children: string;
  className?: string;
  /** Override or extend the renderer for individual elements. */
  components?: Components;
  /** Open absolute links in a new tab. Defaults to true. */
  externalLinksInNewTab?: boolean;
};

function createComponents(externalLinksInNewTab: boolean): Components {
  return {
    a: ({ children, href, ...props }) => {
      const { node, ...anchorProps } = props;
      void node;
      const external = Boolean(href && /^https?:\/\//i.test(href));
      return (
        <a
          {...anchorProps}
          href={href}
          rel={external ? "noreferrer noopener" : undefined}
          target={external && externalLinksInNewTab ? "_blank" : undefined}
        >
          {children}
        </a>
      );
    },
    table: ({ children, ...props }) => {
      const { node, ...tableProps } = props;
      void node;
      return (
        <div className={styles.tableWrap}>
          <table {...tableProps}>{children}</table>
        </div>
      );
    },
  };
}

export function Markdown({
  children,
  className,
  components,
  externalLinksInNewTab = true,
}: MarkdownProps) {
  const renderers: Components = {
    ...createComponents(externalLinksInNewTab),
    ...components,
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
