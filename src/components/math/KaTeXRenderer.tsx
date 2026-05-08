"use client";

import katex from "katex";
import { Fragment, useMemo } from "react";

type KaTeXRendererProps = {
  content: string;
  className?: string;
};

type Segment = {
  text: string;
  math: boolean;
  display: boolean;
};

type RenderedSegment = Segment | (Segment & { html: string });

function splitMath(content: string): Segment[] {
  const segments: Segment[] = [];
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: content.slice(lastIndex, match.index),
        math: false,
        display: false
      });
    }

    const token = match[0];
    const display = token.startsWith("$$");
    segments.push({
      text: display ? token.slice(2, -2) : token.slice(1, -1),
      math: true,
      display
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      text: content.slice(lastIndex),
      math: false,
      display: false
    });
  }

  return segments;
}

export function KaTeXRenderer({ content, className }: KaTeXRendererProps) {
  const rendered = useMemo<RenderedSegment[]>(() => {
    return splitMath(content).map((segment) => {
      if (!segment.math) return segment;

      try {
        return {
          ...segment,
          html: katex.renderToString(segment.text, {
            displayMode: segment.display,
            throwOnError: false,
            strict: false
          })
        };
      } catch {
        return {
          ...segment,
          math: false,
          text: segment.text
        };
      }
    });
  }, [content]);

  return (
    <span className={className}>
      {rendered.map((segment, index) => {
        if ("html" in segment) {
          const Tag = segment.display ? "div" : "span";
          return (
            <Tag
              key={index}
              className={segment.display ? "my-3 overflow-x-auto" : undefined}
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          );
        }

        const lines = segment.text.split("\n");
        return (
          <Fragment key={index}>
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </span>
  );
}
