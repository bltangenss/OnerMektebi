import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { getEntity, rowTitle } from "@/lib/admin/entities";
import { deleteEntity, setPublished } from "../actions";

const NOTICES: Record<string, string> = {
  saved: "Сохранено. Изменения появятся на сайте в течение минуты.",
  deleted: "Удалено.",
};
const ERRORS: Record<string, string> = {
  consent: "Работу нельзя опубликовать: не отмечено согласие родителей.",
  save: "Не удалось изменить статус. Попробуйте ещё раз.",
  delete: "Не удалось удалить. Попробуйте ещё раз.",
};

export default async function EntityList({ params, searchParams }: PageProps<"/admin/[entity]">) {
  const { entity: key } = await params;
  const entity = getEntity(key);
  if (!entity) notFound();
  const { supabase, email } = await requireAdmin();
  const query = await searchParams;

  const { data, error } = await supabase
    .from(entity.table)
    .select("*")
    .order(entity.orderBy.column, { ascending: entity.orderBy.ascending });
  const rows = (data ?? []) as Record<string, unknown>[];
  const notice = Object.keys(NOTICES).find((k) => query[k]);
  const problem = typeof query.error === "string" ? ERRORS[query.error] : undefined;

  return (
    <AdminShell email={email} title={entity.title} back={{ href: "/admin", label: "Все разделы" }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted">{entity.description}</p>
        <Link href={`/admin/${key}/new`} className="btn btn-primary">
          <Plus className="size-5" aria-hidden />
          Добавить {entity.singular}
        </Link>
      </div>

      {notice && (
        <p role="status" className="mt-6 rounded-felt bg-sand p-4">
          {NOTICES[notice]}
        </p>
      )}
      {(problem || error) && (
        <p role="alert" className="mt-6 rounded-felt bg-wine-soft p-4 text-wine-deep">
          {problem ?? "Не удалось загрузить список. Обновите страницу."}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-10 rounded-felt border-[1.5px] border-dashed border-line p-8 text-center text-muted">
          Здесь пока пусто. Нажмите «Добавить», чтобы создать первую запись.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-felt bg-milk shadow-[0_1px_0_var(--color-line)]">
          {rows.map((r) => {
            const id = String(r.id);
            const published = r.published === true;
            const title = rowTitle(r);
            const date = (r.event_date ?? r.published_at) as string | undefined;
            return (
              <li key={id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-6 md:px-6">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/${key}/${id}`} className="font-semibold text-ink no-underline hover:text-wine">
                    {title}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${published ? "bg-gold text-ink" : "bg-sand"}`}>
                      {published ? "Опубликовано" : "Черновик"}
                    </span>
                    {date && <span>{date}</span>}
                    {key === "works" && r.consent !== true && <span className="text-wine">нет согласия родителей</span>}
                    {entity.publicPath && published && (
                      <a href={entity.publicPath(r)} target="_blank" rel="noopener noreferrer" className="text-muted">
                        {entity.publicPath(r)}
                      </a>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/${key}/${id}`} className="inline-flex min-h-11 items-center gap-1 rounded-felt border border-line px-3 text-sm text-ink no-underline hover:border-wine">
                    <Pencil className="size-4" aria-hidden />
                    Изменить
                  </Link>
                  <form action={setPublished.bind(null, key, id, !published)}>
                    <button type="submit" className="inline-flex min-h-11 items-center gap-1 rounded-felt border border-line px-3 text-sm hover:border-wine">
                      {published ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                      {published ? "Снять с публикации" : "Опубликовать"}
                    </button>
                  </form>
                  <form action={deleteEntity.bind(null, key, id)}>
                    <ConfirmButton
                      message={`Удалить «${title}»? Это действие нельзя отменить, файлы записи тоже будут удалены.`}
                      label={`Удалить «${title}»`}
                      className="inline-flex min-h-11 items-center gap-1 rounded-felt border border-line px-3 text-sm text-wine hover:border-wine"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Удалить
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
