import type { Day, Hour } from "./weather";

export type OutfitStyle = "heat" | "warm" | "mild" | "cool" | "cold" | "frost";

export interface OutfitAdvice {
  style: OutfitStyle;
  title: string;
  items: string[];
  note: string;
  rain: boolean;
  feels: number;
  wind: number;
}

/** @param {number} code - Код погоды. @returns {boolean} Дождь, снег или гроза. */
function hasPrecipitation(code: number): boolean {
  return (code >= 51 && code <= 86) || code >= 95;
}

/** @param {number} feels - Температура по ощущениям. @param {number} wind - Скорость ветра. @param {boolean} rain - Вероятные осадки. @param {string} note - Краткое объяснение. @returns {OutfitAdvice} Базовый набор одежды и защита от погоды. */
function buildOutfit(feels: number, wind: number, rain: boolean, note: string): OutfitAdvice {
  let style: OutfitStyle;
  let title: string;
  let items: string[];
  if (feels >= 29) {
    style = "heat"; title = "Максимум лёгкости"; items = ["Лёгкая футболка", "Шорты или лёгкие брюки", "Открытая обувь"];
  } else if (feels >= 22) {
    style = "warm"; title = "Лёгкий комплект"; items = ["Футболка", "Лёгкие брюки", "Кеды"];
  } else if (feels >= 15) {
    style = "mild"; title = "Один дополнительный слой"; items = ["Футболка", "Лёгкая куртка", "Брюки и кроссовки"];
  } else if (feels >= 7) {
    style = "cool"; title = "Пора утеплиться"; items = ["Свитер", "Куртка", "Брюки и закрытая обувь"];
  } else if (feels >= -3) {
    style = "cold"; title = "Тёплые слои"; items = ["Тёплая куртка", "Свитер", "Шапка и закрытая обувь"];
  } else {
    style = "frost"; title = "Защита от холода"; items = ["Зимняя куртка", "Тёплый слой", "Шапка, перчатки и зимняя обувь"];
  }
  if (rain) items.push(feels <= 0 ? "Непромокаемая обувь" : "Зонт или дождевик");
  if (wind >= 25 && feels > -3 && feels < 22) items.push("Защита от ветра");
  return { style, title, items, note, rain, feels, wind };
}

/** @param {Hour} hour - Ближайший час прогноза. @returns {OutfitAdvice} Образ для выхода в ближайший час. */
export function outfitForHour(hour: Hour): OutfitAdvice {
  const rain = hour.rain >= 40 || hasPrecipitation(hour.code);
  const reasons = [`${Math.round(hour.feels)}° по ощущениям`];
  if (rain) reasons.push("возможны осадки");
  if (hour.wind >= 25) reasons.push(`ветер ${Math.round(hour.wind)} км/ч`);
  return buildOutfit(hour.feels, hour.wind, rain, `${reasons.join(", ")}.`);
}

/** @param {Day} day - Сегодняшний прогноз. @param {Hour[]} hours - Оставшиеся часы сегодня. @param {Hour} fallback - Текущая погода, если почасовой прогноз недоступен. @returns {OutfitAdvice} Многослойный комплект на весь оставшийся день. */
export function outfitForDay(day: Day, hours: Hour[], fallback: Hour): OutfitAdvice {
  const relevant = hours.filter((hour) => Number.isFinite(hour.feels));
  const span = relevant.length ? relevant : [fallback];
  const min = Math.min(...span.map((hour) => hour.feels));
  const max = Math.max(...span.map((hour) => hour.feels));
  const wind = Math.max(...span.map((hour) => hour.wind));
  const rain = day.rain >= 45 || span.some((hour) => hour.rain >= 50 || hasPrecipitation(hour.code));
  const reasons = [min === max ? `${Math.round(min)}° по ощущениям` : `от ${Math.round(min)}° до ${Math.round(max)}° по ощущениям`];
  if (rain) reasons.push("возможны осадки");
  if (wind >= 25) reasons.push(`ветер до ${Math.round(wind)} км/ч`);
  const advice = buildOutfit(min, wind, rain, `${reasons.join(", ")}.`);
  if (max - min >= 9 && max >= 20 && min < 15) {
    advice.style = min < 7 ? "cool" : "mild";
    advice.title = "Одевайтесь слоями";
    advice.items = ["Футболка или лонгслив", min < 7 ? "Тёплая куртка" : "Лёгкая куртка", "Брюки и закрытая обувь"];
    if (rain) advice.items.push("Зонт или дождевик");
    if (wind >= 25) advice.items.push("Защита от ветра");
  }
  return advice;
}
