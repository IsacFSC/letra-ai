// Verifica se o navegador suporta Service Workers
export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .catch(() => {
          // Falha silenciosa em produção
        });
    });
  }
}
