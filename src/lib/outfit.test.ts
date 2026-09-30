import { describe, expect, it } from "vitest";
import { outfitForDay, outfitForHour } from "./outfit";
import type { Day, Hour } from "./weather";

const day: Day = {
  date: "2026-09-30", min: 8, max: 21, rain: 0, code: 0,
  sunrise: "2026-09-30T06:00", sunset: "2026-09-30T18:00", uv: 2,
};
const hour: Hour = {
  time: "2026-09-30T13:00", temperature: 19, feels: 17,
  rain: 0, wind: 5, code: 0, day: true,
};

describe("outfit advice", () => {
  it("uses the nearest hour's apparent temperature", () => {
    const advice = outfitForHour({ ...hour, feels: 6 });
    expect(advice.style).toBe("cold");
    expect(advice.items).toContain("Тёплая куртка");
  });
  it("protects against rain in the nearest hour", () => {
    expect(outfitForHour({ ...hour, rain: 0.5 }).items).toContain("Зонт или дождевик");
    expect(outfitForHour({ ...hour, code: 95, rain: 0 }).items).toContain("Зонт или дождевик");
  });
  it("uses the coldest remaining hour and includes the whole-day temperature range", () => {
    const advice = outfitForDay(day, [
      { ...hour, time: "2026-09-30T13:00", feels: 20 },
      { ...hour, time: "2026-09-30T21:00", feels: 8 },
    ], hour);
    expect(advice.title).toBe("Одевайтесь слоями");
    expect(advice.note).toContain("от 8° до 20°");
  });
  it("adds protection for later precipitation", () => {
    const advice = outfitForDay(day, [hour, { ...hour, time: "2026-09-30T18:00", rain: 0.7 }], hour);
    expect(advice.items).toContain("Зонт или дождевик");
  });
  it("suggests winter shoes for freezing precipitation", () => {
    const advice = outfitForDay({ ...day, rain: 0.6 }, [{ ...hour, feels: -8, code: 71 }], hour);
    expect(advice.style).toBe("frost");
    expect(advice.items).toContain("Непромокаемая обувь");
  });
  it("includes wind protection when it strengthens later", () => {
    expect(outfitForDay(day, [hour, { ...hour, wind: 30 }], hour).items).toContain("Защита от ветра");
    expect(outfitForDay(day, [hour], hour).items).not.toContain("Защита от ветра");
  });
  it("changes the full outfit for office and active styles", () => {
    const office = outfitForHour(hour, { occasion: "office", warmth: "balanced" });
    const sport = outfitForHour(hour, { occasion: "sport", warmth: "balanced" });
    expect(office.pieces.upper).toBe("Рубашка");
    expect(office.pieces.outer).toBe("Жакет или пиджак");
    expect(sport.pieces.upper).toBe("Лонгслив");
    expect(sport.pieces.shoes).toBe("Кроссовки");
  });
  it("uses cold sensitivity without changing the displayed weather", () => {
    const balanced = outfitForHour({ ...hour, feels: 16 });
    const warmer = outfitForHour({ ...hour, feels: 16 }, { occasion: "casual", warmth: "warmer" });
    expect(balanced.style).toBe("mild");
    expect(warmer.style).toBe("cool");
    expect(warmer.note).toContain("16° по ощущениям");
  });
});
