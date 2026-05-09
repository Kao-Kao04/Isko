'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from '@/components/ui/Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     ReactNode;
  fullWidth?: boolean;
}

const SIZE_CLASS: Record<Size, string>    = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };
const VARIANT_CLASS: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
};

export default function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  icon,
  fullWidth = false,
  disabled,
  children,
  style,
  ...rest
}: Props) {
  const cls = ['btn', SIZE_CLASS[size], VARIANT_CLASS[variant]].join(' ');

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cls}
      style={{ width: fullWidth ? '100%' : undefined, ...style }}
    >
      {loading
        ? <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} color="currentColor" />
        : icon}
      {children}
    </button>
  );
}
