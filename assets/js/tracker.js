import { initMap } from './modules/utilities.mjs';
import { initTracker } from './modules/tracker.mjs';
/**
 * Initialise the map
 */
document.addEventListener( 'DOMContentLoaded', () => {
    document.addEventListener( 'maploaded', () => {
        initTracker();
    });
    initMap();
});