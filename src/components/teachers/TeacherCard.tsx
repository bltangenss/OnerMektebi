import { Picture } from "@/components/ui/Picture";
import { t, type Locale } from "@/lib/i18n";
import type { Teacher } from "@/types/content";
import { LogoMark } from "@/components/art/Logo";

type Props = { teacher: Teacher; locale: Locale; withBio?: boolean };

export function TeacherCard({ teacher, locale, withBio }: Props) {
  const name = t(teacher.name, locale);
  return (
    <article>
      <div className="relative aspect-[4/5] overflow-hidden rounded-felt bg-sand">
        {teacher.photo ? (
          <Picture src={teacher.photo} alt={name} sizes="(min-width: 1024px) 25vw, 50vw" />
        ) : (
          <div className="flex size-full items-center justify-center text-wine/40">
            <LogoMark className="size-20" />
          </div>
        )}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{name}</h3>
      <p className="text-wine">{t(teacher.role, locale)}</p>
      {withBio && teacher.bio && <p className="mt-2 text-muted">{t(teacher.bio, locale)}</p>}
    </article>
  );
}
