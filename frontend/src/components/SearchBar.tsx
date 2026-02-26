import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search artisan products...",
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-earthBrown/50"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-white border border-earthBrown/20 rounded-full text-sm font-roboto text-earthBrown placeholder-earthBrown/40 focus:outline-none focus:border-earthBrown/60 focus:ring-2 focus:ring-earthBrown/10 transition-all"
      />
    </div>
  );
}
