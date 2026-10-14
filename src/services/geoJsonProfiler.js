import Papa from "papaparse";

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

function getBounds(coordinates) {
  if (!coordinates.length) return null;

  const bounds = coordinates.reduce(
    (current, [longitude, latitude]) => ({
      xmin: Math.min(current.xmin, longitude),
      ymin: Math.min(current.ymin, latitude),
      xmax: Math.max(current.xmax, longitude),
      ymax: Math.max(current.ymax, latitude),
    }),
    { xmin: Infinity, ymin: Infinity, xmax: -Infinity, ymax: -Infinity }
  );

  return Object.fromEntries(
    Object.entries(bounds).map(([key, value]) => [key, value.toFixed(6)])
  );
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

  return {
    featureCount: features.length,
    columnCount: columns.size,
    detectedColumns: Array.from(columns),
    geometryType,
    bbox: getBounds(coordinates),
  };
}

function normalizeColumnName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function profileCsv(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length) {
    throw new Error(`Invalid CSV file: ${parsed.errors[0].message}`);
  }

  const columns = parsed.meta.fields || [];
  if (!columns.length) throw new Error("The CSV file does not contain a header row.");

  const rows = parsed.data.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").trim() !== "")
  );
  const geometryColumn = columns.find((column) =>
    ["geometrygeojson", "geojson", "geometry"].includes(normalizeColumnName(column))
  );
  const geometryTypeColumn = columns.find(
    (column) => normalizeColumnName(column) === "geometrytype"
  );
  const coordinates = [];
  let geometryType = "";

  rows.forEach((row, index) => {
    const geometryValue = geometryColumn ? row[geometryColumn]?.trim() : "";
    if (geometryValue) {
      let geometry;
      try {
        geometry = JSON.parse(geometryValue);
      } catch {
        throw new Error(`Invalid geometry JSON in CSV row ${index + 2}.`);
      }

      if (geometry.type === "Feature") geometry = geometry.geometry;
      if (geometry.type === "FeatureCollection") {
        geometry.features?.forEach((feature) => {
          if (!geometryType && feature.geometry?.type) {
            geometryType = feature.geometry.type;
          }
          collectCoordinates(feature.geometry, coordinates);
        });
      } else {
        if (!geometryType && geometry.type) geometryType = geometry.type;
        collectCoordinates(geometry, coordinates);
      }
    }

    if (!geometryType && geometryTypeColumn) {
      geometryType = row[geometryTypeColumn]?.trim() || "";
    }
  });

  return {
    featureCount: rows.length,
    columnCount: columns.length,
    detectedColumns: columns,
    geometryType,
    bbox: getBounds(coordinates),
  };
}

export async function profileDatasetFile(file) {
  if (!file) throw new Error("Please select a file first.");

  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (!extension || !["json", "geojson", "csv"].includes(extension)) {
    throw new Error("Profiling is currently available for GeoJSON and CSV files.");
  }

  const fileText = await file.text();
  if (extension === "csv") return profileCsv(fileText);

  let geoJson;
  try {
    geoJson = JSON.parse(fileText);
  } catch {
    throw new Error("Invalid GeoJSON file.");
  }

  return profileGeoJson(geoJson);
}
