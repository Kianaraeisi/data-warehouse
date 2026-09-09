import { SidebarHeader } from "./search/SidebarHeader";
import { SearchFilters } from "./search/SearchFilters";
import { SearchResults } from "./search/SearchResults";
import { SidebarFooter } from "./search/SidebarFooter";
import "../styles/SearchPanel.css";

export function SearchPanel({
  selectedArea,
  onAreaCleared,
  filters,
  onFilterChange,
  onSearch,
  searching,
  results,
  onResultLoad,
  onUploadClick,
}) {
  return (
    <aside className="search-panel">
      <SidebarHeader onUploadClick={onUploadClick} />
      <SearchFilters
        selectedArea={selectedArea}
        onAreaCleared={onAreaCleared}
        filters={filters}
        onFilterChange={onFilterChange}
        onSearch={onSearch}
        searching={searching}
      />
      <SearchResults results={results} onResultLoad={onResultLoad} />
      <SidebarFooter />
    </aside>
  );
}
