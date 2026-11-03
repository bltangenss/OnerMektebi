import type { SchoolEvent, Work } from "@/types/content";

/**
 * Демонстрационные материалы. Показываются только при
 * NEXT_PUBLIC_DEMO_CONTENT=true и всегда помечены «Үлгі / Образец».
 * Рисунки нарисованы для проекта, мелодия синтезирована: это не работы учеников.
 */
export const demoWorks: Work[] = [
  {
    id: "demo-art-1",
    kind: "image",
    directionSlug: "art",
    title: { kk: "Дала таңы", ru: "Рассвет в степи" },
    description: { kk: "Гуашь. Демонстрациялық үлгі.", ru: "Гуашь. Демонстрационный образец." },
    image: "/demo/art-1.svg",
    publishedAt: "2026-10-20",
    consent: true,
    published: true,
    isDemo: true,
  },
  {
    id: "demo-kui-1",
    kind: "audio",
    directionSlug: "kui",
    title: { kk: "Үлгі әуен", ru: "Пробная мелодия" },
    description: {
      kk: "Синтезделген үлгі дыбыс, плеердің жұмысын көрсету үшін.",
      ru: "Синтезированный образец, чтобы показать работу плеера.",
    },
    mediaUrl: "/demo/kui-demo.wav",
    publishedAt: "2026-10-18",
    consent: true,
    published: true,
    isDemo: true,
  },
  {
    id: "demo-art-2",
    kind: "image",
    directionSlug: "art",
    title: { kk: "Киіз үй", ru: "Юрта" },
    image: "/demo/art-2.svg",
    publishedAt: "2026-10-12",
    consent: true,
    published: true,
    isDemo: true,
  },
  {
    id: "demo-aitys-1",
    kind: "video",
    directionSlug: "aitys",
    title: { kk: "Айтыс үзіндісі", ru: "Фрагмент айтыса" },
    description: {
      kk: "Бейнеплеердің жұмысын көрсетуге арналған үлгі.",
      ru: "Образец для проверки видеоплеера.",
    },
    image: "/demo/aitys-poster.svg",
    mediaUrl: "/demo/aitys-demo.webm",
    publishedAt: "2026-10-05",
    consent: true,
    published: true,
    isDemo: true,
  },
  {
    id: "demo-art-3",
    kind: "image",
    directionSlug: "art",
    title: { kk: "Қызғалдақтар", ru: "Тюльпаны" },
    image: "/demo/art-3.svg",
    authorName: { kk: "Үлгі автор", ru: "Автор-образец" },
    publishedAt: "2026-09-28",
    consent: true,
    published: true,
    isDemo: true,
  },
  {
    id: "demo-art-4",
    kind: "image",
    directionSlug: "art",
    title: { kk: "Тау мен бұлт", ru: "Горы и облака" },
    image: "/demo/art-4.svg",
    publishedAt: "2026-09-15",
    consent: true,
    published: true,
    isDemo: true,
  },
];

export const demoEvents: SchoolEvent[] = [
  {
    slug: "demo-new-year-concert",
    category: "concert",
    title: { kk: "Жаңа жылдық концерт", ru: "Новогодний концерт" },
    summary: {
      kk: "Шәкірттердің күй орындаулары мен айтыс. Демонстрациялық үлгі.",
      ru: "Кюи и айтыс в исполнении учеников. Демонстрационный образец.",
    },
    body: {
      kk: "Бұл — сайттағы іс-шара беті қалай көрінетінін көрсететін үлгі. Нақты іс-шаралар әкімшілік панелі арқылы жарияланады.",
      ru: "Это образец, показывающий, как выглядит страница мероприятия. Настоящие мероприятия публикуются через панель администратора.",
    },
    startsAt: "2026-12-26T16:00:00+05:00",
    place: { kk: "Үлгі мекенжай", ru: "Адрес-образец" },
    gallery: [],
    published: true,
    isDemo: true,
  },
  {
    slug: "demo-art-exhibition",
    category: "exhibition",
    title: { kk: "Балалар суретінің көрмесі", ru: "Выставка детского рисунка" },
    summary: {
      kk: "Сурет бағыты шәкірттерінің жұмыстары. Демонстрациялық үлгі.",
      ru: "Работы учеников направления рисования. Демонстрационный образец.",
    },
    startsAt: "2027-01-16",
    image: "/demo/art-2.svg",
    gallery: [],
    published: true,
    isDemo: true,
  },
  {
    slug: "demo-autumn-festival",
    category: "event",
    title: { kk: "Күз мерекесі", ru: "Осенний праздник" },
    summary: {
      kk: "Өткен іс-шараның үлгісі: суреттер галереясымен.",
      ru: "Образец прошедшего мероприятия с галереей.",
    },
    body: {
      kk: "Өткен іс-шараның беті осылай көрінеді: сипаттама және суреттер галереясы.",
      ru: "Так выглядит страница прошедшего мероприятия: описание и галерея фотографий.",
    },
    startsAt: "2026-10-10",
    image: "/demo/art-1.svg",
    gallery: ["/demo/art-1.svg", "/demo/art-3.svg", "/demo/art-4.svg"],
    published: true,
    isDemo: true,
  },
];
