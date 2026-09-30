import { useState } from "react";
import { ArrowUpRight, Droplets, Thermometer, Wind } from "lucide-react";
import { clock, condition, temperature, type Hour } from "../lib/weather";
import WeatherIcon from "./WeatherIcon";
import PanelHeading from "./PanelHeading";

type Metric = "temperature" | "rain" | "wind";
const METRICS = [
  { id: "temperature", label: "Температура", Icon: Thermometer },
  { id: "rain", label: "Осадки", Icon: Droplets },
  { id: "wind", label: "Ветер", Icon: Wind },
] as const;

/** @param {{hours: Hour[], fahrenheit: boolean, label: string}} props - Почасовой ряд, единицы температуры и заголовок. @returns {JSX.Element} Адаптивный SVG-график с доступным выбором часа. */
export default function ForecastChart({
  hours,
  fahrenheit,
  label,
}: {
  hours: Hour[];
  fahrenheit: boolean;
  label: string;
}) {
  const [metric, setMetric] = useState<Metric>("temperature");
  const [selected, setSelected] = useState(0);
  const values = hours.map((h) =>
    metric === "temperature"
      ? temperature(h.temperature, fahrenheit)
      : metric === "rain"
        ? h.rain
        : h.wind,
  );
  const low = metric === "rain" ? 0 : Math.min(...values) - 3;
  const high = metric === "rain" ? Math.max(1, ...values) : Math.max(...values) + 3;
  const unit =
    metric === "temperature"
      ? `°${fahrenheit ? "F" : "C"}`
      : metric === "rain"
        ? "мм"
        : "км/ч";
  const points = values.map((value, i) => ({
    x: 30 + (i * 940) / Math.max(1, hours.length - 1),
    y: 148 - ((value - low) / (high - low || 1)) * 115,
  }));
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const index = Math.min(selected, hours.length - 1),
    hour = hours[index];
  if (!hour) return <p>Почасовые данные недоступны.</p>;
  return (
    <section className="panel chart-panel" aria-labelledby="hourly-heading">
      <PanelHeading eyebrow="ПО ЧАСАМ" id="hourly-heading" title={label}>
        <ArrowUpRight size={20} aria-hidden="true" />
      </PanelHeading>
      <div className="chart-tools">
        <div className="segmented" aria-label="Показатель графика">
          {METRICS.map(({ id, label: title, Icon }) => (
            <button
              key={id}
              aria-pressed={metric === id}
              className={metric === id ? "active" : ""}
              onClick={() => setMetric(id)}
            >
              <Icon size={15} />
              <span>{title}</span>
            </button>
          ))}
        </div>
        <div className="chart-reading" aria-live="polite">
          <span>{clock(hour.time)}</span>
          <strong>
            {metric === "rain" ? values[index].toFixed(1) : Math.round(values[index])}
            <small>{unit}</small>
          </strong>
        </div>
      </div>
      <div className="chart-container">
        <svg
          viewBox="0 0 1000 180"
          role="img"
          aria-label={`${label}: ${METRICS.find((m) => m.id === metric)?.label}. Выберите час под графиком для точного значения.`}
          preserveAspectRatio="none"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setSelected(
              Math.max(
                0,
                Math.min(
                  hours.length - 1,
                  Math.round(
                    ((((e.clientX - rect.left) / rect.width) * 1000 - 30) /
                      940) *
                      (hours.length - 1),
                  ),
                ),
              ),
            );
          }}
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[35, 90, 148].map((y) => (
            <line
              key={y}
              x1="0"
              x2="1000"
              y1={y}
              y2={y}
              className="chart-grid"
            />
          ))}
          <path d={`${path} L970,175 L30,175 Z`} fill="url(#chart-fill)" />
          <path
            d={path}
            stroke="var(--accent)"
            strokeWidth="3"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
          <line
            x1={points[index].x}
            x2={points[index].x}
            y1="10"
            y2="175"
            className="chart-cursor"
          />
          <circle
            cx={points[index].x}
            cy={points[index].y}
            r="5"
            fill="var(--accent)"
            stroke="var(--panel)"
            strokeWidth="3"
          />
        </svg>
      </div>
      <div className="hour-strip">
        {hours.map((h, i) => (
          <button
            key={h.time}
            className={index === i ? "selected" : ""}
            aria-pressed={index === i}
            aria-label={`${clock(h.time)}, ${condition(h.code)}, ${metric === "rain" ? values[i].toFixed(1) : Math.round(values[i])} ${unit}`}
            onClick={() => setSelected(i)}
            onFocus={() => setSelected(i)}
          >
            <span>{clock(h.time)}</span>
            <WeatherIcon code={h.code} day={h.day} />
            <strong>
              {metric === "temperature"
                ? temperature(h.temperature, fahrenheit)
                : metric === "rain" ? values[i].toFixed(1) : Math.round(values[i])}
              <small>
                {metric === "temperature" ? "°" : metric === "rain" ? "мм" : ""}
              </small>
            </strong>
            <span className="rain-label">
              <Droplets size={10} />
              {h.rain.toFixed(1)} мм
            </span>
          </button>
        ))}
      </div>
      <p className="chart-caption">
        {condition(hour.code)} · ощущается как{" "}
        {temperature(hour.feels, fahrenheit)}° · ветер {Math.round(hour.wind)}{" "}
        км/ч
      </p>
    </section>
  );
}
