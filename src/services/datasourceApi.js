const API_BASE_URL = "http://130.192.238.11:8008";

export function normalizeDatasource(item) {
  let geometry = null;
  let footprint = null;

  if (item.spatial_footprint) {
    try {
      const parsed =
        typeof item.spatial_footprint === "string"
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

export async function searchDatasources({ selectedArea, filters }) {
  const query = new URLSearchParams();
  const parsedTags = filters.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (parsedTags.length) query.set("tags", parsedTags.join(","));
  if (filters.dateFrom) query.set("temporal_start", filters.dateFrom);
  if (filters.dateTo) query.set("temporal_end", filters.dateTo);

  const polygon = selectedArea?.geojson?.geometry;
  if (polygon) query.set("footprint_intersects", JSON.stringify(polygon));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/v1/datasources${suffix}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.status}`);
  }

  const data = await response.json();
  const list = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
    ? data
    : [];

  return list.map(normalizeDatasource);
}

export async function loadDatasourceFeatures(result) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/datasources/${result.id}/features`
  );

  if (!response.ok) {
    throw new Error(`Failed to load features: ${response.status}`);
  }

  const data = await response.json();
  const features = Array.isArray(data?.features)
    ? data.features
    : Array.isArray(data)
    ? data
    : [];

  return { ...result, features };
}
