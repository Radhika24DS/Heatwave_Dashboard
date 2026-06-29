// src/components/ui/Card.jsx
import React from 'react';

/**
 * Premium glassmorphism card with optional gradient border glow.
 * Props:
 *  - className   : extra Tailwind classes
 *  - glow        : show orange glow border (default false)
 *  - hover       : enable lift-on-hover effect (default true)
 *  - padding     : padding preset 'sm' | 'md' | 'lg' | 'none' (default 'md')
 *  - title       : optional card header label
 *  - subtitle    : optional muted subtitle below title
 *  - accent      : show left gradient accent bar on title (default false)
 *  - children
 */
const Card = ({
  className = '',
  glow = false,
  hover = true,
  padding = 'md',
  title = '',
  subtitle = '',
  accent = false,
  children,
}) => {
  const padMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

  return (
    <div
      className={[
        'card-premium relative overflow-hidden bg-white border border-brand-border',
        padMap[padding],
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-card-hover' : '',
        glow ? 'heat-ring border-brand-primary/30' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Corner background glow */}
      <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brand-primary/[0.02] blur-2xl pointer-events-none transition-all duration-500 ${glow ? 'opacity-30 bg-brand-primary/[0.08]' : 'opacity-10'}`} />
      {title && (
        <div className={`mb-4 ${padding !== 'none' ? '' : 'px-5 pt-5'}`}>
          <div className="flex items-center gap-2.5">
            {accent && (
              <span className="flex-shrink-0 h-4 w-0.5 rounded-full bg-heat-gradient" />
            )}
            <div>
              <h2 className="font-heading text-sm font-bold text-brand-text uppercase tracking-wider">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] text-brand-faint mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-brand-primary/20 via-brand-border/40 to-transparent" />
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
