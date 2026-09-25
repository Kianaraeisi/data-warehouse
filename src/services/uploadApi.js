import { API_BASE_URL } from "../config/api";

function getFileExtension(file) {
  return file?.name?.split(".").pop()?.toLowerCase() || null;
}

export function buildRegistrationPayload(form) {
  const fileFormat = getFileExtension(form.file);

  return {
    registry: {
      name: form.name,
      description: form.description,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      crs: form.crs,
      temporal_start: form.temporalStart || null,
      temporal_end: form.temporalEnd || null,
    },
    source: {
      type: form.sourceType,
      filename: form.file?.name || null,
      format: fileFormat,
      ogc_url: form.sourceType === "ogc" ? form.ogcUrl : null,
      ogc_type: form.sourceType === "ogc" ? form.ogcType : null,
    },
    spatial_footprint: form.isSpatial
      ? {
          type: "Polygon",
          coordinates: [[
            [Number(form.bbox.xmin), Number(form.bbox.ymin)],
            [Number(form.bbox.xmax), Number(form.bbox.ymin)],
            [Number(form.bbox.xmax), Number(form.bbox.ymax)],
            [Number(form.bbox.xmin), Number(form.bbox.ymax)],
            [Number(form.bbox.xmin), Number(form.bbox.ymin)],
          ]],
        }
      : null,
    datasource_class: {
      is_spatial: form.isSpatial,
      data_class: form.dataClass,
      format: form.dataFormat || fileFormat || "GeoJSON",
    },
    manifest: {},
    features: [],
  };
}

export async function registerDatasource(form) {
  const response = await fetch(`${API_BASE_URL}/api/v1/datasources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildRegistrationPayload(form)),
  });

  if (!response.ok) {
    throw new Error(`Upload request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
}
