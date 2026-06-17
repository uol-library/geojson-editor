import { Marker, Util, DivIcon, Control, Circle, DomEvent, LayerGroup } from 'leaflet';
import { createElement } from './utilities.mjs';
import A11yDialog from 'a11y-dialog';
import { mapObj } from './config.mjs';

/* add the export control */
export class StorageControl extends Control{
    static {
        this.setDefaultOptions({
            position: "topright",
            prefix: 'storage-control',
            saveTitle: "Save data",
            loadTitle: "Load data",
            saveCallback: false,
            exportCallback: false,
            loadCallback: false
        })
    }

    onAdd(map) {
        const container = createElement( 'div', 'storage-controls' );
        /* save button */
        this._savebutton = createElement( 'button', 'storage__button', container  );
        this._savebutton.setAttribute( 'id', 'savebutton' );
        this._savebutton.textContent = "Save";
        /* load button */
        this._loadbutton = createElement( 'button', 'storage__button', container  );
        this._loadbutton.setAttribute( 'id', 'loadbutton' );
        this._loadbutton.textContent = "Load";
        var control = this;

        /* listen for saves */
        this._savebutton.addEventListener( 'click', function() {
            let title = document.getElementById('ge-dialog-title');
            title.textContent = control.options.saveTitle;;
            let content = document.getElementById('ge-dialog-content');
            content.innerHTML = '<p>Save to <input type="text" id="save-dialog-input" placeholder="Enter name..."> <button id="save-dialog-button">Save</button></p><p class="error" id="save-dialog-error"></p>';
            document.getElementById('save-dialog-button').addEventListener('click', function() {
                console.log("Save dialog button clicked");
                let input = document.getElementById('save-dialog-input');
                let error = document.getElementById('save-dialog-error');
                if ( input.value.trim() === '' ) {
                    error.textContent = "Please enter a name to save.";
                    return;
                } else {
                    let key = input.value.trim();
                    let existing = localStorage.getItem(control.options.prefix + '-' + key);
                    let result = { success: false, data: null, msg: '' };
                    if ( existing ) {
                        error.innerHTML = `Data with the name "${key}" already exists. Overwrite? <button id="overwrite-yes">Yes</button> <button id="overwrite-no">No</button>`;
                        document.getElementById('overwrite-yes').addEventListener('click', function() {
                            error.textContent = "";
                            // Here you would gather the content to save and call the save callback
                            if ( control.options.saveCallback ) {
                                result = control.options.saveCallback();
                            }
                            if (result.success) {
                                localStorage.setItem(control.options.prefix + '-' + key, JSON.stringify(result.data));
                                content.textContent = `Data "${key}" saved. ${result.msg}`;
                            } else {
                                content.textContent = `Data "${key}" not saved. ${result.msg}`;
                            }
                        });
                        document.getElementById('overwrite-no').addEventListener('click', function() {
                            input.value = '';
                            error.textContent = "Save cancelled. Please enter a new name.";
                        });
                    } else {
                        error.textContent = "";
                        // Here you would gather the content to save and call the save callback
                        if ( control.options.saveCallback ) {
                            result = control.options.saveCallback();
                        }
                        if (result.success) {
                            localStorage.setItem(control.options.prefix + '-' + key, JSON.stringify(result.data));
                            content.textContent = `Data "${key}" saved. ${result.msg}`;
                        } else {
                            content.textContent = `Data "${key}" not saved. ${result.msg}`;
                        }
                    }
                }
            });
            this._dialog = new A11yDialog( document.getElementById('ge-dialog'));
            this._dialog.show();
        });

        /* listen for loads */
        this._loadbutton.addEventListener( 'click', function() {
            let title = document.getElementById('ge-dialog-title');
            title.textContent = control.options.loadTitle;
            let content = document.getElementById('ge-dialog-content');
            let existing = localStorage.length > 0 ? Object.keys(localStorage).filter(key => key.startsWith(control.options.prefix + '-')).map(key => key.replace(control.options.prefix + '-', '')) : [];
            if ( existing.length === 0 ) {
                content.innerHTML = '<p>No saved data found.</p>';
            } else {
                content.innerHTML = '<p>Saved Data:</p><ul id="saved-data-list" class="saved-data-list"></ul>';
                let list = document.getElementById('saved-data-list');
                existing.forEach(key => {
                    let li = createElement('li', '', list);
                    let datalabel = createElement('span', 'saved-data-label', li);
                    datalabel.textContent = key;
                    let loadbutton = createElement('button', 'load-data-button', li);
                    loadbutton.textContent = 'Load';
                    loadbutton.addEventListener('click', function() {
                        let data = localStorage.getItem(control.options.prefix + '-' + key);
                        let result = { success: false, data: null, msg: '' };
                        if ( control.options.loadCallback ) {
                            result = control.options.loadCallback(JSON.parse(data));
                        }
                        if (result.success) {
                            content.textContent = `Data "${key}" loaded. ${result.msg}`;
                        } else {
                            content.textContent = `Data "${key}" not loaded. ${result.msg}`;
                        }
                    });
                    let copybutton = createElement('button', 'copy-data-button', li);
                    copybutton.textContent = 'Copy';
                    copybutton.addEventListener('click', function() {
                        let data = localStorage.getItem(control.options.prefix + '-' + key);
                        let result = { success: false, data: null, msg: '' };
                        if ( control.options.loadCallback ) {
                            result = control.options.loadCallback(JSON.parse(data));
                        }
                        if (result.success) {
                            navigator.clipboard.writeText(data).then(() => {
                                alert(`Data "${key}" copied to clipboard.`);
                            }).catch(err => {
                                alert('Failed to copy data to clipboard: ', err);
                            });
                        } else {
                            content.textContent = `Data "${key}" not copied. ${result.msg}`;
                        }
                    });
                    let deletebutton = createElement('button', 'delete-data-button', li);
                    deletebutton.textContent = 'Delete';
                    deletebutton.addEventListener('click', function() {
                        if ( confirm(`Are you sure you want to delete the saved data "${key}"?`) ) {
                            localStorage.removeItem(control.options.prefix + '-' + key);
                            list.removeChild(li);
                            if ( localStorage.length === 0 ) {
                                content.innerHTML = '<p>No saved data found.</p>';
                            }
                        }
                    });
                });
            }
            this._dialog = new A11yDialog( document.getElementById('ge-dialog'));
            this._dialog.show();
        });

        return container;
    }

    onRemove(map) {
        // Nothing to do here
    }
};



    

