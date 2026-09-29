import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, ShieldCheck, Smartphone, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { debug } from "../lib/api";
import "./AppInstall.css";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** @returns {JSX.Element} Установка PWA, инструкция для браузеров без приглашения и обновление приложения. */
export default function AppInstall() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      setCached(Boolean(registration?.active));
      debug("PWA registered", { active: Boolean(registration?.active) });
    },
    onOfflineReady() { debug("PWA shell cached"); },
    onNeedRefresh() { debug("PWA update available"); },
    onRegisterError() { debug("PWA registration failed"); setError(true); },
  });

  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    /** @returns {void} Синхронизирует состояние отдельного окна, включая режим iOS. */
    function syncDisplay() {
      setInstalled(display.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    }
    /** @param {Event} event - Приглашение браузера. @returns {void} Сохраняет приглашение до явного нажатия пользователя. */
    function capturePrompt(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
      debug("PWA install available");
    }
    /** @returns {void} Убирает приглашение после завершённой установки. */
    function finishInstall() {
      setInstalled(true);
      setPrompt(null);
      debug("PWA installed");
    }
    syncDisplay();
    display.addEventListener("change", syncDisplay);
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", finishInstall);
    return () => {
      display.removeEventListener("change", syncDisplay);
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", finishInstall);
    };
  }, []);

  /** @returns {Promise<void>} Открывает системную установку или доступную инструкцию. */
  async function install() {
    if (!prompt) {
      dialog.current?.showModal();
      return;
    }
    setBusy(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      debug("PWA install choice", { outcome: choice.outcome });
    } catch {
      debug("PWA install prompt failed");
      dialog.current?.showModal();
    } finally {
      setPrompt(null);
      setBusy(false);
    }
  }

  /** @returns {Promise<void>} Активирует новую версию только по нажатию пользователя. */
  async function update() {
    setBusy(true);
    try { await updateServiceWorker(true); }
    catch { debug("PWA update failed"); setError(true); }
    finally { setBusy(false); }
  }

  return (
    <div className="app-install">
      <button ref={button} className="install-button" onClick={install} disabled={busy}
        aria-label={installed ? "Об установленном приложении Atmos" : "Установить Atmos"}>
        {installed ? <ShieldCheck size={18} /> : <Download size={18} />}
        <span>{installed ? "Приложение" : "Установить"}</span>
      </button>
      <dialog ref={dialog} className="install-dialog" aria-labelledby="install-title"
        onClose={() => button.current?.focus()}>
        <div className="install-dialog-heading">
          <Smartphone size={32} aria-hidden="true" />
          <button className="icon-button" aria-label="Закрыть инструкцию" autoFocus onClick={() => dialog.current?.close()}><X size={22} /></button>
        </div>
        <p className="eyebrow">ВАШ ПРОГНОЗ ПОД РУКОЙ</p>
        <h2 id="install-title">Atmos как приложение</h2>
        <p>Собственная иконка и отдельное окно — без лишних вкладок.</p>
        <ul>
          <li><strong>Компьютер и Android.</strong> Откройте сайт в Chrome или Edge. Нажмите «Установить» здесь либо выберите установку приложения в меню браузера.</li>
          <li><strong>iPhone и iPad.</strong> Откройте сайт в Safari, нажмите «Поделиться» → «На экран Домой».</li>
        </ul>
        <div className="install-offline" role="status">
          <ShieldCheck size={20} />
          <p>{offlineReady || cached ? "Интерфейс сохранён и открывается без сети." : error ? "Браузер не смог сохранить интерфейс офлайн. Попробуйте обновить страницу при доступной сети." : "Для первого запуска и сохранения интерфейса нужен интернет."} Последний прогноз хранится до суток; новые данные требуют сети.</p>
        </div>
        <button className="install-done" onClick={() => dialog.current?.close()}>Понятно</button>
      </dialog>
      {needRefresh && <div className="pwa-update" role="status">
        <RefreshCw size={20} />
        <p>Доступна новая версия Atmos</p>
        <button onClick={update} disabled={busy}>Обновить</button>
        <button aria-label="Обновить позже" onClick={() => setNeedRefresh(false)}><X size={20} /></button>
      </div>}
    </div>
  );
}
