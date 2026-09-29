import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";

/** @param {{code: number, day?: boolean, className?: string}} props - Условия WMO, время суток и класс оформления. @returns {JSX.Element} Векторная иконка погоды. */
export default function WeatherIcon({
  code,
  day = true,
  className = "",
}: {
  code: number;
  day?: boolean;
  className?: string;
}) {
  const Icon =
    code === 0
      ? day
        ? Sun
        : Moon
      : code <= 2
        ? day
          ? CloudSun
          : Moon
        : code === 3
          ? Cloud
          : code <= 48
            ? CloudFog
            : code <= 57
              ? CloudDrizzle
              : code <= 67 || (code >= 80 && code <= 82)
                ? CloudRain
                : code <= 86
                  ? CloudSnow
                  : CloudLightning;
  return (
    <Icon
      aria-hidden="true"
      className={`weather-icon ${className}`}
      strokeWidth={1.4}
    />
  );
}
