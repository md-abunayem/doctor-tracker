"use client";
import { Search} from "lucide-react";

export function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        size={17}
        className="muted absolute left-3 top-1/2 -translate-y-1/2"
      />
      <input
        className="field"
        style={{ paddingLeft: "3rem" }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}