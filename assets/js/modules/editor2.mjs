import { 
    Control,
    Map,
    TileLayer,
    CircleMarker,
    Polyline
} from 'leaflet';
import * as L from 'leaflet';
import { StorageControl } from './storage.mjs';
import { mapObj } from './config.mjs';
import Polydraw from 'polydraw';

/**
 * Initialise map and set listeners to set up markers when loaded
 */
export function initEditor() {
    // Add the PolyDraw control (includes all drawing buttons)
    mapObj.polydraw = new Polydraw({
        position: 'topleft'
    });
    mapObj.polydraw.addTo(mapObj.map);
    mapObj.storagecontrol = new StorageControl({
        position: 'topright',
        prefix: 'geojson-editor',
        saveTitle: "Save GeoJSON data",
        exportTitle: "Export GeoJSON data",
        loadTitle: "Load GeoJSON data",
        saveCallback: saveGeoJSON,
        loadCallback: loadGeoJSON
    }).addTo(mapObj.map);
    mapObj.map.on( 'click', e => { console.log( e.latlng ); });
}

function saveGeoJSON() {
    console.log("Saving GeoJSON data...");
    console.log(mapObj.polydraw);
    console.log(mapObj.polydraw.getAllLayers());
    let polygon = mapObj.polydraw.getFeatureGroups().getLayers().find((layer) => layer instanceof L.Polygon);
    return { success: true, data: JSON.stringify(polygon.toGeoJSON()), msg: 'Saved GeoJSON data' };
}

function loadGeoJSON(data) {
    console.log("Loading GeoJSON data...");
    /* data is parsed JSOn contianing an array of objects with lat, lng and timestamp properties */
    let waypoints = [];
    data.forEach(p => {
        if ( p.lat && p.lng && p.timestamp ) {
            waypoints.push({ lat: p.lat, lng: p.lng});
        }
        new CircleMarker([p.lat, p.lng], { radius: 5, color: 'blue' }).addTo(mapObj.map);
    });
    if ( waypoints.length > 1 ) {
        new Polyline(waypoints, { color: 'blue' }).addTo(mapObj.map);
    }
    return { success: true, data: JSON.stringify(data), msg: 'Loaded journey data' };
}