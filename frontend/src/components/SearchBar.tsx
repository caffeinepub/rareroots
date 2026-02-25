import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search Himalayan herbs, Kutch crafts...',
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
        style={{ color: '#666' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full font-roboto outline-none transition-shadow"
        style={{
          height: '48px',
          paddingLeft: '44px',
          paddingRight: '16px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1.5px solid rgba(218,165,32,0.4)',
          fontSize: '16px',
          color: '#333',
          boxShadow: '0px 2px 6px rgba(0,0,0,0.06)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#DAA520';
          e.target.style.boxShadow = '0px 2px 8px rgba(218,165,32,0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(218,165,32,0.4)';
          e.target.style.boxShadow = '0px 2px 6px rgba(0,0,0,0.06)';
        }}
      />
    </div>
  );
}
