import { useState } from "react";
import { searchDatasources } from "../services/datasourceApi";

const initialFilters = {
  dateFrom: "",
  dateTo: "",
  tags: "",
};

export function useDatasetSearch(selectedArea) {
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const search = async () => {
    setSearching(true);
    setError(null);

    try {
      const nextResults = await searchDatasources({ selectedArea, filters });
      setResults(nextResults);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Search request failed", err);
      setError(err.message || "The dataset catalog is unavailable.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return {
    filters,
    updateFilter,
    results,
    searching,
    error,
    search,
  };
}
