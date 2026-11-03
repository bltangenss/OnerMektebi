type Props = { title: string; text: string; tone?: "light" | "sand" };

/**
 * Пустое состояние галереи: стена с пустыми рамами, ждущими работ.
 * Честнее вымышленных примеров и не ломает композицию страницы.
 */
export function EmptyFrames({ title, text, tone = "light" }: Props) {
  const frame = tone === "sand" ? "border-wine/30" : "border-ink/20";
  return (
    <div className="relative grid gap-4 sm:grid-cols-[1fr_1.3fr_0.9fr] sm:items-end">
      <div aria-hidden className={`hidden aspect-[4/5] rounded-felt border-[1.5px] border-dashed ${frame} sm:block`} />
      <div className={`flex aspect-[5/4] flex-col items-center justify-center rounded-felt border-[1.5px] border-dashed ${frame} px-6 py-10 text-center`}>
        <p className="display text-[2.4rem] text-wine">{title}</p>
        <p className="mt-3 max-w-md text-muted">{text}</p>
      </div>
      <div aria-hidden className={`hidden aspect-square rounded-felt border-[1.5px] border-dashed ${frame} sm:block`} />
    </div>
  );
}
