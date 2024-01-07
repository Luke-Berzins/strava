var map = L.map('map').setView([runs[0][0].latitude, runs[0][0].longitude], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var colors = ['blue', 'green', 'red', 'purple', 'orange']; // Different colors for each run
var isDrawing = false;
var delay;
var shouldZoom = true; // Flag for whether to zoom to each run
var currentRunIndex = 0


function drawLineSegment(line, startPoint, endPoint, numSteps, stepDuration, onCompleted) {
    let currentStep = 0;
    let latDiff = (endPoint.lat - startPoint.lat) / numSteps;
    let lngDiff = (endPoint.lng - startPoint.lng) / numSteps;

    let lineSegmentInterval = setInterval(() => {
        if (currentStep < numSteps) {
            // Create the next point along the line
            let nextPoint = new L.LatLng(
                startPoint.lat + latDiff * currentStep,
                startPoint.lng + lngDiff * currentStep
            );
            line.addLatLng(nextPoint);
            currentStep++;
        } else {
            // Clear the interval and call the completion callback if provided
            clearInterval(lineSegmentInterval);
            if (typeof onCompleted === 'function') onCompleted();
        }
    }, stepDuration);
}
function drawRun(runIndex, pointIndex, line) {
    if (runIndex < runs.length && isDrawing) {
        var run = runs[runIndex];

        // When starting a new run, update the date display with its start time
        if (pointIndex === 0) {
            updateDateDisplay(run[0].time);
            // If shouldZoom is true, zoom to the first point of the run
            if (shouldZoom) {
                map.setView(new L.LatLng(run[0].latitude, run[0].longitude), parseInt(document.getElementById('run-zoom-input').value));
            }
            // Initialize a new polyline for the run
            line = L.polyline([], {
                color: colors[runIndex % colors.length],
                weight: 4,
                opacity: 0.6,
                smoothFactor: 5
            }).addTo(map);
        }

        // Draw each point in the run
        if (pointIndex < run.length) {
            let currentPoint = run[pointIndex];
            line.addLatLng(new L.LatLng(currentPoint.latitude, currentPoint.longitude));

            var currentDelay = parseInt(document.getElementById('delay-input').value);
            if (isNaN(currentDelay) || currentDelay < 0) {
                currentDelay = 60; // Default value if input is invalid
            }

            // Schedule the next point to be drawn using the current delay
            setTimeout(function() {
                drawRun(runIndex, pointIndex + 1, line);
            }, currentDelay);
        } else {
            // After the last point, schedule the next run
            setTimeout(function() {
                currentRunIndex = runIndex + 1
                drawRun(runIndex + 1, 0, null);
            }, currentDelay);
        }
    }
}


function updateDateDisplay(isoDateString) {
    var lastPointTime = new Date(isoDateString);
    var formattedDate = lastPointTime.getDate() + ' ' 
                        + lastPointTime.toLocaleString('default', { month: 'long' }) + ' ' 
                        + lastPointTime.getFullYear();
    document.getElementById('date-display').textContent = formattedDate;
}

// Call this function with the first run and the first point to start the animation
drawRun(currentRunIndex, 0, null);


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
    drawRun(currentRunIndex, 0, null)
}

function stopDrawing() {
    isDrawing = false;
}