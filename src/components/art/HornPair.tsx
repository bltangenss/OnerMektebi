import { HORN_PATH } from "./horn-path";

type Props = {
  /** Центр общего основания. */
  cx: number;
  /** Линия, на которой стоит основание. */
  baseY: number;
  /** Масштаб: высота пары = 100 × scale. */
  scale: number;
  fill: string;
  /** Пара свисает вниз от линии основания. */
  hanging?: boolean;
};

// Основания двух рогов слегка заходят друг на друга и сливаются в один стебель.
const OVERLAP = 9;

/**
 * Қошқар мүйіз: два рога из общего стебля закручиваются в разные стороны.
 */
export function HornPair({ cx, baseY, scale: s, fill, hanging }: Props) {
  const dir = hanging ? -1 : 1;
  const top = baseY - dir * 100 * s;
  return (
    <g fill={fill}>
      <path d={HORN_PATH} transform={`translate(${cx - dir * OVERLAP * s} ${top}) scale(${dir * s} ${dir * s})`} />
      <path d={HORN_PATH} transform={`translate(${cx + dir * OVERLAP * s} ${top}) scale(${-dir * s} ${dir * s})`} />
    </g>
  );
}
