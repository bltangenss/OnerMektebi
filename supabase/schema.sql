-- Өнер мектебі — схема CMS для Supabase.
-- Выполните целиком в SQL Editor нового проекта Supabase (повторный запуск безопасен).
-- Публика читает только опубликованное; писать может только администратор.

-- ───────────────────────── Администраторы ─────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins see themselves" on public.admins;
create policy "admins see themselves" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ───────────────────────── Контент ─────────────────────────
create table if not exists public.directions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  sort_order int not null default 100,
  theme text not null default 'plain' check (theme in ('strings', 'voices', 'brush', 'plain')),
  name jsonb not null,
  title jsonb not null,
  summary jsonb not null,
  sections jsonb not null default '[]'::jsonb,
  image text,
  teacher_ids uuid[] not null default '{}',
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 100,
  name jsonb not null,
  role jsonb not null,
  bio jsonb,
  photo text,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video', 'audio')),
  direction_slug text not null,
  title jsonb not null,
  description jsonb,
  image text,
  media_url text,
  youtube_id text check (youtube_id is null or youtube_id ~ '^[A-Za-z0-9_-]{6,20}$'),
  author_name jsonb,
  published_at date not null default current_date,
  consent boolean not null default false,
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  -- Работа ребёнка не может быть опубликована без согласия родителей.
  constraint works_consent_before_publish check (not published or consent)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category text not null check (category in ('concert', 'exhibition', 'contest', 'event', 'announcement')),
  title jsonb not null,
  summary jsonb not null,
  body jsonb,
  event_date date not null,
  event_time time,
  place jsonb,
  image text,
  gallery text[] not null default '{}',
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  year text,
  sort_order int not null default 100,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  text jsonb not null,
  sort_order int not null default 100,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ───────────────────────── Политики доступа ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array['directions', 'teachers', 'works', 'events', 'achievements', 'history'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public reads published" on public.%I', t);
    execute format('drop policy if exists "admin manages" on public.%I', t);
    execute format(
      'create policy "public reads published" on public.%I for select to anon, authenticated using (published or public.is_admin())', t);
    execute format(
      'create policy "admin manages" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Работы без согласия не видны публике, даже если флаг публикации выставлен вручную.
drop policy if exists "public reads published" on public.works;
create policy "public reads published" on public.works
  for select to anon, authenticated using ((published and consent) or public.is_admin());

alter table public.settings enable row level security;
drop policy if exists "public reads settings" on public.settings;
drop policy if exists "admin updates settings" on public.settings;
create policy "public reads settings" on public.settings for select to anon, authenticated using (true);
create policy "admin updates settings" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Хранилище файлов ─────────────────────────
-- Ограничения размера и типов проверяются самим Supabase Storage на сервере.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif',
        'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/ogg',
        'video/mp4', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin uploads media" on storage.objects;
drop policy if exists "admin updates media" on storage.objects;
drop policy if exists "admin deletes media" on storage.objects;
create policy "admin uploads media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admin updates media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admin deletes media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ───────────────────────── Стартовые направления ─────────────────────────
-- Тексты те же, что в src/content/directions.ts. Педагоги не привязаны.
insert into public.directions (slug, sort_order, theme, name, title, summary, sections, published) values
('kui', 1, 'strings',
 '{"kk":"Күй","ru":"Кюй"}',
 '{"kk":"Күй өнері — ұлттық мұраның үні","ru":"Кюй — голос национального наследия"}',
 '{"kk":"Домбыра тартуды үйреніп, қазақтың музыкалық мұрасымен танысу.","ru":"Игра на домбре и знакомство с казахским музыкальным наследием."}',
 '[{"heading":{"kk":"Күй дегеніміз не","ru":"Что такое кюй"},"body":{"kk":"Күй — сөзсіз айтылатын әңгіме. Домбыраның екі ішегі арқылы орындаушы табиғатты, тарихи оқиғаны немесе адамның көңіл күйін жеткізеді. Қазақтың домбыра күйі өнері ЮНЕСКО-ның адамзаттың материалдық емес мәдени мұрасы тізіміне енген.","ru":"Кюй — это рассказ без слов. На двух струнах домбры исполнитель передаёт природу, историческое событие или состояние человека. Традиционное искусство казахского домбрового кюя внесено в список нематериального культурного наследия ЮНЕСКО."}},
   {"heading":{"kk":"Балалар нені үйрене алады","ru":"Чему могут научиться дети"},"body":{"kk":"Домбыраны дұрыс ұстау, қағыс түрлері, ырғақ пен әуенді есту, алғашқы күйлерді орындау. Бастысы — музыканы тыңдап қана қоймай, оны өз қолымен жасау қуанышы.","ru":"Правильно держать домбру, осваивать приёмы игры, слышать ритм и мелодию, исполнять первые кюи. А главное — радость не только слушать музыку, но и создавать её своими руками."}},
   {"heading":{"kk":"Сабақ қалай өтеді","ru":"Как проходят занятия"},"body":{"kk":"Домбыра шыдамдылық пен тұрақты жаттығуды қажет етеді, сондықтан әр қадам біртіндеп, ұстаздың қасында игеріледі. Сабақ форматы мен кестесін мектеп әкімшілігінен нақтылауға болады.","ru":"Домбра требует терпения и регулярной практики, поэтому каждый шаг осваивается постепенно, рядом с педагогом. Формат занятий и расписание можно уточнить у администрации школы."}}]',
 true),
('aitys', 2, 'voices',
 '{"kk":"Айтыс","ru":"Айтыс"}',
 '{"kk":"Айтыс — сөз өнерінің биік шыңы","ru":"Айтыс — вершина искусства слова"}',
 '{"kk":"Суырып салма өлең, шешендік және сахнада еркін сөйлеу өнері.","ru":"Поэтическая импровизация, красноречие и уверенность на сцене."}',
 '[{"heading":{"kk":"Айтыспен танысу","ru":"Знакомство с айтысом"},"body":{"kk":"Айтыс — екі ақынның домбыра сүйемелдеуімен өтетін сөз сайысы. Мұнда ой жүйрік, тіл ұтқыр болуы керек. Айтыс өнері ЮНЕСКО-ның материалдық емес мәдени мұра тізіміне енген.","ru":"Айтыс — словесное состязание двух акынов под домбру. Здесь важны быстрая мысль и меткое слово. Искусство айтыса внесено в список нематериального культурного наследия ЮНЕСКО."}},
   {"heading":{"kk":"Бейнелі ойлау","ru":"Образное мышление"},"body":{"kk":"Бала сөздің мағынасын сезінуге, теңеу мен бейне табуға, ойын әдемі жеткізуге дағдыланады. Ана тіліне деген сүйіспеншілік осылай қалыптасады.","ru":"Ребёнок учится чувствовать значение слова, находить сравнения и образы, красиво выражать мысль. Так рождается любовь к родному языку."}},
   {"heading":{"kk":"Суырып салма өлең","ru":"Поэтическая импровизация"},"body":{"kk":"Ұйқас пен ырғақ әдетке айналғанда, өлең сол сәтте туа бастайды. Бала қателесуден қорықпай, ойын тез жинақтап, серігіне жауап беруге үйренеді.","ru":"Когда рифма и ритм становятся привычными, стихи начинают рождаться прямо в моменте. Ребёнок учится не бояться ошибок, быстро собирать мысль и отвечать собеседнику."}},
   {"heading":{"kk":"Сахнада өнер көрсету","ru":"Выступление на сцене"},"body":{"kk":"Дауысты басқару, көрерменге қарап сөйлеу, толқуды жеңу — бұл дағдылар сахнадан тыс жерде де өмір бойы керек болады.","ru":"Управлять голосом, говорить с залом, справляться с волнением — эти навыки пригодятся не только на сцене, но и в жизни."}}]',
 true),
