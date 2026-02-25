import React from 'react';

const REGIONS = ['All', 'Himalayas', 'Northeast', 'Rajasthan', 'Kerala', 'Tribal'];

interface RegionFilterProps {
  selected: string;
  onSelect: (region: string) => void;
}

export default function RegionFilter({ selected, onSelect }: RegionFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onSelect(region)}
          className={`region-chip flex-shrink-0 ${selected === region ? 'active' : ''}`}
        >
          {region}
        </button>
      ))}
    </div>
  );
}
