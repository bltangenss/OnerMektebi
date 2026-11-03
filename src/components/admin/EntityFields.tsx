import type { Entity, Field } from "@/lib/admin/entities";
import type { DirectionSection, Localized } from "@/types/content";
import { FileField } from "./FileField";
import { GalleryField } from "./GalleryField";
import { SectionsField } from "./SectionsField";

type Row = Record<string, unknown>;
type Props = {
  entity: Entity;
  row?: Row;
  teachers: { id: string; name: string }[];
  directions: { slug: string; name: string }[];
};

const control = "mt-1 w-full rounded-felt border border-line bg-white px-3 py-2.5 text-base";

function Hint({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-sm text-muted">{text}</p> : null;
}

function FieldView({ f, row, entity, teachers, directions }: { f: Field; row?: Row } & Omit<Props, "row">) {
  const v = row?.[f.name];
  const folder = entity.key;

  switch (f.type) {
    case "localized": {
      const val = (v as Localized | null) ?? { kk: "", ru: "" };
      const Tag = f.multiline ? "textarea" : "input";
      return (
        <fieldset>
          <legend className="font-semibold">
            {f.label}
            {f.required && <span className="text-wine"> *</span>}
          </legend>
          <Hint text={f.hint} />
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {(["kk", "ru"] as const).map((lang) => (
              <label key={lang} className="block text-sm">
                {lang === "kk" ? "Қазақша" : "По-русски"}
                <Tag
                  name={`${f.name}.${lang}`}
                  defaultValue={val[lang] ?? ""}
                  lang={lang}
                  rows={f.multiline ? 5 : undefined}
                  required={f.required && lang === "kk"}
                  className={control}
                />
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    case "text":
    case "number":
    case "date":
    case "time":
      return (
        <label className="block">
          <span className="font-semibold">
            {f.label}
            {"required" in f && f.required && <span className="text-wine"> *</span>}
          </span>
          <input
            name={f.name}
            type={f.type}
            defaultValue={v === null || v === undefined ? "" : String(v).slice(0, f.type === "time" ? 5 : undefined)}
            required={"required" in f ? f.required : undefined}
            className={`${control} ${f.type === "text" ? "" : "max-w-xs"}`}
          />
          <Hint text={"hint" in f ? f.hint : undefined} />
          {f.type === "text" && f.patternHint && <Hint text={f.patternHint} />}
        </label>
      );
    case "select":
      return (
        <label className="block">
          <span className="font-semibold">{f.label}</span>
          <select name={f.name} defaultValue={(v as string) ?? f.options[0].value} className={`${control} max-w-md`}>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
    case "direction":
      return (
        <label className="block">
          <span className="font-semibold">{f.label}</span>
          <select name={f.name} defaultValue={(v as string) ?? directions[0]?.slug} className={`${control} max-w-md`}>
            {directions.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      );
    case "checkbox":
      return (
        <label className="flex items-start gap-3">
          <input type="checkbox" name={f.name} defaultChecked={v === true} className="mt-1 size-5 accent-[var(--color-wine)]" />
          <span>
            <span className="font-semibold">{f.label}</span>
            <Hint text={f.hint} />
          </span>
        </label>
      );
    case "file":
      return <FileField name={f.name} label={f.label} accept={f.accept} folder={folder} defaultValue={v as string | null} hint={f.hint} />;
    case "gallery":
      return <GalleryField name={f.name} label={f.label} folder={folder} defaultValue={v as string[] | null} hint={f.hint} />;
    case "sections":
      return <SectionsField name={f.name} label={f.label} defaultValue={v as DirectionSection[] | null} />;
    case "teachers": {
      const chosen = (v as string[] | null) ?? [];
      return (
        <fieldset>
          <legend className="font-semibold">{f.label}</legend>
          {teachers.length ? (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {teachers.map((t) => (
                <label key={t.id} className="flex items-center gap-2">
                  <input type="checkbox" name={f.name} value={t.id} defaultChecked={chosen.includes(t.id)} className="size-5 accent-[var(--color-wine)]" />
                  {t.name}
                </label>
              ))}
            </div>
          ) : (
            <Hint text="Сначала добавьте педагогов в разделе «Педагоги»." />
          )}
        </fieldset>
      );
    }
  }
}

export function EntityFields(props: Props) {
  return (
    <div className="space-y-8">
      {props.entity.fields.map((f) => (
        <FieldView key={f.name} f={f} {...props} />
      ))}
    </div>
  );
}
