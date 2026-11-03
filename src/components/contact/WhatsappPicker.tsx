"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

type Option = { value: string; label: string; message: string };

type Props = {
  phone: string;
  label: string;
  button: string;
  options: Option[];
};

/** Выбор направления меняет заготовленный текст сообщения в WhatsApp. */
export function WhatsappPicker({ phone, label, button, options }: Props) {
  const [value, setValue] = useState(options[0]?.value ?? "");
  const current = options.find((o) => o.value === value) ?? options[0];
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(current?.message ?? "")}`;

  return (
    <div>
      <label htmlFor="wa-topic" className="block text-sm font-semibold">
        {label}
      </label>
      <select
        id="wa-topic"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 min-h-12 w-full rounded-felt border border-line bg-milk px-4 text-base"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="mt-3 rounded-felt bg-linen px-4 py-3 text-sm text-muted">«{current?.message}»</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 w-full sm:w-auto">
        <MessageCircle className="size-5" aria-hidden />
        {button}
      </a>
    </div>
  );
}
