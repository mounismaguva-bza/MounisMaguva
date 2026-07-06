"use client";

import { useMemo, useState } from "react";

function ChipList({ items, onRemove, removeLabelPrefix = "Remove" }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-xs text-white"
        >
          {item}
          <button
            type="button"
            className="opacity-80 hover:opacity-100"
            onClick={() => onRemove(item)}
            aria-label={`${removeLabelPrefix} ${item}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function SuggestionDropdown({ open, suggestions, onSelect }) {
  if (!open || !suggestions.length) return null;
  return (
    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[var(--color-border)] bg-white py-1 shadow-md">
      {suggestions.map((item) => (
        <li key={item}>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-cream)]"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
          >
            {item}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Single text value with type-ahead suggestions */
export function SingleSuggestionField({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}) {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return suggestions
      .filter((item) => item.toLowerCase().includes(query) && item !== value)
      .slice(0, 8);
  }, [value, suggestions]);

  return (
    <div>
      {label ? (
        <label className="mb-1 block text-sm font-medium" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && filtered.length === 1) {
              e.preventDefault();
              onChange(filtered[0]);
              setOpen(false);
            }
          }}
          autoComplete="off"
        />
        <SuggestionDropdown
          open={open}
          suggestions={filtered}
          onSelect={(item) => {
            onChange(item);
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}

/** Multiple values: chips + type-ahead input */
export function MultiSuggestionField({
  legend,
  placeholder,
  suggestions,
  values,
  onAdd,
  onRemove,
  formatValue = (v) => v.trim(),
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return [];
    return suggestions
      .filter(
        (item) =>
          item.toLowerCase().includes(query) &&
          !values.includes(formatValue(item)),
      )
      .slice(0, 8);
  }, [input, values, suggestions, formatValue]);

  function commit(raw) {
    const next = formatValue(raw);
    if (!next) return;
    onAdd(next);
    setInput("");
    setOpen(false);
  }

  return (
    <fieldset className="space-y-3">
      {legend ? <legend className="text-sm font-medium">{legend}</legend> : null}
      <ChipList items={values} onRemove={onRemove} />
      <div className="relative">
        <input
          className="input-field"
          placeholder={placeholder}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              commit(input);
              return;
            }
            if (e.key === ",") {
              e.preventDefault();
              commit(input.replace(/,+$/, ""));
            }
            if (e.key === "Escape") setOpen(false);
          }}
          autoComplete="off"
        />
        <SuggestionDropdown
          open={open}
          suggestions={filtered}
          onSelect={(item) => commit(item)}
        />
      </div>
    </fieldset>
  );
}
