import Link from 'next/link';
import type { CSSProperties } from 'react';

interface ArrowButtonProps {
  href: string;
  children: string;
  /** Adds the dark (filled) variant used by the contact form submit. */
  dark?: boolean;
  style?: CSSProperties;
}

/** The `.btn` link with its trailing ↗ glyph, as used throughout the approved site. */
export default function ArrowButton({ href, children, dark = false, style }: ArrowButtonProps) {
  return (
    <Link className={dark ? 'btn dark' : 'btn'} href={href} style={style}>
      {children}
      <span className="arrow">↗</span>
    </Link>
  );
}
