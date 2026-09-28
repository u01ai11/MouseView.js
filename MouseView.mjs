// MouseView.mjs
// ES module entry point. MouseView.js still sets window.mouseview for plain <script> users.

import './MouseView.js';

const mouseview = window.mouseview;

if (!mouseview.params.fallbackUrl) {
    mouseview.params.fallbackUrl = new URL('./MouseView-fallback.js', import.meta.url).href;
}

export default mouseview;

export const {
    init,
    removeAll,
    startTracking,
    stopTracking,
    pauseUpdating,
    resumeUpdating,
    hide,
    show,
    logEvent,
    storeData,
    getData,
    clearData,
    plotHeatMap,
    clearHeatMap,
    updateOverlayCanvas,
    checkSupport,
    requestTiltPermission,
    params,
    datalogger,
    timing,
} = mouseview;
