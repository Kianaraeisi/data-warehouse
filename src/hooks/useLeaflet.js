import { useEffect } from "react";

export function useLeaflet(onReady) {
  useEffect(() => {
    if (window.L && window.L.Draw) {
      onReady();
      return;
    }

    const css1 = document.createElement("link");
    css1.rel = "stylesheet";
    css1.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css1);

    const css2 = document.createElement("link");
    css2.rel = "stylesheet";
    css2.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
    document.head.appendChild(css2);

    const js1 = document.createElement("script");
    js1.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js1.onload = () => {
      const js2 = document.createElement("script");
      js2.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
      js2.onload = onReady;
      document.head.appendChild(js2);
    };
    document.head.appendChild(js1);
  }, [onReady]);
}