('art', 3, 'brush',
 '{"kk":"Сурет","ru":"Рисование"}',
 '{"kk":"Сурет өнері — қиялға қанат","ru":"Изобразительное искусство — крылья для фантазии"}',
 '{"kk":"Түс, пішін және қиял арқылы өз әлеміңді қағазға түсіру.","ru":"Цвет, форма и воображение: свой мир на листе бумаги."}',
 '[{"heading":{"kk":"Бағыт туралы","ru":"О направлении"},"body":{"kk":"Сурет — бала әлі сөзбен айта алмайтын ойын жеткізудің тәсілі. Бұл бағытта бейнелеу өнерінің негіздерімен танысып, әртүрлі материалмен еркін жұмыс істеуге үйренеді.","ru":"Рисунок — способ сказать то, что ребёнку пока трудно выразить словами. Здесь дети знакомятся с основами изобразительного искусства и учатся свободно работать с разными материалами."}},
   {"heading":{"kk":"Дамитын дағдылар","ru":"Какие навыки развиваются"},"body":{"kk":"Байқампаздық, композиция сезімі, түстерді үйлестіру, қолдың ептілігі. Ең бастысы — өз көзқарасыңа сену.","ru":"Наблюдательность, чувство композиции, умение сочетать цвета, точность руки. И самое важное — доверие к собственному взгляду."}},
   {"heading":{"kk":"Сабақтағы атмосфера","ru":"Атмосфера занятий"},"body":{"kk":"Мұнда «дұрыс емес» сурет болмайды. Әр жұмыс — ізденіс, ал ұстаз баланың өз жолын табуына көмектеседі.","ru":"Здесь нет «неправильных» рисунков. Каждая работа — поиск, а педагог помогает ребёнку найти свой путь."}}]',
 true)
on conflict (slug) do nothing;

-- ───────────────────────── Первый администратор ─────────────────────────
-- 1. Authentication → Users → Add user (email и пароль сотрудника).
-- 2. Выполните, подставив email:
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'staff@example.com';
