import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  id?: string;
  title: string;
  sub?: string;
  action?: { href: string; label: string };
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHead({ id, title, sub, action, as: Tag = "h2", className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-3xl">
        <Tag id={id} className="display text-[clamp(3rem,9vw,5.5rem)]">
          {title}
        </Tag>
        {sub && <p className="mt-4 text-lg text-muted md:text-xl">{sub}</p>}
      </div>
      {action && (
        <Link href={action.href} className="link-arrow shrink-0 text-wine">
          {action.label}
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
