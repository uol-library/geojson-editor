/**
 * Leafletjs functions for mapObj Maps
 */
document.addEventListener( 'DOMContentLoaded', () => {
    initMap();
});
var mapObj = {
    startLoc: {
        lat: 53.74691335748559,
        lng: -2.0338482556515936
    },
    startZoom: 15
};
/**
 * Initialise map and set listeners to set up markers when loaded
 */
function initMap() {
    if ( document.getElementById( 'map' ) === null ) {
        return;
    }
    mapObj.map = L.map( 'map' ).setView([mapObj.startLoc.lat, mapObj.startLoc.lng], mapObj.startZoom );
    /* change leaflet attribution */
    mapObj.map.attributionControl.setPrefix( '<a href="https://leafletjs.com" target="external" title="A JavaScript library for interactive maps" aria-label="Leaflet - a JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet</a>' );
    mapObj.osm = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a target="external" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo( mapObj.map );
    mapObj.OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    mapObj.Esri_WorldImagery = L.tileLayer( 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
	    attribution: 'Tiles © Esri - Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    mapObj.Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
    });
    mapObj.survey = L.tileLayer( 'https://allmaps.xyz/images/a51b7d4cdaadee59/{z}/{x}/{y}@2x.png', {
        maxZoom: 19,
	    attribution: 'Tiles served by <a target="external" href="https://allmaps.org">Allmaps</a>'
    });
    
    // add fullscreen control
    mapObj.map.addControl( new L.Control.Fullscreen( { position: 'topright' } ) );
    
    // configure geoman editor
    mapObj.editorLayerGroup = L.layerGroup().addTo( mapObj.map );
    mapObj.map.pm.addControls();
    mapObj.map.pm.setGlobalOptions({
        snappable: false,
        layerGroup: mapObj.editorLayerGroup
    });
    mapObj.map.locate({setView: false, maxZoom: 16});
    function onLocationFound(e) {
        var radius = e.accuracy;
        L.marker(e.latlng).addTo(mapObj.map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();

        L.circle(e.latlng, radius).addTo(mapObj.map);
    }
    mapObj.map.on('locationfound', onLocationFound);

	/* add the export control */
    L.Control.ExportControl = L.Control.extend({
        onAdd: function(map) {
            let controldiv = L.DomUtil.create( 'div', 'export-controls' );
            /* export button */
            let exportbutton = L.DomUtil.create( 'button', 'export__button', controldiv  );
            exportbutton.setAttribute( 'id', 'exportbutton' );
            exportbutton.textContent = "Export";
            /* save button */
            let savebutton = L.DomUtil.create( 'button', 'export__button', controldiv  );
            savebutton.setAttribute( 'id', 'savebutton' );
            savebutton.textContent = "Save";
            /* locate button */
            let locatebutton = L.DomUtil.create( 'button', 'export__button', controldiv  );
            locatebutton.setAttribute( 'id', 'locatebutton' );
            locatebutton.textContent = "Locate";
            return controldiv;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    L.control.exportcontrol = function(opts) {
        return new L.Control.ExportControl(opts);
    }
    L.control.exportcontrol({ position: 'topright' }).addTo(mapObj.map);

    /* dialog */
    const dialog = new A11yDialog( document.getElementById('ge-dialog'));
    L.DomEvent.on( L.DomUtil.get('ge-dialog-close'), 'click', function() {
        dialog.close();
    }); 

     
    /* Listen for exports */
    L.DomEvent.on( L.DomUtil.get('exportbutton'), 'click', function() {
        let title = document.getElementById('ge-dialog-title');
        title.textContent = "Export GeoJSON";
        let content = document.getElementById('ge-dialog-content');
        content.textContent = JSON.stringify(mapObj.map.pm.getGeomanLayers(true).toGeoJSON(), null, 4);
        dialog.show();
    });
    L.DomEvent.on( L.DomUtil.get('savebutton'), 'click', function() {
        let title = document.getElementById('ge-dialog-title');
        title.textContent = "Save GeoJSON";
        let content = document.getElementById('ge-dialog-content');
        content.textContent = "savey savey savey";
        dialog.show();
    });
    L.DomEvent.on( L.DomUtil.get('locatebutton'), 'click', function() {
        console.log('click');
        mapObj.map.locate({setView: true, maxZoom: 16});
    });
    mapObj.map.on('locationfound', onLocationFound);
    mapObj.map.on('locationerror', onLocationError);

    // add layers control
    baseMaps = {
        "OpenStreetMap": mapObj.osm,
        "OpenTopoMap": mapObj.OpenTopoMap,
        "Esri WorldImagery": mapObj.Esri_WorldImagery,
        "Stadia Alidade Satellite": mapObj.Stadia_AlidadeSatellite
    };
    overlayMaps = {
        "Survey": mapObj.survey,
        "Editor layer": mapObj.editorLayerGroup
    };
    var layerControl = L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(mapObj.map);

    mapObj.mapLoaded = true;
    document.dispatchEvent( new Event( 'maploaded' ) );
}
function onLocationFound(e) {
    var radius = e.accuracy;
    L.marker(e.latlng).addTo(mapObj.map)
        .bindPopup("You are within " + radius + " meters of this point").openPopup();

    L.circle(e.latlng, radius).addTo(mapObj.map);
}
function onLocationError(e) {
    alert(e.message);
}
