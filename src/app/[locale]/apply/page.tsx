import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { ApplyForm } from "@/components/apply/ApplyForm";
import { PageHero } from "@/components/ui/PageHero";
import { getContactAction } from "@/lib/contact";
import { getDirections, getSettings } from "@/lib/content";
import { getDictionary, href, isLocale, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { isCmsConfigured } from "@/lib/supabase/env";
import { telLink } from "@/lib/whatsapp";
import { submitApplication } from "./actions";

export async function generateMetadata({ params }: PageProps<"/[locale]/apply">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/apply", title: dict.apply.title, description: dict.meta.applyDescription });
}

export default async function ApplyPage({ params, searchParams }: PageProps<"/[locale]/apply">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const query = await searchParams;
  const [directions, settings, contact] = await Promise.all([getDirections(), getSettings(), getContactAction(locale)]);
  const kind = typeof query.type === "string" && query.type in dict.apply.kinds ? query.type : "enroll";
  const direction = typeof query.direction === "string" && directions.some((d) => d.slug === query.direction) ? query.direction : "";

  return (
    <>
      <PageHero title={dict.apply.title} lead={dict.apply.lead} tone="sand" />
      <div className="shell grid gap-14 py-14 md:py-20 lg:grid-cols-[1.5fr_0.8fr] lg:gap-20">
        <div>
          {isCmsConfigured() ? (
            <ApplyForm
              action={submitApplication.bind(null, locale)}
              dict={dict.apply}
              directions={directions.map((d) => ({ slug: d.slug, name: t(d.name, locale) }))}
              initialKind={kind}
              initialDirection={direction}
            />
          ) : (
            // Без подключённой базы заявку некуда сохранить — честно ведём к прямой связи.
            <div className="rounded-felt border-[1.5px] border-dashed border-wine/30 p-8 md:p-10">
              <p className="text-lg">{dict.apply.offline}</p>
              <a
                href={contact.href}
                {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="btn btn-primary mt-6"
              >
                {contact.isWhatsapp && <MessageCircle className="size-5" aria-hidden />}
                {contact.isWhatsapp ? dict.contact.whatsappButton : dict.nav.contact}
                <ArrowRight className="size-5" aria-hidden />
              </a>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:pt-2">
          {(contact.isWhatsapp || settings.phone) && (
            <div className="rounded-felt bg-linen p-6">
              <p className="font-semibold">{dict.contact.lead}</p>
              <div className="mt-4 flex flex-col gap-3">
                {contact.isWhatsapp && (
                  <a href={contact.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-wine">
                    <MessageCircle className="size-5" aria-hidden />
                    {dict.contact.whatsappButton}
                  </a>
                )}
                {settings.phone && (
                  <a href={telLink(settings.phone)} className="inline-flex min-h-11 items-center gap-2 text-wine">
                    <Phone className="size-5" aria-hidden />
                    {settings.phone}
                  </a>
                )}
              </div>
            </div>
          )}
          <nav aria-label={dict.directions.heading}>
            <p className="text-sm font-semibold text-muted">{dict.directions.heading}</p>
            <ul className="mt-2 space-y-1">
              {directions.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={href(locale, `/directions/${d.slug}`)}
                    className="group display inline-flex items-center gap-2 text-[2.2rem] text-wine no-underline"
                  >
                    {t(d.name, locale)}
                    <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
