import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { EntityFields } from "@/components/admin/EntityFields";
import { requireAdmin } from "@/lib/admin/auth";
import { getEntity, rowTitle } from "@/lib/admin/entities";
import type { Localized } from "@/types/content";
import { saveEntity } from "../../actions";

const UUID = /^[0-9a-f-]{36}$/i;

/** Одна страница для создания (/new) и редактирования (/<id>). */
export default async function EntityEdit({ params }: PageProps<"/admin/[entity]/[id]">) {
  const { entity: key, id } = await params;
  const entity = getEntity(key);
  const isNew = id === "new";
  if (!entity || (!isNew && !UUID.test(id))) notFound();
  const { supabase, email } = await requireAdmin();

  let row: Record<string, unknown> | undefined;
  if (!isNew) {
    const { data } = await supabase.from(entity.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data as Record<string, unknown>;
  } else if (key === "works" || key === "events") {
    row = { [key === "works" ? "published_at" : "event_date"]: new Date().toISOString().slice(0, 10) };
  }

  const [{ data: teachers }, { data: directions }] = await Promise.all([
    supabase.from("teachers").select("id, name").order("sort_order"),
    supabase.from("directions").select("slug, name").order("sort_order"),
  ]);
  const name = (v: unknown) => (v as Localized | null)?.kk || (v as Localized | null)?.ru || "—";

  return (
    <AdminShell
      email={email}
      title={isNew ? `Новое: ${entity.singular}` : rowTitle(row ?? {})}
      back={{ href: `/admin/${key}`, label: entity.title }}
    >
      <div className="rounded-felt bg-milk p-5 shadow-[0_1px_0_var(--color-line)] md:p-8">
        <AdminForm action={saveEntity.bind(null, key, isNew ? null : id)} submitLabel={isNew ? "Создать" : "Сохранить"}>
          <EntityFields
            entity={entity}
            row={row}
            teachers={(teachers ?? []).map((t: { id: string; name: unknown }) => ({ id: t.id, name: name(t.name) }))}
            directions={(directions ?? []).map((d: { slug: string; name: unknown }) => ({ slug: d.slug, name: name(d.name) }))}
          />
        </AdminForm>
      </div>
    </AdminShell>
  );
}
