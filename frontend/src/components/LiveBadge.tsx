import React from 'react';

interface LiveBadgeProps {
  size?: 'sm' | 'md';
}

export default function LiveBadge({ size = 'md' }: LiveBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-terracotta text-primary-foreground font-bold rounded-sm uppercase tracking-wider ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-live-pulse" />
      LIVE
    </span>
  );
}
