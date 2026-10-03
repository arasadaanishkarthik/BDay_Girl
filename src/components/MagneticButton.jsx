import React from 'react';

/**
 * Lightweight, high-performance button using standard CSS transitions.
 * Zero mousemove listeners, zero cursor tracking.
 */
export default function MagneticButton({
  children,
  className = '',
  onClick,
  id,
  type = 'button',
  ariaLabel
}) {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
