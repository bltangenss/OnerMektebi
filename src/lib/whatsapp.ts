/**
 * Ссылка на чат WhatsApp с заготовленным сообщением.
 * Возвращает undefined, если номер не задан: кнопка тогда не рисуется.
 */
export function whatsappLink(phone: string | undefined, message: string): string | undefined {
  const digits = phone?.replace(/\D/g, "");
  if (!digits || digits.length < 10) return undefined;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | undefined): string | undefined {
  const cleaned = phone?.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : undefined;
}
