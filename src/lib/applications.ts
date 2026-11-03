/** Заявка от родителя: запись на занятия, вопрос или другое обращение. */

export const applicationKinds = ["enroll", "question", "other"] as const;
export type ApplicationKind = (typeof applicationKinds)[number];

export const contactMethods = ["whatsapp", "call"] as const;
export type ContactMethod = (typeof contactMethods)[number];

export const applicationStatuses = ["new", "in_progress", "done"] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

export type ApplicationInput = {
  kind: ApplicationKind;
  parentName: string;
  phone: string;
  contactMethod: ContactMethod;
  directionSlug: string | null;
  childAge: number | null;
  message: string | null;
};

/** Ключи ошибок совпадают с ключами словаря apply.errors. */
export type ApplicationErrorKey = "name" | "phone" | "age" | "message" | "consent" | "kind";

export type ApplicationRow = {
  id: string;
  created_at: string;
  kind: ApplicationKind;
  parent_name: string;
  phone: string;
  contact_method: ContactMethod;
  direction_slug: string | null;
  child_age: number | null;
  message: string | null;
  locale: "kk" | "ru";
  status: ApplicationStatus;
  admin_note: string | null;
};

/** Телефон в виде +7XXXXXXXXXX. Казахстанские 8XXXXXXXXXX приводятся к +7. */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
}

/**
 * Проверка формы на сервере. Возвращает данные или список полей с ошибками.
 * Данные ребёнка ограничены возрастом: имя ребёнка не собирается.
 */
export function parseApplication(
  form: FormData,
  directionSlugs: string[],
): { data?: ApplicationInput; errors: ApplicationErrorKey[] } {
  const s = (k: string) => String(form.get(k) ?? "").trim();
  const errors: ApplicationErrorKey[] = [];

  const kind = s("kind") as ApplicationKind;
  if (!applicationKinds.includes(kind)) errors.push("kind");

  const parentName = s("parentName").replace(/\s+/g, " ");
  if (parentName.length < 2 || parentName.length > 80) errors.push("name");

  const phone = normalizePhone(s("phone"));
  if (!phone) errors.push("phone");

  const method = s("contactMethod") as ContactMethod;
  const contactMethod = contactMethods.includes(method) ? method : "whatsapp";

  const direction = s("direction");
  const directionSlug = directionSlugs.includes(direction) ? direction : null;

  const ageRaw = s("childAge");
  const age = ageRaw ? Number.parseInt(ageRaw, 10) : null;
  if (age !== null && (!Number.isInteger(age) || age < 3 || age > 18)) errors.push("age");

  const message = s("message");
  if (message.length > 1000) errors.push("message");

  if (form.get("consent") !== "on") errors.push("consent");

  if (errors.length) return { errors };
  return {
    errors,
    data: {
      kind,
      parentName,
      phone: phone!,
      contactMethod,
      directionSlug,
      childAge: age,
      message: message || null,
    },
  };
}
