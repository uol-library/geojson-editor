import { 
    Control,
    Map,
    TileLayer
} from 'leaflet';
import { LocateControl } from 'locatecontrol';
import { FullScreen } from 'fullscreencontrol';
import { ThemeControl } from "themecontrol";
import { mapObj } from './config.mjs';


/**
 * Initialise map and set listeners to set up markers when loaded
 */
export function initMap() {
    if ( document.getElementById( 'map' ) === null ) {
        return;
    }
	mapObj.map = new Map('map', {
		zoom: mapObj.startZoom,
		center: [ mapObj.startLoc.lat, mapObj.startLoc.lng ],
		minZoom: mapObj.minZoom,
		maxZoom: mapObj.maxZoom
	});
    /* change leaflet attribution */
    mapObj.map.attributionControl.setPrefix( '<a href="https://leafletjs.com" target="external" title="A JavaScript library for interactive maps" aria-label="Leaflet - a JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet</a>' );
    mapObj.osm = new TileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: mapObj.maxZoom,
        attribution: '© <a target="external" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo( mapObj.map );
    mapObj.OpenCycleMap = new TileLayer('https://api.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=953b59eb91064cc1a54bc7fe78939685', {
        maxZoom: mapObj.maxZoom,
        attribution: 'Maps: &copy; <a href="https://www.thunderforest.com/">Thunmderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    mapObj.Esri_WorldImagery = new TileLayer( 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: mapObj.maxZoom,
	    attribution: 'Tiles © Esri - Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    let baseMaps = {
        "OpenStreetMap": mapObj.osm,
        "OpenCycleMap": mapObj.OpenCycleMap,
        "Esri WorldImagery": mapObj.Esri_WorldImagery
    };
    let overlayMaps = {};
    mapObj.layerControl = new Control.Layers(baseMaps, overlayMaps, { position: 'bottomleft' }).addTo(mapObj.map);
    mapObj.fullscreencontrol = new FullScreen({
		position: 'topleft'
	}).addTo(mapObj.map);
    mapObj.locateControl = new LocateControl({
        position: 'topleft',
        strings: {
            title: "Show me where I am!"
        },
        locateOptions: {
            watch: true,
            enableHighAccuracy: true
        }
    }).addTo(mapObj.map);
    // Theme control
    new ThemeControl({
        position: "topleft",
        defaultTheme: "light",
        detectSystemTheme: true,
        storageKey: "iiif-map-theme",

        // Callback when theme changes
        onChange: (themeKey, theme) => {
            console.log(`Theme changed to: ${themeKey}`);
        }
    }).addTo(mapObj.map);    
    mapObj.map.on('locationfound', function(e){
        mapObj.user.lat = e.latitude;
        mapObj.user.lng = e.longitude;
        console.log(mapObj.user);
    });
    mapObj.map.on('locateactivate', e => { mapObj.locationactive = true });
    mapObj.map.on('locatedeactivate', e => { mapObj.locationactive = false; mapObj.user.lat = null; mapObj.user.lng = null });
    mapObj.map.on( 'click', e => { console.log( e.latlng ); });
    mapObj.mapLoaded = true;

    document.dispatchEvent( new Event( 'maploaded' ) );
}