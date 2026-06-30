import { useState } from "react";
import { MapPanel } from "./components/MapPanel";
import { UploadModal } from "./components/UploadModal";
import { SearchPanel } from "./components/SearchPanel";
import "./styles/index.css";

const API_BASE_URL = "http://130.192.238.11:8008";

function normalizeDatasource(item) {
  let geometry = null;
  let footprint = null;

  if (item.spatial_footprint) {
    try {
      const parsed = typeof item.spatial_footprint === "string"
        ? JSON.parse(item.spatial_footprint)
        : item.spatial_footprint;

      geometry = parsed;
      if (parsed?.type === "Polygon" && Array.isArray(parsed.coordinates)) {
        footprint = parsed.coordinates[0]?.map(([lng, lat]) => [lat, lng]) || [];
      }
    } catch (err) {
      console.warn("Unable to parse spatial footprint", err);
    }
  }

  return {
    id: item.id,
    name: item.name,
    date: item.temporal_start || item.uploaded_at?.split("T")[0] || "",
    geometry,
    footprint,
    properties: {
      description: item.description,
      tags: item.tags || [],
      sourceType: item.source_type,
      location: item.location,
      crs: item.crs,
      uploadedAt: item.uploaded_at,
    },
  };
}

export default function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tags, setTags] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loadedFeature, setLoadedFeature] = useState(null);

  const handleSearch = async () => {
    const payload = {
      polygon: selectedArea?.geojson?.geometry || null,
      datarange: {
        from: dateFrom || "all",
        to: dateTo || "all",
      },
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setSearching(true);
    setLoadedFeature(null);
try {
      const query = new URLSearchParams();

      if (payload.tags?.length) {
        query.set("tags", payload.tags.join(","));
      }
      if (payload.datarange?.from && payload.datarange.from !== "all") {
        query.set("temporal_start", payload.datarange.from);
      }
      if (payload.datarange?.to && payload.datarange.to !== "all") {
        query.set("temporal_end", payload.datarange.to);
      }
      if (payload.polygon) {
        query.set("footprint_intersects", JSON.stringify(payload.polygon));
      }

      let endpoint = `${API_BASE_URL}/api/v1/datasources`;
      if (query.toString()) {
        endpoint = `${endpoint}?${query.toString()}`;
      }

      const res = await fetch(endpoint, { method: "GET", headers: { "Content-Type": "application/json" } });

      if (!res.ok) {
        throw new Error(`Search request failed: ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setResults(list.map(normalizeDatasource));
    } catch (err) {
      console.error("Search request failed", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="main-layout">
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}

      <SearchPanel
        selectedArea={selectedArea}
        onAreaCleared={() => setSelectedArea(null)}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        tags={tags}
        onTagsChange={setTags}
        onSearch={handleSearch}
        searching={searching}
        results={results}
        onResultLoad={setLoadedFeature}
        onUploadClick={() => setUploadOpen(true)}
      />

      <main className="main-content">
        <MapPanel
          onAreaSelected={setSelectedArea}
          onAreaCleared={() => setSelectedArea(null)}
          results={results}
          loadedFeature={loadedFeature}
        />
      </main>
    </div>
  );
}
