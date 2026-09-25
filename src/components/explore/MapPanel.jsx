import { useState, useEffect, useRef } from "react";
import { useLeaflet } from "../../hooks/useLeaflet";
import "../../styles/MapPanel.css";

export function MapPanel({ onAreaSelected, onAreaCleared, results, loadedFeature }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnLayersRef = useRef(null);
  const resultsLayerRef = useRef(null);
  const loadedFeatureLayerRef = useRef(null);
  const onAreaSelectedRef = useRef(onAreaSelected);
  const onAreaClearedRef = useRef(onAreaCleared);
  const [leafletReady, setLeafletReady] = useState(false);

  onAreaSelectedRef.current = onAreaSelected;
  onAreaClearedRef.current = onAreaCleared;

  useLeaflet(() => setLeafletReady(true));

  useEffect(() => {
    if (!leafletReady || mapInstanceRef.current) return undefined;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [45.07, 7.68],
      zoom: 9,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnLayersRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polygon: { shapeOptions: { color: "#ef4444" } },
        rectangle: { shapeOptions: { color: "#ef4444" } },
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    const handleCreated = (event) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(event.layer);
      const bounds = event.layer.getBounds
        ? event.layer.getBounds()
        : L.latLngBounds([event.layer.getLatLng()]);
      const coordinates = event.layer.getLatLngs
        ? event.layer.getLatLngs()[0].map((latlng) => ({
            lat: latlng.lat.toFixed(4),
            lng: latlng.lng.toFixed(4),
          }))
        : [];

      onAreaSelectedRef.current({
        geojson: event.layer.toGeoJSON(),
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        coordinates,
      });
    };
    const handleDeleted = () => onAreaClearedRef.current();

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);
    mapInstanceRef.current = map;

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.remove();
      mapInstanceRef.current = null;
      drawnLayersRef.current = null;
      resultsLayerRef.current = null;
      loadedFeatureLayerRef.current = null;
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const L = window.L;
    if (!resultsLayerRef.current) {
      resultsLayerRef.current = new L.FeatureGroup();
      mapInstanceRef.current.addLayer(resultsLayerRef.current);
    }
    resultsLayerRef.current.clearLayers();

    if (results) {
      results.forEach((item) => {
        if (item.footprint) {
          L.polygon(item.footprint, {
            color: "#1e3a5f",
            weight: 1,
            fillOpacity: 0.1,
          }).addTo(resultsLayerRef.current);
        }
      });
    }
  }, [results, leafletReady]);

  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const L = window.L;
    if (!loadedFeatureLayerRef.current) {
      loadedFeatureLayerRef.current = new L.FeatureGroup();
      mapInstanceRef.current.addLayer(loadedFeatureLayerRef.current);
    }
    loadedFeatureLayerRef.current.clearLayers();

    if (loadedFeature?.features?.length) {
      loadedFeature.features.forEach((feature) => {
        let geometry = feature.geometry;
        if (typeof geometry === "string") {
          try {
            geometry = JSON.parse(geometry);
          } catch (error) {
            console.warn("Unable to parse feature geometry", error);
            return;
          }
        }
        if (!geometry) return;

        const layer = L.geoJSON(geometry, {
          style: { color: "#4f9cf9", weight: 2, fillOpacity: 0.25 },
        }).addTo(loadedFeatureLayerRef.current);
        if (feature.attributes) {
          let popupContent = "<b>Properties:</b><br>";
          Object.entries(feature.attributes).forEach(([key, value]) => {
            popupContent += `${key}: ${value}<br>`;
          });
          layer.bindPopup(popupContent);
        }
      });

      const bounds = loadedFeatureLayerRef.current.getBounds();
      if (bounds.isValid()) mapInstanceRef.current.fitBounds(bounds);
    }
  }, [loadedFeature, leafletReady]);

  return <div ref={mapRef} className="map-container" />;
}
