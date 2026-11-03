import Link from "next/link";
import { Camera, MapPin, Phone } from "lucide-react";
import { LogoMark } from "@/components/art/Logo";
import { getSettings } from "@/lib/content";
import { getDictionary, href, t, type Locale } from "@/lib/i18n";
import { telLink } from "@/lib/whatsapp";

export async function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const settings = await getSettings();
  const year = new Date().getFullYear();
  const links = [
    ["about", "/about"],
    ["directions", "/directions"],
    ["talents", "/talents"],
    ["events", "/events"],
    ["contact", "/contact"],
  ] as const;
  const address = t(settings.address, locale);
  const hasContacts = Boolean(address || settings.phone || settings.instagram);

  return (
    <footer className="on-dark bg-ink text-milk">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <Link href={href(locale)} className="inline-flex items-center gap-3 text-milk no-underline">
            <LogoMark className="size-11" />
            <span className="display text-[2.2rem]">{dict.meta.siteName}</span>
          </Link>
          <p className="mt-4 max-w-sm text-[#d9d3cb]">{dict.footer.tagline}</p>
        </div>

        <nav aria-label={dict.footer.sections}>
          <h2 className="text-sm font-semibold tracking-wide text-gold">{dict.footer.sections}</h2>
          <ul className="mt-4 space-y-2">
            {links.map(([key, path]) => (
              <li key={key}>
                <Link href={href(locale, path)} className="text-milk no-underline hover:underline">
                  {dict.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-gold">{dict.footer.contacts}</h2>
          {hasContacts ? (
            <ul className="mt-4 space-y-3 text-milk">
              {address && (
                <li className="flex gap-3">
                  <MapPin className="mt-1 size-4 shrink-0 text-gold" aria-hidden />
                  <span>{address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-3">
                  <Phone className="mt-1 size-4 shrink-0 text-gold" aria-hidden />
                  <a href={telLink(settings.phone)} className="text-milk no-underline hover:underline">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.instagram && (
                <li className="flex gap-3">
                  <Camera className="mt-1 size-4 shrink-0 text-gold" aria-hidden />
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-milk no-underline hover:underline">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-4 text-[#d9d3cb]">
              {dict.meta.city}.{" "}
              <Link href={href(locale, "/contact")} className="text-milk underline">
                {dict.nav.contact}
              </Link>
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-6 text-sm text-[#bdb6ad] md:flex-row md:justify-between">
          <p>
            © {year} {dict.footer.rights}, {dict.meta.city}
          </p>
          <p>{dict.footer.note}</p>
        </div>
      </div>
    </footer>
  );
}
