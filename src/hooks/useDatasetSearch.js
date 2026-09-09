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

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const search = async () => {
    setSearching(true);

    try {
      const nextResults = await searchDatasources({ selectedArea, filters });
      setResults(nextResults);
    } catch (err) {
      console.error("Search request failed", err);
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
    search,
  };
}
