import { ArrowRight, MessageCircle } from "lucide-react";
import { Seam } from "@/components/art/Seam";
import type { ContactAction } from "@/lib/contact";

type Props = {
  heading: string;
  text: string;
  button: string;
  action: ContactAction;
  /** Цвет поля над блоком, чтобы шов совпал. */
  above?: string;
};

export function FinalCta({ heading, text, button, action, above = "var(--color-milk)" }: Props) {
  return (
    <section aria-labelledby="cta-title" className="on-dark relative bg-wine text-milk">
      <Seam top={above} bottom="var(--color-wine)" />
      <div className="shell relative pt-10 pb-24 md:pt-14 md:pb-32">
        <h2 id="cta-title" className="display max-w-5xl text-[clamp(3.2rem,10vw,7.5rem)]">
          {heading}
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted-on-dark md:text-xl">{text}</p>
        <a
          href={action.href}
          {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="btn btn-gold mt-10"
        >
          {action.isWhatsapp && <MessageCircle className="size-5" aria-hidden />}
          {button}
          <ArrowRight className="size-5" aria-hidden />
        </a>
      </div>
    </section>
  );
}
