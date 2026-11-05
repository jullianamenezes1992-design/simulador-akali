"use client";

import { useEffect } from "react";

/** Registra o service worker do app (necessário para instalar e receber notificações). */
export default function RegistrarApp() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }).catch(() => {});
    }
  }, []);
  return null;
}
