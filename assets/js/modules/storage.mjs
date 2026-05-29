import { Marker, Util, DivIcon, Control, Circle, DomEvent, LayerGroup } from 'leaflet';
import { createElement } from './utilities.mjs';
import A11yDialog from 'a11y-dialog';
import { mapObj } from './config.mjs';

/* add the export control */
export const StorageControl = Control.extend({
    options: {
        /** Position of the control */
        position: "topright",
        saveCallback: function() {
            console.log('save');
            return "save";
        },
        exportCallback: function() {
            console.log('export');
            return "export";
        },
        loadCallback: function() {
            console.log('load');
            return "load";
        }
    },
    initialize(options = {}) {
        // Merge user-provided options
        for (const key in options) {
            const userVal = options[key];
            const defaultVal = this.options[key];
            if (userVal?.constructor === Object && defaultVal?.constructor === Object) {
                Object.assign(defaultVal, userVal);
            } else {
                this.options[key] = userVal;
            }
        }
    },
    onAdd: function(map) {
        const container = createElement( 'div', 'export-controls' );
        /* save button */
        this._savebutton = createElement( 'button', 'export__button', container  );
        this._savebutton.setAttribute( 'id', 'savebutton' );
        this._savebutton.textContent = "Save";
        /* export button */
        this._exportbutton = createElement( 'button', 'export__button', container  );
        this._exportbutton.setAttribute( 'id', 'exportbutton' );
        this._exportbutton.textContent = "Export";
        /* load button */
        this._loadbutton = createElement( 'button', 'export__button', container  );
        this._loadbutton.setAttribute( 'id', 'loadbutton' );
        this._loadbutton.textContent = "Load";

        
        /* Listen for exports */
        this._exportbutton.addEventListener( 'click', function() {
            let title = document.getElementById('ge-dialog-title');
            title.textContent = "Export GeoJSON";
            let content = document.getElementById('ge-dialog-content');
            content.innerHTML = '<pre>exportey exportey exportey</pre>';
            this.options.exportCallback();
            this._dialog = new A11yDialog( document.getElementById('ge-dialog'));
            this._dialog.show();
        });

        /* listen for saves */
        this._savebutton.addEventListener( 'click', function() {
            let title = document.getElementById('ge-dialog-title');
            title.textContent = "Save GeoJSON";
            let content = document.getElementById('ge-dialog-content');
            content.textContent = "savey savey savey";
            this.options.saveCallback();
            this._dialog = new A11yDialog( document.getElementById('ge-dialog'));
            this._dialog.show();
        });

        /* listen for loads */
        this._loadbutton.addEventListener( 'click', function() {
            let title = document.getElementById('ge-dialog-title');
            title.textContent = "Load GeoJSON";
            let content = document.getElementById('ge-dialog-content');
            content.textContent = "loady loady loady";
            this.options.loadCallback();
            this._dialog = new A11yDialog( document.getElementById('ge-dialog'));
            this._dialog.show();
        });

        return container;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});



    

