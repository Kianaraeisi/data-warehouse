import { useEffect, useRef } from "react";

export function useLeaflet(onReady) {
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (window.L && window.L.Draw) {
      onReadyRef.current();
      return;
    }

    let cancelled = false;

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
      if (cancelled) return;
      const js2 = document.createElement("script");
      js2.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
      js2.onload = () => {
        if (!cancelled) onReadyRef.current();
      };
      document.head.appendChild(js2);
    };
    document.head.appendChild(js1);

    return () => {
      cancelled = true;
      css1.remove();
      css2.remove();
      js1.remove();
    };
  }, []);
}
