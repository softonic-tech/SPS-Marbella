'use client';

import { useCallback, useState, type HTMLAttributes } from 'react';

type RevealTag = 'div' | 'section' | 'article' | 'figure';

interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to a <div>, matching the approved markup. */
  as?: RevealTag;
}

/**
 * Scroll-reveal wrapper. Reproduces the behaviour of the approved site: fade
 * and an 18px rise once the element is 8% visible, after which it stops being
 * observed. The observer is attached from a ref callback (React 19 runs the
 * returned cleanup when the node detaches), so no effect is needed.
 *
 * `prefers-reduced-motion` is honoured in CSS — see styles/06-responsive.css.
 */
export default function Reveal({ as: Tag = 'div', className, ...rest }: RevealProps) {
  const [visible, setVisible] = useState(false);

  const attach = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const classes = ['reveal', visible ? 'visible' : null, className].filter(Boolean).join(' ');

  return <Tag ref={attach as React.Ref<never>} className={classes} {...rest} />;
}
