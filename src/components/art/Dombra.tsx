/**
 * Домбра, лежащая горизонтально, в системе координат 1440×320.
 * Головка слева, корпус-шанақ справа. Ось струн y = 163 и y = 177.
 */
export const DOMBRA_VIEWBOX = { w: 1440, h: 320 };
export const STRING_Y = [163, 177] as const;
export const STRING_X = [58, 1398] as const;

const NUT_X = 150;
const BRIDGE_X = 1250;
const SCALE = BRIDGE_X - NUT_X;
// Лады стоят по равномерной темперации, как на настоящем грифе.
const FRETS = Array.from({ length: 16 }, (_, i) => NUT_X + SCALE * (1 - 2 ** (-(i + 1) / 12)));

type Colors = { body: string; neck: string; detail: string };

export function DombraShape({ body, neck, detail }: Colors) {
  return (
    <g>
      {/* Корпус-шанақ */}
      <path
        d="M850 146 C 960 140 1020 50 1172 48 C 1334 46 1414 100 1414 170 C 1414 240 1334 294 1172 292 C 1020 290 960 200 850 194 Z"
        fill={body}
      />
      {/* Гриф */}
      <path d="M140 151 L 870 145 L 870 195 L 140 189 Z" fill={neck} />
      {/* Головка и колки */}
      <path d="M36 150 Q 30 170 36 190 L 150 189 L 150 151 Z" fill={neck} />
      <rect x="62" y="122" width="16" height="30" rx="5" fill={neck} />
      <rect x="104" y="122" width="16" height="30" rx="5" fill={neck} />
      {/* Лады */}
      {FRETS.map((x) => (
        <line key={x} x1={x} y1="148" x2={x} y2="192" stroke={detail} strokeWidth="2" opacity="0.55" />
      ))}
      {/* Резонаторные отверстия */}
      <g fill={detail} opacity="0.7">
        <circle cx="1010" cy="138" r="5" />
        <circle cx="1030" cy="126" r="3.5" />
        <circle cx="1030" cy="150" r="3.5" />
        <circle cx="1010" cy="202" r="5" />
        <circle cx="1030" cy="190" r="3.5" />
        <circle cx="1030" cy="214" r="3.5" />
      </g>
      {/* Подставка-тиек и струнодержатель */}
      <rect x={BRIDGE_X - 5} y="152" width="10" height="36" rx="2" fill={detail} />
      <rect x="1392" y="160" width="12" height="20" rx="3" fill={detail} />
    </g>
  );
}
