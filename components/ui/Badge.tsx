'use client';

interface Props {
  label: string;
  bg: string;
  color: string;
  size?: 'sm' | 'md';
}

export default function Badge({ label, bg, color, size = 'md' }: Props) {
  return (
    <span style={{
      display: 'inline-block',
      padding: size === 'sm' ? '1px 7px' : '3px 10px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 10 : 12,
      fontWeight: 600,
      background: bg,
      color,
    }}>
      {label}
    </span>
  );
}