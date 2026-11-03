import { AdminForm } from "@/components/admin/AdminForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import type { SiteSettings } from "@/types/content";
import { saveSettings } from "../actions";

const control = "mt-1 w-full rounded-felt border border-line bg-white px-3 py-2.5 text-base";

function Pair({ name, label, value, multiline }: { name: string; label: string; value?: { kk: string; ru: string }; multiline?: boolean }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <fieldset>
      <legend className="font-semibold">{label}</legend>
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        {(["kk", "ru"] as const).map((lang) => (
          <label key={lang} className="block text-sm">
            {lang === "kk" ? "Қазақша" : "По-русски"}
            <Tag name={`${name}.${lang}`} defaultValue={value?.[lang] ?? ""} rows={multiline ? 3 : undefined} className={control} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Line({ name, label, value, hint, type = "text" }: { name: string; label: string; value?: string; hint?: string; type?: string }) {
  return (
    <label className="block">
      <span className="font-semibold">{label}</span>
      <input name={name} type={type} defaultValue={value ?? ""} className={control} />
      {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
    </label>
  );
}

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const { supabase, email } = await requireAdmin();
  const { saved } = await searchParams;
  const { data } = await supabase.from("settings").select("data").eq("id", 1).maybeSingle();
  const s = ((data as { data?: SiteSettings } | null)?.data ?? {}) as SiteSettings;

  return (
    <AdminShell email={email} title="Контакты школы" back={{ href: "/admin", label: "Все разделы" }}>
      <p className="text-muted">Указывайте только подтверждённые данные. Пустое поле на сайте не показывается.</p>
      {saved && (
        <p role="status" className="mt-6 rounded-felt bg-sand p-4">
          Сохранено. Изменения появятся на сайте в течение минуты.
        </p>
      )}
      <div className="mt-8 rounded-felt bg-milk p-5 shadow-[0_1px_0_var(--color-line)] md:p-8">
        <AdminForm action={saveSettings} submitLabel="Сохранить">
          <Pair name="address" label="Адрес" value={s.address} />
          <Line name="phone" label="Телефон" value={s.phone} type="tel" hint="Как его увидят посетители: +7 700 123 45 67" />
          <Line
            name="whatsapp"
            label="WhatsApp"
            value={s.whatsapp}
            type="tel"
            hint="Номер в международном формате, только цифры: 77001234567. Кнопки WhatsApp появятся на сайте автоматически."
          />
          <Line name="instagram" label="Instagram" value={s.instagram} type="url" hint="Полная ссылка: https://instagram.com/…" />
          <label className="block">
            <span className="font-semibold">Другие соцсети</span>
            <textarea
              name="otherSocial"
              rows={3}
              defaultValue={(s.otherSocial ?? []).map((x) => `${x.label} | ${x.url}`).join("\n")}
              className={control}
            />
            <span className="mt-1 block text-sm text-muted">По одной на строку: Название | https://ссылка</span>
          </label>
          <Pair name="hours" label="Время работы" value={s.hours} multiline />
          <Line name="mapUrl" label="Ссылка на карту" value={s.mapUrl} type="url" hint="Обычная ссылка 2ГИС или Google Maps на здание школы" />
          <Line
            name="mapEmbedUrl"
            label="Карта для встраивания"
            value={s.mapEmbedUrl}
            type="url"
            hint="Ссылка из кнопки «Поделиться → Встроить карту» (Google Maps, 2ГИС или Яндекс)"
          />
        </AdminForm>
      </div>
    </AdminShell>
  );
}
