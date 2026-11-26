// Ícone do Act AI: cinco barras de áudio, a central em destaque.
export default function ActAIMark({ className = "h-8 w-auto", bars = "#274360", accent = "#2B6F64" }) {
  const items = [
    { x: 2, y: 14, h: 16, c: bars },
    { x: 12, y: 8, h: 28, c: bars },
    { x: 22, y: 0, h: 44, c: accent },
    { x: 32, y: 8, h: 28, c: bars },
    { x: 42, y: 14, h: 16, c: bars },
  ];
  return (
    <svg viewBox="0 0 50 44" className={className} aria-hidden="true">
      {items.map((b) => (
        <rect key={b.x} x={b.x} y={b.y} width="6" height={b.h} rx="3" fill={b.c} />
      ))}
    </svg>
  );
}