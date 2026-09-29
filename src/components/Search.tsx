import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, Search as SearchIcon, X } from "lucide-react";
import { searchCities } from "../lib/api";
import type { City } from "../lib/weather";

/** @param {{onSelect: (city: City) => void}} props - Выбор результата поиска. @returns {JSX.Element} Поиск с отменой запросов, задержкой и клавиатурной навигацией. */
export default function Search({
  onSelect,
}: {
  onSelect: (city: City) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const abort = new AbortController();
    setResults([]);
    setActive(-1);
    if (query.trim().length < 2) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const timer = setTimeout(() => {
      searchCities(query.trim(), abort.signal)
        .then((cities) => {
          if (!abort.signal.aborted) {
            setResults(cities);
            setStatus("done");
          }
        })
        .catch(() => {
          if (!abort.signal.aborted) setStatus("error");
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [query]);
  useEffect(() => {
    /** @param {PointerEvent} e - Нажатие вне поиска. */
    function dismiss(e: PointerEvent): void {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  /** @param {City} city - Выбранный результат. */
  function select(city: City): void {
    onSelect(city);
    setQuery("");
    setOpen(false);
  }
  return (
    <div className="search" ref={ref}>
      <SearchIcon size={18} aria-hidden="true" />
      <input
        placeholder="Найти город…"
        aria-label="Поиск города"
        role="combobox"
        aria-expanded={open && query.length >= 2}
        aria-controls="city-results"
        aria-autocomplete="list"
        aria-activedescendant={
          active >= 0 ? `city-result-${active}` : undefined
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, results.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter" && results.length) {
            e.preventDefault();
            select(results[Math.max(0, active)]);
          }
        }}
      />
      {query && (
        <button
          className="icon-button"
          aria-label="Очистить поиск"
          onClick={() => setQuery("")}
        >
          <X size={16} />
        </button>
      )}
      {open && query.trim().length >= 2 && (
        <div className="search-results">
          {status === "loading" && (
            <p role="status">
              <LoaderCircle className="spin" size={16} /> Ищем города…
            </p>
          )}
          {status === "error" && (
            <p role="alert">Поиск недоступен. Попробуйте ещё раз.</p>
          )}
          {status === "done" && !results.length && (
            <p role="status">Город не найден. Попробуйте другое название.</p>
          )}
          <ul role="listbox" id="city-results" aria-label="Найденные города">
            {results.map((city, i) => (
              <li
                key={city.id}
                id={`city-result-${i}`}
                role="option"
                aria-selected={active === i}
                onPointerMove={() => setActive(i)}
              >
                <button tabIndex={-1} onClick={() => select(city)}>
                  <MapPin size={17} />
                  <span>
                    <strong>{city.name}</strong>
                    <small>{city.country}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
