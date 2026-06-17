import { 
    CircleMarker,
    Polyline
} from 'leaflet';
import { StorageControl } from './storage.mjs';
import { normaliseLatLng } from './utilities.mjs';
import { mapObj } from './config.mjs';

/**
 * Initialise tracker functionality - set up storage control, journey line and markers,
 * and listeners for location updates
 */
export function initTracker() {
    console.log("Initialising tracker...");
    mapObj.storagecontrol = new StorageControl({
        position: 'topright',
        prefix: 'geojson-editor',
        saveTitle: "Save journey data",
        exportTitle: "Export journey data",
        loadTitle: "Load journey data",
        saveCallback: saveState,
        loadCallback: loadState
    });
    mapObj.storagecontrol.addTo(mapObj.map);
    mapObj.journeyline = new Polyline([], { color: 'red' }).addTo(mapObj.map);
    mapObj.journeymarkers = [];
    mapObj.map.on('locationfound', function(e){
        mapObj.user.lat = e.latitude;
        mapObj.user.lng = e.longitude;
        let nll = normaliseLatLng({lat: e.latitude, lng: e.longitude});
        if ( mapObj.user.journey.length === 0 || ( mapObj.user.journey[mapObj.user.journey.length - 1].lat !== nll.lat || mapObj.user.journey[mapObj.user.journey.length - 1].lng !== nll.lng ) ) {
            mapObj.user.journey.push({lat: nll.lat, lng: nll.lng, timestamp: e.timeStamp});
            let marker = new CircleMarker([nll.lat, nll.lng], { radius: 5, color: 'red' }).addTo(mapObj.map);
            mapObj.journeymarkers.push(marker);
            if ( mapObj.user.journey.length > 1 ) {
                let waypoints = [];
                mapObj.user.journey.forEach(p => {
                    waypoints.push({ lat: p.lat, lng: p.lng});
                });
                mapObj.journeyline.setLatLngs(waypoints);
            }
        }
        console.log(mapObj.user);
    });
    mapObj.map.on('locateactivate', e => { mapObj.locationactive = true });
    mapObj.map.on('locatedeactivate', e => { mapObj.locationactive = false; mapObj.user.lat = null; mapObj.user.lng = null });
    mapObj.map.on( 'click', e => { console.log( e.latlng ); });
}

function saveState() {
    console.log("Saving journey data...");
    return { success: true, data: JSON.stringify(mapObj.user.journey), msg: 'Saved journey data' };
}

function loadState(data) {
    console.log("Loading journey data...");
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