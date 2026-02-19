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
