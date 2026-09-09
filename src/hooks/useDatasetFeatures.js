import { useState } from "react";
import { loadDatasourceFeatures } from "../services/datasourceApi";

export function useDatasetFeatures() {
  const [loadedFeature, setLoadedFeature] = useState(null);

  const loadResult = async (result) => {
    try {
      const loaded = await loadDatasourceFeatures(result);
      setLoadedFeature(loaded);
    } catch (err) {
      console.error("Failed to load features", err);
      setLoadedFeature(result);
    }
  };

  const clearLoadedFeature = () => setLoadedFeature(null);

  return {
    loadedFeature,
    loadResult,
    clearLoadedFeature,
  };
}
