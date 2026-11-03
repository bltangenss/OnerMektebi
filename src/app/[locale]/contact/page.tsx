import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Camera, Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { WhatsappPicker } from "@/components/contact/WhatsappPicker";
import { PageHero } from "@/components/ui/PageHero";
import { getDirections, getSettings } from "@/lib/content";
import { format, getDictionary, isLocale, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/contact", title: dict.contact.title, description: dict.meta.contactDescription });
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 py-6">
      <span className="mt-1 text-wine">{icon}</span>
      <div>
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="mt-1 text-xl font-semibold">{children}</dd>
      </div>
    </div>
  );
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const [settings, directions] = await Promise.all([getSettings(), getDirections()]);

  const address = t(settings.address, locale);
  const hours = t(settings.hours, locale);
  const phone = settings.whatsapp?.replace(/\D/g, "");
  const hasWhatsapp = Boolean(whatsappLink(settings.whatsapp, ""));
  const hasAny = Boolean(address || settings.phone || hasWhatsapp || settings.instagram || hours || settings.otherSocial?.length);

  const options = [
    { value: "general", label: dict.contact.anyDirection, message: dict.contact.messageGeneral },
    ...directions.map((d) => ({
      value: d.slug,
      label: t(d.name, locale),
      message: format(dict.contact.messageDirection, { name: t(d.name, locale) }),
    })),
  ];

  return (
    <>
      <PageHero title={dict.contact.title} lead={dict.contact.lead} tone="sand" />

      <div className="shell grid gap-14 py-14 md:py-20 lg:grid-cols-[1fr_1fr] lg:gap-20">
        {hasAny ? (
          <dl className="divide-y divide-line border-y border-line">
            {address && (
              <Row icon={<MapPin className="size-6" aria-hidden />} label={dict.contact.address}>
                {address}
              </Row>
            )}
            {settings.phone && (
              <Row icon={<Phone className="size-6" aria-hidden />} label={dict.contact.phone}>
                <a href={telLink(settings.phone)} className="text-ink no-underline hover:text-wine hover:underline">
                  {settings.phone}
                </a>
              </Row>
            )}
            {settings.instagram && (
              <Row icon={<Camera className="size-6" aria-hidden />} label={dict.contact.instagram}>
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-ink no-underline hover:text-wine hover:underline">
                  {settings.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}
                </a>
              </Row>
            )}
            {settings.otherSocial?.map((s) => (
              <Row key={s.url} icon={<ExternalLink className="size-6" aria-hidden />} label={dict.contact.social}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink no-underline hover:text-wine hover:underline">
                  {s.label}
                </a>
              </Row>
            ))}
            {hours && (
              <Row icon={<Clock className="size-6" aria-hidden />} label={dict.contact.hours}>
                <span className="whitespace-pre-line">{hours}</span>
              </Row>
            )}
          </dl>
        ) : (
          <div className="rounded-felt border-[1.5px] border-dashed border-wine/30 p-8 md:p-10">
            <p className="display text-[2.4rem] text-wine">{dict.meta.city}</p>
            <p className="measure mt-3 text-lg text-muted">{dict.contact.pending}</p>
          </div>
        )}

        <div className="space-y-10">
          {hasWhatsapp && phone && (
            <section aria-labelledby="wa-title" className="rounded-felt bg-sand p-6 md:p-8">
              <h2 id="wa-title" className="display text-[2.6rem]">
                {dict.contact.whatsapp}
              </h2>
              <div className="mt-5">
                <WhatsappPicker
                  phone={phone}
                  label={dict.contact.chooseDirection}
                  button={dict.contact.whatsappButton}
                  options={options}
                />
              </div>
            </section>
          )}
          {settings.mapEmbedUrl && (
            <section aria-labelledby="map-title">
              <h2 id="map-title" className="display text-[2.6rem]">
                {dict.contact.map}
              </h2>
              <iframe
                src={settings.mapEmbedUrl}
                title={`${dict.contact.map}: ${dict.meta.siteName}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-5 aspect-[4/3] w-full rounded-felt border-0 bg-sand"
              />
            </section>
          )}
          {settings.mapUrl && (
            <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline text-wine">
              <MapPin className="size-5" aria-hidden />
              {dict.contact.openMap}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
