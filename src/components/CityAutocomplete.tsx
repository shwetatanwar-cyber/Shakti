import { useEffect, useMemo, useRef, useState } from 'react';
import { INDIAN_CITIES, type IndianCity } from '@/data/indianCities';

interface Props {
  value: string;
  onSelect: (city: IndianCity) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
}

/**
 * Client-side autocomplete for major Indian cities.
 * Displays "City, State" on selection and exposes lat/lng to caller.
 * Form submission should be blocked until a valid option is chosen.
 */
const CityAutocomplete = ({
  value,
  onSelect,
  onClear,
  placeholder = 'Start typing your city…',
  className = '',
  inputClassName = '',
  id,
}: Props) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep local input in sync if parent resets value.
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click / tap.
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, []);

  const results = useMemo<IndianCity[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INDIAN_CITIES.slice(0, 20);
    return INDIAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().startsWith(q) ||
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().startsWith(q),
    ).slice(0, 30);
  }, [query]);

  const choose = (c: IndianCity) => {
    const label = `${c.name}, ${c.state}`;
    setQuery(label);
    setOpen(false);
    onSelect(c);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        id={id}
        type="text"
        autoComplete="off"
        inputMode="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIdx(0);
          // Selection invalidated when text changes.
          onClear?.();
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter') {
            if (results[activeIdx]) {
              e.preventDefault();
              choose(results[activeIdx]);
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={inputClassName}
      />
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-accent/30 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/40"
        >
          {results.map((c, i) => {
            const active = i === activeIdx;
            return (
              <li
                key={`${c.name}-${c.state}-${i}`}
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseDown={(e) => {
                  // Use mousedown so it fires before input blur.
                  e.preventDefault();
                  choose(c);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
                className={`cursor-pointer px-3 py-2.5 font-body text-sm transition-colors ${
                  active
                    ? 'bg-accent/20 text-foreground'
                    : 'text-foreground/85 hover:bg-accent/10'
                }`}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground">, {c.state}</span>
              </li>
            );
          })}
        </ul>
      )}
      {open && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg border border-accent/20 bg-background/95 backdrop-blur-xl px-3 py-3 font-body text-xs text-muted-foreground">
          No matching Indian city. Try a different spelling.
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;