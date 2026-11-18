import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background,border-color,box-shadow,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-[image:var(--gradient-primary)] text-white shadow-glow hover:brightness-110",
  secondary: "border border-line-strong bg-ink/[0.03] text-text hover:border-purple/60 hover:bg-purple/10",
  ghost: "text-muted hover:text-text",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function buttonClass({ variant = "primary", size = "md", className }: Omit<Common, "children">) {
  return cn(base, variants[variant], sizes[size], className);
}

/** A link styled as a button. Internal routes use Next.js Link; anchors use <a>. */
export function ButtonLink({ href, ...rest }: Common & { href: string }) {
  const cls = buttonClass(rest);
  return href.startsWith("#") ? (
    <a href={href} className={cls}>
      {rest.children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {rest.children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
