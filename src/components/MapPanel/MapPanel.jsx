import { useState, useEffect, useRef } from "react";
import { useLeaflet } from "../../hooks/useLeaflet";
import "../../styles/MapPanel.css";

export function MapPanel({ onAreaSelected, onAreaCleared, results, loadedFeature }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnLayersRef = useRef(null);
  const resultsLayerRef = useRef(null);
  const loadedFeatureLayerRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useLeaflet(() => setLeafletReady(true));

  useEffect(() => {
    if (!leafletReady || mapInstanceRef.current) return;

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

    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);

      const bounds = e.layer.getBounds ? e.layer.getBounds() : L.latLngBounds([e.layer.getLatLng()]);

      let coords = [];
      if (e.layer.getLatLngs) {
        const latlngs = e.layer.getLatLngs()[0];
        coords = latlngs.map((ll) => ({
          lat: ll.lat.toFixed(4),
          lng: ll.lng.toFixed(4),
        }));
      }

      onAreaSelected({
        geojson: e.layer.toGeoJSON(),
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        coordinates: coords,
      });
    });

    map.on(L.Draw.Event.DELETED, () => onAreaCleared());

    mapInstanceRef.current = map;
  }, [leafletReady, onAreaSelected, onAreaCleared]);

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

    if (loadedFeature && loadedFeature.geometry) {
      const geojsonLayer = L.geoJSON(loadedFeature.geometry, {
        style: { color: "#4f9cf9", weight: 3, fillOpacity: 0.3 },
      }).addTo(loadedFeatureLayerRef.current);

      if (loadedFeature.properties) {
        let popupContent = "<b>Properties:</b><br>";
        Object.entries(loadedFeature.properties).forEach(([k, v]) => {
          popupContent += `${k}: ${v}<br>`;
        });
        geojsonLayer.bindPopup(popupContent).openPopup();
      }

      mapInstanceRef.current.fitBounds(geojsonLayer.getBounds());
    }
  }, [loadedFeature, leafletReady]);

  return <div ref={mapRef} className="map-container" />;
}
