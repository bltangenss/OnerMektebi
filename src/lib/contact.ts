import { getDictionary, href, format, type Locale } from "./i18n";
import { getSettings } from "./content";
import { whatsappLink } from "./whatsapp";

export type ContactAction = { href: string; external: boolean; isWhatsapp: boolean };

/**
 * Главное действие «Связаться»: WhatsApp школы с готовым сообщением,
 * а если номер ещё не подтверждён — страница контактов.
 */
export async function getContactAction(locale: Locale, directionName?: string): Promise<ContactAction> {
  const settings = await getSettings();
  const dict = getDictionary(locale);
  const message = directionName
    ? format(dict.contact.messageDirection, { name: directionName })
    : dict.contact.messageGeneral;
  const wa = whatsappLink(settings.whatsapp, message);
  return wa
    ? { href: wa, external: true, isWhatsapp: true }
    : { href: href(locale, "/contact"), external: false, isWhatsapp: false };
}
