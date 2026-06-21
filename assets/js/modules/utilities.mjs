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
 * Normalises latitude/longitude objects so they only extend to 6 decimal places.
 * @param {Object} latlng - The latitude/longitude object to normalise
 * @returns {Object} - The normalised latitude/longitude object
 */
export function normaliseLatLng( latlng ) {
    return {
        lat: parseFloat( latlng.lat.toFixed( 6 ) ),
        lng: parseFloat( latlng.lng.toFixed( 6 ) )
    };
}

/**
 * Initialise map with a standard plugins:
 * - Fullscreen control
 * - Locate control
 * - Theme control
 * - Layer control with OpenStreetMap, OpenCycleMap and Esri World Imagery base layers
 * 
 * Also fires a 'maploaded' event on the document which can be listened 
 * for to trigger other functionality once the map is ready.
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
            title: "Start tracking my location"
        },
        locateOptions: {
            watch: true,
            enableHighAccuracy: true
        }
    }).addTo(mapObj.map);
    // Theme control
    mapObj.themeControl = new ThemeControl({
        position: "topleft",
        defaultTheme: "light",
        detectSystemTheme: false,
        storageKey: "iiif-map-theme",

        // Callback when theme changes
        onChange: (themeKey, theme) => {
            console.log(`Theme changed to: ${themeKey}`);
        }
    }).addTo(mapObj.map);
    document.dispatchEvent( new Event( 'maploaded' ) );
}

/**
 * Create a DOM element with a class name and optionally append it to a parent.
 * @param {string} tag - The element tag name.
 * @param {string} [className] - Space-separated class names.
 * @param {HTMLElement} [parent] - Optional parent to append the element to.
 * @returns {HTMLElement}
 */
export function createElement(tag, className, parent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    parent?.append(el);
    return el;
}

/**
 * Checks to see if localStorage is available
 * 
 * @param {string} type (localStorage or sessionStorage)
 * @returns {boolean}
 */
function storageAvailable( type ) {
    var storage;
    try {
        storage = window[ type ];
        var x = '__storage_test__';
        storage.setItem( x, x );
        storage.removeItem( x );
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            ( storage && storage.length !== 0 );
    }
}

/**
 * Sets a value in localStorage but adds expiry date
 * 
 * @param {string} key localStorage key
 * @param {string} value to set
 * @param {int} ttl Time to live (in hours)
 */
function setWithExpiry( key, value, ttl ) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + ( ttl * 60 * 60 * 1000 ),
    }
    localStorage.setItem( key, JSON.stringify( item ) )
}

/**
 * Gets a value in localStorage but checks expiry date
 * first. If expired, localStorage key is removed and
 * null returned.
 * 
 * @param {string} key localStorage key
 */
function getWithExpiry( key ) {
    const itemStr = localStorage.getItem( key )
    if ( ! itemStr ) {
        return null;
    }
    const item = JSON.parse( itemStr )
    const now = new Date()
    if ( now.getTime() > item.expiry ) {
        localStorage.removeItem( key )
        return null
    }
    return item.value;
}

/**
 * Gets a JSON data file from a remote URL. Utilises localstorage
 * to cache the results.
 * @param {Object} options Information about the JSON file
 * @param {String} options.key Unique key used to store the data in localstorage (required)
 * @param {String} options.url URL of the JSON file (required)
 * @param {Integer} options.expiry How long to cache the results (in hours) default: 24
 * @param {Function} options.callback callback function with one parameter (JSON parsed response)
 */
function getJSON( options ) {
    if ( ! options.hasOwnProperty( 'key' ) || ! options.hasOwnProperty( 'url' ) ) {
        return;
    }
    if ( ! options.hasOwnProperty( 'expires' ) ) {
        options.expires = 24;
    }
    if ( storageAvailable( 'localStorage' ) && getWithExpiry( options.key ) ) {
        splog( "getting data '"+options.key+"' from local storage", "utilities.js" );
        if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
            options.callback( JSON.parse( getWithExpiry( options.key ) ) );
        }
    } else {
        splog( "getting data '"+options.key+"' from "+options.url, "utilities.js" );
        var oReq = new XMLHttpRequest();
        oReq.addEventListener( 'load', function(){
            if ( storageAvailable( 'localStorage' ) ) {
                var expires = new Date().getTime() + ( options.expires * 60 * 60 * 1000 );
                splog( "storing data '" + options.key + "' in localstorage - expires " + expires, "utilities.js" );
                setWithExpiry( options.key, this.responseText, options.expires );
            }
            if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
                options.callback( JSON.parse( this.responseText ) );
            }
        });
        oReq.open("GET", options.url);
        oReq.send();
    }
}

