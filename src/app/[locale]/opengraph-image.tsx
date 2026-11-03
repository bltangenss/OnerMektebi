import { ImageResponse } from "next/og";
import { getDictionary, isLocale } from "@/lib/i18n";

export const alt = "Өнер мектебі";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Подгружает только нужные буквы шрифта, чтобы казахские символы отрисовались. */
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:wght@700&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Превью ссылки для WhatsApp, Telegram и соцсетей. */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "kk";
  const dict = getDictionary(locale);
  const title = dict.meta.siteName;
  const line = dict.hero.titleLines.join(" ");
  const city = dict.meta.city;
  const font = await loadFont(`${title}${line}${city}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#6b3042",
          color: "#f8f6f1",
          fontFamily: font ? "Fira" : "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, top: 386, height: 2, background: "#c49a60" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 404, height: 2, background: "#c49a60" }} />
        <div style={{ display: "flex", flexDirection: "column", padding: "80px 90px", width: "100%" }}>
          <div style={{ fontSize: 132, lineHeight: 1, letterSpacing: -1 }}>{title}</div>
          <div style={{ fontSize: 54, marginTop: 24, color: "#ede6da" }}>{line}</div>
          <div style={{ fontSize: 40, marginTop: "auto", color: "#c49a60" }}>{city}</div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Fira", data: font, weight: 700, style: "normal" }] : undefined },
  );
}
