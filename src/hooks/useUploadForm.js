import { useState } from "react";
import { profileGeoJsonFile } from "../services/geoJsonProfiler";
import { registerDatasource } from "../services/uploadApi";

const INITIAL_BBOX = { xmin: 0, ymin: 0, xmax: 0, ymax: 0 };

const FORMAT_BY_EXTENSION = {
  geojson: "GeoJSON",
  json: "JSON",
  shp: "Shapefile",
  gpkg: "GeoPackage",
  csv: "CSV",
  tif: "GeoTIFF",
  tiff: "GeoTIFF",
};

export function useUploadForm(onSuccess) {
  const [sourceType, setSourceType] = useState("file");
  const [file, setFile] = useState(null);
  const [ogcUrl, setOgcUrl] = useState("");
  const [ogcType, setOgcType] = useState("WFS");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [crs, setCrs] = useState("EPSG:4326");
  const [isSpatial, setIsSpatial] = useState(true);
  const [dataClass, setDataClass] = useState("vector");
  const [dataFormat, setDataFormat] = useState("");
  const [geometryType, setGeometryType] = useState("Polygon");
  const [bbox, setBbox] = useState(INITIAL_BBOX);
  const [featureCount, setFeatureCount] = useState(0);
  const [columnCount, setColumnCount] = useState(0);
  const [detectedColumns, setDetectedColumns] = useState([]);
  const [primaryKeyStrategy, setPrimaryKeyStrategy] = useState("uuid");
  const [foreignKeyColumn, setForeignKeyColumn] = useState("");
  const [temporalStart, setTemporalStart] = useState("");
  const [temporalEnd, setTemporalEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile || null);
    setError(null);

    if (!selectedFile) {
      setDataFormat("");
      return;
    }

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    setDataFormat(FORMAT_BY_EXTENSION[extension] || "");
    if (["tif", "tiff"].includes(extension)) setDataClass("raster");
    if (["geojson", "json", "shp", "gpkg", "csv"].includes(extension)) {
      setDataClass("vector");
    }
  };

  const profileFile = async () => {
    setError(null);
    try {
      const profile = await profileGeoJsonFile(file);
      setFeatureCount(profile.featureCount);
      setColumnCount(profile.columnCount);
      setDetectedColumns(profile.detectedColumns);
      setGeometryType(profile.geometryType || "");
      if (profile.bbox) setBbox(profile.bbox);
      return profile;
    } catch (profileError) {
      setError(profileError.message);
      throw profileError;
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      const validationError = new Error("Name is required.");
      setError(validationError.message);
      throw validationError;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await registerDatasource({
        sourceType,
        file,
        ogcUrl,
        ogcType,
        name: name.trim(),
        tags,
        description,
        crs,
        isSpatial,
        dataClass,
        dataFormat,
        bbox,
        temporalStart,
        temporalEnd,
      });
      onSuccess?.(result);
      return result;
    } catch (submitError) {
      setError(submitError.message);
      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sourceType,
    setSourceType,
    file,
    handleFileChange,
    ogcUrl,
    setOgcUrl,
    ogcType,
    setOgcType,
    name,
    setName,
    tags,
    setTags,
    description,
    setDescription,
    crs,
    setCrs,
    isSpatial,
    setIsSpatial,
    dataClass,
    setDataClass,
    dataFormat,
    setDataFormat,
    geometryType,
    setGeometryType,
    bbox,
    setBbox,
    featureCount,
    columnCount,
    detectedColumns,
    primaryKeyStrategy,
    setPrimaryKeyStrategy,
    foreignKeyColumn,
    setForeignKeyColumn,
    temporalStart,
    setTemporalStart,
    temporalEnd,
    setTemporalEnd,
    submitting,
    error,
    profileFile,
    submit,
  };
}
