import { NextResponse, type NextRequest } from "next/server";
import { refreshAdminSession } from "@/lib/supabase/proxy-session";

const LOCALES = ["kk", "ru"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return refreshAdminSession(request);
  }

  const first = pathname.split("/")[1];
  if (LOCALES.includes(first)) return NextResponse.next();

  // Адрес без языка ведёт на казахскую версию той же страницы.
  const url = request.nextUrl.clone();
  url.pathname = `/kk${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|icon.svg|robots.txt|sitemap.xml|demo/|.*\\.[\\w]+$).*)"],
};
