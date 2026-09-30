import { useState } from "react";
import { CloudRain, CloudSnow, Sparkles } from "lucide-react";
import type { OutfitAdvice } from "../lib/outfit";
import { readStorage, saveStorage } from "../lib/api";
import "./OutfitCard.css";

interface Props {
  hour: OutfitAdvice;
  day: OutfitAdvice;
  hourLabel: string;
}

/** @param {Props} props - Рекомендации для ближайшего часа и оставшегося дня. @returns {JSX.Element} Образ с переключением двух режимов. */
export default function OutfitCard({ hour, day, hourLabel }: Props) {
  const [mode, setMode] = useState<"hour" | "day">("hour");
  const [gender, setGender] = useState<"woman" | "man">(() => readStorage<string>("atmos-outfit-gender", "woman") === "man" ? "man" : "woman");
  const advice = mode === "hour" ? hour : day;
  const bottomStyle = advice.title === "Одевайтесь слоями" ? "warm" : advice.style === "heat" || advice.style === "warm" ? "warm" : advice.style === "mild" ? "mild" : advice.style === "cool" ? "cool" : "cold";
  const topStyle = advice.rain && advice.feels >= 7 && advice.feels < 22 ? "rain" : advice.style === "heat" || advice.style === "warm" ? "warm" : advice.style === "mild" ? "mild" : advice.style === "cool" ? "cool" : "cold";

  /** @param {"woman" | "man"} next - Вариант персонажа. @returns {void} Сохраняет выбор только на этом устройстве. */
  function selectGender(next: "woman" | "man"): void {
    setGender(next);
    saveStorage("atmos-outfit-gender", next);
  }

  return (
    <section className="outfit-card" aria-labelledby="outfit-heading">
      <div className="outfit-visual" aria-hidden="true">
        <span className="outfit-halo" />
        <img className="outfit-model" src={`${import.meta.env.BASE_URL}outfits/${gender}-${bottomStyle}.webp`} alt="" width="480" height="720" />
        {topStyle !== bottomStyle && <img className="outfit-model outfit-model-top" src={`${import.meta.env.BASE_URL}outfits/${gender}-${topStyle}.webp`} alt="" width="480" height="720" />}
        {advice.rain && (advice.feels <= 0
          ? <CloudSnow className="outfit-weather-icon" size={30} strokeWidth={1.5} />
          : <CloudRain className="outfit-weather-icon" size={30} strokeWidth={1.5} />)}
      </div>
      <div className="outfit-content">
        <span className="eyebrow"><Sparkles size={14} /> ЧТО НАДЕТЬ</span>
        <div className="outfit-gender" aria-label="Вариант образа">
          <button type="button" aria-pressed={gender === "woman"} className={gender === "woman" ? "active" : ""} onClick={() => selectGender("woman")}>Женский</button>
          <button type="button" aria-pressed={gender === "man"} className={gender === "man" ? "active" : ""} onClick={() => selectGender("man")}>Мужской</button>
        </div>
        <div className="outfit-tabs" aria-label="Период рекомендации">
          <button type="button" aria-pressed={mode === "hour"} className={mode === "hour" ? "active" : ""} onClick={() => setMode("hour")}>Ближайший час</button>
          <button type="button" aria-pressed={mode === "day"} className={mode === "day" ? "active" : ""} onClick={() => setMode("day")}>На весь день</button>
        </div>
        <h2 id="outfit-heading">{advice.title}</h2>
        <p className="outfit-note">{mode === "hour" ? `${hourLabel} · ` : "До конца дня · "}{advice.note}</p>
        <ul className="outfit-list">
          {advice.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="outfit-disclaimer">Ориентир по прогнозу: выбирайте слои под свой комфорт.</p>
      </div>
    </section>
  );
}
