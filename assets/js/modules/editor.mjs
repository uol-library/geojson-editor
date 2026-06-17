import { mapObj } from './config.mjs';

export function initEditor(){
    if ( document.getElementById( 'map' ) === null ) {
        return;
    }
    mapObj.map = L.map('map').setView([mapObj.startLoc.lat, mapObj.startLoc.lng], mapObj.startZoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapObj.map);
    mapObj.pmgroup = L.featureGroup().addTo(mapObj.map);
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
                    consoile.log('GeoJSON copied to clipboard!');
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
    
}
//https://onetime.bestpractical.com/secret/fuop8907pawk1qg8a308hmbaubp7m83
