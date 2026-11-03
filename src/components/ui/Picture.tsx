import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * Изображение, заполняющее родителя с заданными пропорциями.
 * SVG и внешние файлы без оптимизатора отдаются как есть.
 */
export function Picture({ src, alt, sizes, className = "", priority }: Props) {
  const unoptimized = src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      className={`object-cover ${className}`}
    />
  );
}
