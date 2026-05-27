// Minimal skeleton building block — use className="skel" for shimmer
export function Skel({ w, h, r, mb, style }: {
  w?: number | string; h?: number | string;
  r?: number; mb?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div className="skel" style={{ width: w ?? '100%', height: h ?? 16, borderRadius: r ?? 6, marginBottom: mb, flexShrink: 0, ...style }} />
  );
}
