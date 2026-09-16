import { mapObj } from './config.mjs';
import A11yDialog from 'a11y-dialog';


export function initEditor(){
    if ( document.getElementById( 'map' ) === null ) {
        return;
    }
    mapObj.map = L.map('map').setView([mapObj.startLoc.lat, mapObj.startLoc.lng], mapObj.startZoom);
    mapObj.osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapObj.map);
    mapObj.survey = L.tileLayer( 'https://allmaps.xyz/images/a51b7d4cdaadee59/{z}/{x}/{y}@2x.png', {
        maxZoom: 19,
	    attribution: 'Tiles served by <a target="external" href="https://allmaps.org">Allmaps</a>'
    });
    let baseMaps = {
        "OpenStreetMap": mapObj.osm
    };
    let overlayMaps = {
        "Survey": mapObj.survey
    };
    mapObj.layerControl = L.control.layers(baseMaps, overlayMaps, { position: 'bottomright' }).addTo(mapObj.map);
    mapObj.pmgroup = L.featureGroup().addTo(mapObj.map);
    mapObj._dialog = new A11yDialog( document.getElementById('ge-dialog'));
    L.Control.copyGeoJSON = L.Control.extend({
        options: {position:'topright'},
        initialize: function (options) {
            mapObj.copiedIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 600 600"><path fill="#181" d="M7.7 404.606s115.2 129.7 138.2 182.68h99c41.5-126.7 202.7-429.1 340.92-535.1 28.6-36.8-43.3-52-101.35-27.62-87.5 36.7-252.5 317.2-283.3 384.64-43.7 11.5-89.8-73.7-89.84-73.7z"/></svg>';
            mapObj.copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>';
            L.setOptions(this, options);
        },
        onAdd: function(map) {
            let container = L.DomUtil.create('div', 'leaflet-control-button leaflet-bar');
            mapObj.copyButton = L.DomUtil.create('button', 'copy__button', container);
            mapObj.copyButton.setAttribute('title','Copy GeoJSON');
            mapObj.copyButton.innerHTML = mapObj.copyIcon;
            L.DomEvent.on(mapObj.copyButton, 'click', function() {
                let geojson = mapObj.pmgroup.toGeoJSON();
                let geojsonStr = JSON.stringify(geojson, null, 4);
                navigator.clipboard.writeText(geojsonStr).then(function() {
                    console.log('GeoJSON copied to clipboard!');
                    mapObj.copyButton.innerHTML = mapObj.copiedIcon;
                    mapObj.copyButton.setAttribute('title','GeoJSON copied to clipboard');
                    setTimeout(() => {
                        mapObj.copyButton.innerHTML = mapObj.copyIcon;
                        mapObj.copyButton.setAttribute('title','Copy GeoJSON');
                    }, 1000);
                }, function(err) {
                    mapObj.copyButton.diabled = true;
                    mapObj.copyButton.setAttribute('title','Copy GeoJSON (disabled)');
                    console.error('Could not copy text: ', err);
                });
            });
            return container;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    L.control.copygeojson = function(opts) {
        return new L.Control.copyGeoJSON(opts);
    }
    L.control.copygeojson().addTo(mapObj.map);
    mapObj.map.pm.setGlobalOptions({ layerGroup: mapObj.pmgroup });
    mapObj.map.pm.addControls({  
        position: 'topright',
    });
    L.Control.loadGeoJSON = L.Control.extend({
        options: {position:'topright'},
        initialize: function (options) {
            mapObj.loadIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder2-open" viewBox="0 0 16 16"><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7z"/></svg>';
            L.setOptions(this, options);
            document.addEventListener('click', e => {
                if ( event.target.id === 'load_geojson_button' ) {
                    let geojson = document.getElementById( 'load_geojson_text' ).value;
                    alert(geojson);
                    let geojsonObj = JSON.parse( geojson );
                    if ( geojson === '' ) {
                        alert( 'Nothing here to load' );
                        return;
                    }
                    if ( document.getElementById( 'replace_current_layers' ).checked ) {
                        mapObj.pmgroup.clearLayers();
                    }
                    mapObj.pmgroup.addLayer( L.geoJSON( geojsonObj ) );
                    console.log('GeoJSON loaded!');
                    mapObj._dialog.hide();
                }
            });
        },
        onAdd: function(map) {
            let container = L.DomUtil.create('div', 'leaflet-control-button leaflet-bar');
            mapObj.loadButton = L.DomUtil.create('button', 'load__button', container);
            mapObj.loadButton.setAttribute('title','Copy GeoJSON');
            mapObj.loadButton.innerHTML = mapObj.loadIcon;
            L.DomEvent.on(mapObj.loadButton, 'click', function() {
                let title = document.getElementById('ge-dialog-title');
                title.textContent = "Load GeoJSON";
                let content = document.getElementById('ge-dialog-content');
                content.innerHTML = '<p><label for="load_geojson_text">Load GeoJSON features to edit by copying them into the textbox below</label></p><p><textarea id="load_geojson_text"></textarea></p><p><label><input type="checkbox" id="replace_current_layers"> Replace current editor layers</label></p><p><button id="load_geojson_button">Load</button></p>';
                mapObj._dialog.show();
            });
            return container;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    L.control.loadgeojson = function(opts) {
        return new L.Control.loadGeoJSON(opts);
    }
    L.control.loadgeojson().addTo(mapObj.map);
    mapObj.map.pm.setGlobalOptions({ layerGroup: mapObj.pmgroup });
    mapObj.map.pm.addControls({  
        position: 'topright',
    });
    
}

