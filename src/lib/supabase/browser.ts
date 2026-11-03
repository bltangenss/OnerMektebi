"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

let client: ReturnType<typeof createBrowserClient> | undefined;

/** Клиент в браузере сотрудника: нужен для прямой загрузки файлов в Storage. */
export function browserClient() {
  client ??= createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
