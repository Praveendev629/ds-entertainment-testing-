"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

interface Props {
  className?: string;
}

export default function InstallAppButton({ className = "" }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hint, setHint] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    setInstalled(standalone);
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as Window & { MSStream?: unknown }).MSStream
    );

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setHint(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (isIOS) {
      setHint((value) => !value);
      return;
    }
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  if (!deferredPrompt && !isIOS) return null;

  const buttonClass =
    className ||
    "relative p-2 hover:bg-white/5 rounded-xl border border-white/5 text-zinc-400 hover:text-white transition-all";

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleClick}
        className={buttonClass}
        title={isIOS ? "Install on home screen" : "Install admin app"}
        aria-label="Install admin app"
      >
        {installing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
      </button>

      {hint && isIOS && (
        <div className="absolute top-full right-0 mt-2 w-64 px-4 py-3 bg-[#0a0a0a] border border-pink-600/20 rounded-2xl text-xs text-zinc-400 leading-relaxed shadow-xl z-50">
          Tap the <span className="text-white font-bold">Share</span> icon in Safari, then choose{" "}
          <span className="text-white font-bold">Add to Home Screen</span>.
        </div>
      )}
    </div>
  );
}
