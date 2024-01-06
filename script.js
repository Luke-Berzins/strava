var map = L.map('map').setView([runs[0][0].latitude, runs[0][0].longitude], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var colors = ['blue', 'green', 'red', 'purple', 'orange']; // Different colors for each run
var isDrawing = false;
var delay;
var shouldZoom = true; // Flag for whether to zoom to each run

function drawRun(runIndex, pointIndex, line) {
if (runIndex < runs.length && isDrawing) {
var run = runs[runIndex];

// If we're at the first point of the run, set up the initial view and polyline
if (pointIndex === 0) {
    var initialLatLng = new L.LatLng(run[0].latitude, run[0].longitude);
    if (shouldZoom) {
        map.setView(initialLatLng, parseInt(document.getElementById('run-zoom-input').value));
    }
    // Create a new polyline
    line = L.polyline([initialLatLng], {
        color: colors[runIndex % colors.length],
        weight: 4,
        opacity: 0.6,
        smoothFactor: 1
    }).addTo(map);
}

if (pointIndex < run.length) {
    var point = run[pointIndex];
    var latlng = new L.LatLng(point.latitude, point.longitude);

    // Add the new point to the existing polyline
    line.addLatLng(latlng);

    // Schedule the next point to be drawn
    setTimeout(function() {
        drawRun(runIndex, pointIndex + 1, line);
    }, delay);
} else {
    // Current run is finished, update the date display and move to the next run
    var lastPointTime = new Date(run[run.length - 1].time);
    var formattedDate = lastPointTime.getDate() + ' ' 
                        + lastPointTime.toLocaleString('default', { month: 'long' }) + ' ' 
                        + lastPointTime.getFullYear();
    document.getElementById('date-display').innerText = 'Latest Date: ' + formattedDate;

    // Move to the next run after a delay
    setTimeout(function() {
        drawRun(runIndex + 1, 0, null);
    }, delay);
}
}
}

// To start drawing
drawRun(0, 0, null);

function toggleZoom() {
    shouldZoom = !shouldZoom;
    var zoomButton = document.getElementById('zoom-toggle');
    zoomButton.textContent = shouldZoom ? 'Disable Zoom' : 'Enable Zoom';
}

function startDrawing() {
delay = parseInt(document.getElementById('delay-input').value);

if (isNaN(delay) || delay <= 0) {
alert("Please enter a valid delay time in milliseconds.");
return;
}

isDrawing = true;
drawRun(0, 0, null);

}

function stopDrawing() {
isDrawing = false;
}