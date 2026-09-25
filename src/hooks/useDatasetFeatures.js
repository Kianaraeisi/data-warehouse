import { useEffect, useRef, useState } from "react";
import { loadDatasourceFeatures } from "../services/datasourceApi";

export function useDatasetFeatures() {
  const [loadedFeature, setLoadedFeature] = useState(null);
  const requestRef = useRef(null);

  const loadResult = async (result) => {
    requestRef.current?.abort?.();
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    requestRef.current = controller;
    try {
      const loaded = await loadDatasourceFeatures(result, controller?.signal);
      if (controller?.signal.aborted) return;
      setLoadedFeature(loaded);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Failed to load features", err);
      setLoadedFeature(result);
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  const clearLoadedFeature = () => setLoadedFeature(null);

  useEffect(() => () => requestRef.current?.abort?.(), []);

  return {
    loadedFeature,
    loadResult,
    clearLoadedFeature,
  };
}
