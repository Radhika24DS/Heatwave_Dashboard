// src/components/ui/Card.jsx
import React from 'react';

/**
 * Premium glassmorphism card with optional gradient border glow.
 * Props:
 *  - className   : extra Tailwind classes
 *  - glow        : show orange glow border (default false)
 *  - hover       : enable lift-on-hover effect (default true)
 *  - padding     : padding preset 'sm' | 'md' | 'lg' (default 'md')
 *  - children
 */
const Card = ({ className = '', glow = false, hover = true, padding = 'md', title = '', children }) => {
  const padMap = { sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
      <div
        className={[
          'card-premium',
          padMap[padding],
          hover ? 'transition-all duration-300' : '',
          glow ? 'heat-ring' : '',
          className,
        ].filter(Boolean).join(' ')}
      >
        {title && (
          <h2 className="text-lg font-bold text-brand-text mb-3">{title}</h2>
        )}
        {children}
      </div>
    );
};

export default Card;
