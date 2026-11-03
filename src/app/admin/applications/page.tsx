import Link from "next/link";
import { Baby, MessageCircle, Phone, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin/auth";
import { applicationStatuses, type ApplicationRow, type ApplicationStatus } from "@/lib/applications";
import type { Localized } from "@/types/content";
import { deleteApplication, saveApplicationNote, setApplicationStatus } from "../actions";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Закрыта",
};
const STATUS_STYLE: Record<ApplicationStatus, string> = {
  new: "bg-gold text-ink",
  in_progress: "bg-wine-soft text-wine-deep",
  done: "bg-sand text-muted",
};
const KIND_LABEL = { enroll: "Запись на занятия", question: "Вопрос", other: "Другое" } as const;
const ERRORS: Record<string, string> = {
  save: "Не удалось сохранить изменения. Попробуйте ещё раз.",
  delete: "Не удалось удалить заявку. Попробуйте ещё раз.",
};

/** Ответ родителю в WhatsApp на языке, на котором он оставил заявку. */
function replyLink(row: ApplicationRow) {
  const digits = row.phone.replace(/\D/g, "");
  const text =
    row.locale === "ru"
      ? `Здравствуйте, ${row.parent_name}! Пишем из «Өнер мектебі» по вашей заявке.`
      : `Сәлеметсіз бе, ${row.parent_name}! Өнер мектебінен өтініміңіз бойынша жазып отырмыз.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Almaty",
});

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const { supabase, email } = await requireAdmin();
  const query = await searchParams;
  const filter = (applicationStatuses as readonly string[]).includes(String(query.status)) ? String(query.status) : "open";

  const [{ data, error }, { data: dirs }] = await Promise.all([
    supabase.from("applications").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.from("directions").select("slug, name"),
  ]);
  const all = (data ?? []) as ApplicationRow[];
  const names = new Map((dirs ?? []).map((d: { slug: string; name: Localized }) => [d.slug, d.name.ru || d.name.kk]));
  const count = (s: ApplicationStatus) => all.filter((r) => r.status === s).length;
  const rows = filter === "open" ? all.filter((r) => r.status !== "done") : all.filter((r) => r.status === filter);
  const problem = typeof query.error === "string" ? ERRORS[query.error] : undefined;

  const tabs = [
    { key: "open", label: "Активные", n: count("new") + count("in_progress") },
    { key: "new", label: "Новые", n: count("new") },
    { key: "in_progress", label: "В работе", n: count("in_progress") },
    { key: "done", label: "Закрытые", n: count("done") },
  ];

  return (
    <AdminShell email={email} title="Заявки" back={{ href: "/admin", label: "Все разделы" }}>
      <p className="text-muted">
        Заявки на запись и вопросы с сайта. Видны только администраторам. Закрытые заявки с личными данными лучше удалять,
        когда они больше не нужны.
      </p>

      <nav aria-label="Фильтр заявок" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "open" ? "/admin/applications" : `/admin/applications?status=${tab.key}`}
            aria-current={filter === tab.key ? "page" : undefined}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-ink no-underline hover:border-wine aria-[current=page]:border-wine aria-[current=page]:bg-wine aria-[current=page]:text-milk"
          >
            {tab.label}
            <span className="tabular-nums opacity-70">{tab.n}</span>
          </Link>
        ))}
      </nav>

      {(problem || error) && (
        <p role="alert" className="mt-6 rounded-felt bg-wine-soft p-4 text-wine-deep">
          {problem ?? "Не удалось загрузить заявки. Обновите страницу."}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-8 rounded-felt border-[1.5px] border-dashed border-line p-8 text-center text-muted">
          {filter === "open" ? "Новых заявок нет." : "Здесь пока пусто."}
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-felt bg-milk p-5 shadow-[0_1px_0_var(--color-line)] md:p-6">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
                <span className="font-semibold">{KIND_LABEL[r.kind]}</span>
                {r.direction_slug && <span className="text-muted">· {names.get(r.direction_slug) ?? r.direction_slug}</span>}
                <span className="ml-auto text-muted tabular-nums">{dateFmt.format(new Date(r.created_at))}</span>
              </div>

              <p className="mt-3 text-xl font-semibold">{r.parent_name}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <a href={`tel:${r.phone}`} className="inline-flex min-h-11 items-center gap-1.5 text-wine">
                  <Phone className="size-4" aria-hidden />
                  {r.phone}
                </a>
                <a href={replyLink(r)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-wine">
                  <MessageCircle className="size-4" aria-hidden />
                  Ответить в WhatsApp
                </a>
                <span className="inline-flex min-h-11 items-center text-muted">
                  Удобнее: {r.contact_method === "call" ? "звонок" : "WhatsApp"} · язык: {r.locale === "ru" ? "русский" : "казахский"}
                </span>
                {r.child_age && (
                  <span className="inline-flex min-h-11 items-center gap-1.5 text-muted">
                    <Baby className="size-4" aria-hidden />
                    {r.child_age} лет
                  </span>
                )}
              </div>
              {r.message && <p className="mt-3 rounded-felt bg-linen p-3 whitespace-pre-line">{r.message}</p>}

              <form action={saveApplicationNote.bind(null, r.id)} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor={`note-${r.id}`}>
                  Заметка
                </label>
                <input
                  id={`note-${r.id}`}
                  name="note"
                  defaultValue={r.admin_note ?? ""}
                  placeholder="Заметка для коллег: что ответили, когда перезвонить"
                  className="min-h-11 flex-1 rounded-felt border border-line bg-white px-3"
                />
                <button type="submit" className="min-h-11 rounded-felt border border-line px-4 text-sm hover:border-wine">
                  Сохранить заметку
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                {applicationStatuses
                  .filter((s) => s !== r.status)
                  .map((s) => (
                    <form key={s} action={setApplicationStatus.bind(null, r.id, s)}>
                      <button type="submit" className="min-h-11 rounded-felt border border-line px-3 text-sm hover:border-wine">
                        {s === "new" ? "Вернуть в новые" : s === "in_progress" ? "Взять в работу" : "Закрыть"}
                      </button>
                    </form>
                  ))}
                <form action={deleteApplication.bind(null, r.id)} className="ml-auto">
                  <ConfirmButton
                    message={`Удалить заявку от «${r.parent_name}»? Восстановить её будет нельзя.`}
                    className="inline-flex min-h-11 items-center gap-1 rounded-felt border border-line px-3 text-sm text-wine hover:border-wine"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Удалить
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
