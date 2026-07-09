"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSettings, setSettings } from "@/lib/store";

interface PixelContextType {
  pixelMode: boolean;
  togglePixel: () => void;
}

const PixelContext = createContext<PixelContextType>({
  pixelMode: false,
  togglePixel: () => {},
});

export function PixelProvider({ children }: { children: ReactNode }) {
  const [pixelMode, setPixelMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setPixelMode(settings.pixelTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("pixel", pixelMode);
    setSettings({ pixelTheme: pixelMode });
  }, [pixelMode, mounted]);

  const togglePixel = () => setPixelMode((p) => !p);

  if (!mounted) return <>{children}</>;

  return (
    <PixelContext.Provider value={{ pixelMode, togglePixel }}>
      {children}
    </PixelContext.Provider>
  );
}

export const usePixel = () => useContext(PixelContext);
