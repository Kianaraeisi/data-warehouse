import { useState } from "react";
import { SidebarHeader } from "./search/SidebarHeader";
import { SearchFilters } from "./search/SearchFilters";
import { SearchResults } from "./search/SearchResults";
import { SidebarFooter } from "./search/SidebarFooter";
import "../../styles/SearchPanel.css";

export function SearchPanel({
  selectedArea,
  onAreaCleared,
  filters,
  onFilterChange,
  onSearch,
  searching,
  searchError,
  results,
  onResultLoad,
  onUploadClick,
}) {
  const [searchStarted, setSearchStarted] = useState(false);

  const handleSearch = () => {
    setSearchStarted(true);
    onSearch();
  };

  return (
    <aside className="search-panel">
      <SidebarHeader onUploadClick={onUploadClick} />
      {!searchStarted && (
        <SearchFilters
          selectedArea={selectedArea}
          onAreaCleared={onAreaCleared}
          filters={filters}
          onFilterChange={onFilterChange}
          onSearch={handleSearch}
          searching={searching}
        />
      )}
      {searchStarted && (
        <SearchResults
          results={results}
          error={searchError}
          searching={searching}
          onResultLoad={onResultLoad}
        />
      )}
      <SidebarFooter />
    </aside>
  );
}
