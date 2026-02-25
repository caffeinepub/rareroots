import React from 'react';

interface BadgePillProps {
  text: string;
  className?: string;
  variant?: 'gold' | 'green' | 'indigo' | 'red';
}

export default function BadgePill({ text, className = '', variant = 'gold' }: BadgePillProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    gold: { backgroundColor: '#DAA520', color: 'white' },
    green: { backgroundColor: '#228B22', color: 'white' },
    indigo: { backgroundColor: '#4B0082', color: 'white' },
    red: { backgroundColor: '#FF4500', color: 'white' },
  };

  return (
    <span
      className={`inline-flex items-center font-poppins font-semibold whitespace-nowrap ${className}`}
      style={{
        height: '32px',
        padding: '0 12px',
        borderRadius: '16px',
        fontSize: '12px',
        ...variantStyles[variant],
      }}
    >
      {text}
    </span>
  );
}
