import katex from "katex";
import { cn } from "@/lib/utils";

/** Renders a KaTeX formula. Invalid input shows the source instead of crashing. */
export function Formula({
  tex,
  display = false,
  className,
}: {
  tex: string;
  display?: boolean;
  className?: string;
}) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: display });
  return <span className={cn(display && "block", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
