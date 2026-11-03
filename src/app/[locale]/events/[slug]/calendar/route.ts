import { getEvent } from "@/lib/content";
import { hasTime, toTimestamp } from "@/lib/dates";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";

/** Экранирование текста по RFC 5545. */
function esc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Строки длиннее 75 байт переносятся с пробелом в начале. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 74) {
    let cut = 74;
    while (Buffer.byteLength(rest.slice(0, cut)) > 74) cut--;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

const utc = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const day = (iso: string) => iso.slice(0, 10).replace(/-/g, "");

/** «Күнтізбеге қосу»: событие одним файлом для календаря телефона. */
export async function GET(_: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const event = isLocale(locale) ? await getEvent(slug) : undefined;
  if (!event || !isLocale(locale)) return new Response("Not found", { status: 404 });

  const dict = getDictionary(locale);
  const url = `${siteUrl}/${locale}/events/${slug}`;
  const place = t(event.place, locale);
  let when: string[];
  if (hasTime(event.startsAt)) {
    const start = toTimestamp(event.startsAt);
    // Длительность неизвестна: в календаре ставим два часа как ориентир.
    when = [`DTSTART:${utc(start)}`, `DTEND:${utc(start + 2 * 3600_000)}`];
  } else {
    const next = new Date(`${event.startsAt}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    when = [`DTSTART;VALUE=DATE:${day(event.startsAt)}`, `DTEND;VALUE=DATE:${day(next.toISOString())}`];
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Oner mektebi//Events//KK",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${slug}@oner-mektebi`,
    `DTSTAMP:${utc(Date.now())}`,
    ...when,
    `SUMMARY:${esc(`${t(event.title, locale)} — ${dict.meta.siteName}`)}`,
    `DESCRIPTION:${esc(`${t(event.summary, locale)}\n${url}`)}`,
    ...(place ? [`LOCATION:${esc(place)}`] : []),
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
