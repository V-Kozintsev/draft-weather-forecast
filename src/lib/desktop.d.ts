interface AtmosDesktop {
  version: string;
  getCompact(): Promise<boolean>;
  setCompact(enabled: boolean): void;
  hide(): void;
  updateWeather(data: { city: string; temperature: number; description: string }): void;
  onCompact(callback: (enabled: boolean) => void): () => void;
}
interface Window { atmosDesktop?: AtmosDesktop; }
