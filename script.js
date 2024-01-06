var map = L.map('map').setView([runs[0][0].latitude, runs[0][0].longitude], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var colors = ['blue', 'green', 'red', 'purple', 'orange']; // Different colors for each run
var isDrawing = false;
var delay;
var shouldZoom = true; // Flag for whether to zoom to each run
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
        
        // Check if we're at the first point of the run
        if (pointIndex === 0) {
            // Create a new polyline
            line = L.polyline([], {
                color: colors[runIndex % colors.length],
                weight: 4,
                opacity: 0.6,
                smoothFactor: 1
            }).addTo(map);

            // If shouldZoom is true, set the map's view to the first point of the run
            if (shouldZoom) {
                map.setView(new L.LatLng(run[0].latitude, run[0].longitude), parseInt(document.getElementById('run-zoom-input').value));
            }
        }

        // If there are more points to draw, draw the next segment
        if (pointIndex < run.length - 1) {
            let startPoint = new L.LatLng(run[pointIndex].latitude, run[pointIndex].longitude);
            let endPoint = new L.LatLng(run[pointIndex + 1].latitude, run[pointIndex + 1].longitude);

            // Draw the segment to the next point
            drawLineSegment(line, startPoint, endPoint, 10, delay / 10, function() {
                // Proceed to the next segment
                drawRun(runIndex, pointIndex + 1, line);
            });
        } else {
            // All points in the current run have been drawn, move to the next run
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