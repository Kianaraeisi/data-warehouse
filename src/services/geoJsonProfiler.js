function getFeatures(geoJson) {
  if (geoJson?.type === "FeatureCollection" && Array.isArray(geoJson.features)) {
    return geoJson.features;
  }

  if (geoJson?.type === "Feature") {
    return [geoJson];
  }

  if (geoJson?.type && geoJson.coordinates) {
    return [{ type: "Feature", geometry: geoJson, properties: {} }];
  }

  throw new Error("The file does not contain valid GeoJSON.");
}

function collectCoordinates(geometry, coordinates) {
  if (!geometry) return;

  if (geometry.type === "GeometryCollection") {
    geometry.geometries?.forEach((child) =>
      collectCoordinates(child, coordinates)
    );
    return;
  }

  if (!Array.isArray(geometry.coordinates)) return;

  const pending = [geometry.coordinates];
  while (pending.length) {
    const current = pending.pop();
    if (!Array.isArray(current) || current.length === 0) continue;

    if (
      typeof current[0] === "number" &&
      typeof current[1] === "number"
    ) {
      coordinates.push([current[0], current[1]]);
      continue;
    }

    current.forEach((child) => pending.push(child));
  }
}

export function profileGeoJson(geoJson) {
  const features = getFeatures(geoJson);
  const columns = new Set();
  const coordinates = [];
  let geometryType = "";

  features.forEach((feature) => {
    Object.keys(feature?.properties || {}).forEach((column) =>
      columns.add(column)
    );

    if (!geometryType && feature?.geometry?.type) {
      geometryType = feature.geometry.type;
    }

    collectCoordinates(feature?.geometry, coordinates);
  });

  const bounds = coordinates.reduce(
    (current, [longitude, latitude]) => ({
      xmin: Math.min(current.xmin, longitude),
      ymin: Math.min(current.ymin, latitude),
      xmax: Math.max(current.xmax, longitude),
      ymax: Math.max(current.ymax, latitude),
    }),
    { xmin: Infinity, ymin: Infinity, xmax: -Infinity, ymax: -Infinity }
  );

  return {
    featureCount: features.length,
    columnCount: columns.size,
    detectedColumns: Array.from(columns),
    geometryType,
    bbox: coordinates.length
      ? Object.fromEntries(
          Object.entries(bounds).map(([key, value]) => [key, value.toFixed(6)])
        )
      : null,
  };
}

export async function profileGeoJsonFile(file) {
  if (!file) throw new Error("Please select a file first.");

  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (!extension || !["json", "geojson"].includes(extension)) {
    throw new Error("Profiling is currently available only for GeoJSON files.");
  }

  let geoJson;
  try {
    geoJson = JSON.parse(await file.text());
  } catch {
    throw new Error("Invalid GeoJSON file.");
  }

  return profileGeoJson(geoJson);
}
