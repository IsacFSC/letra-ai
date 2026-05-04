"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/serviceWorker";

export function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
