interface RegionFilterProps {
  selected: string;
  onSelect: (region: string) => void;
}

const REGIONS = ["All", "Himalayas", "Kutch", "Banarasi", "Tribal", "Northeast"];

export default function RegionFilter({ selected, onSelect }: RegionFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onSelect(region)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-poppins font-medium transition-all ${
            selected === region
              ? "bg-earthBrown text-ivoryCream shadow-sm"
              : "bg-white text-earthBrown border border-earthBrown/20 hover:border-earthBrown/50"
          }`}
        >
          {region}
        </button>
      ))}
    </div>
  );
}
