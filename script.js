var map = L.map('map').setView([runs[0][0].latitude, runs[0][0].longitude], 13);

L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var colors = ['blue', 'green', 'red', 'purple', 'orange']; // Different colors for each run
var isDrawing = false;
var delay;
var shouldZoom = true; // Flag for whether to zoom to each run
var currentRunIndex = 0
let drawnLines = []; // Array to store references to drawn line segments
let timeoutIds = []; // Array to store timeout IDs
var cumulativeDistance = 0.0; // Global variable to hold the cumulative distance


document.getElementById('toggle-control-panel').addEventListener('click', function() {
    var controlPanel = document.getElementById('control-panel');
    var toggleButton = document.getElementById('toggle-control-panel');

    if (controlPanel.style.display === 'none') {
        controlPanel.style.display = 'block'; // Show the control panel
        toggleButton.textContent = 'Hide Controls'; // Update button text
    } else {
        controlPanel.style.display = 'none'; // Hide the control panel
        toggleButton.textContent = 'Show Controls'; // Update button text
    }
});


function drawRun(runIndex, pointIndex, line) {
    
    if (runIndex < runs.length && isDrawing) {
        var run = runs[runIndex];

        // When starting a new run, update the date display with its start time
        if (pointIndex === 0) {
            updateDateDisplay(run[0].time);
            // If shouldZoom is true, zoom to the first point of the run
            // if (shouldZoom) {
            //     map.setView(new L.LatLng(run[pointIndex].latitude, run[pointIndex].longitude), parseInt(document.getElementById('run-zoom-input').value) > 0 ? parseInt(document.getElementById('run-zoom-input').value) : 4);
            // }
            // Initialize a new polyline for the run
            line = L.polyline([], {
                color: colors[runIndex % colors.length],
                weight: 4,
                opacity: 0.6,
                smoothFactor: 1
            }).addTo(map);
            drawnLines[runIndex] = [];
            drawnLines[runIndex].push(line);      
        }

        // Draw each point in the run
        if (pointIndex < run.length) {
            let currentPoint = run[pointIndex];
            
            line.addLatLng(new L.LatLng(currentPoint.latitude, currentPoint.longitude));
            // Update the total distance display
            let totalDistance = currentPoint.distance; // Assuming 'distance' is in kilometers
            document.getElementById('total-distance-display').textContent = totalDistance.toFixed(2);

            if (pointIndex === run.length - 1) { // Check if it's the last point of the run
                cumulativeDistance += totalDistance; // Add to cumulative distance
                document.getElementById('cumulative-distance-display').textContent = cumulativeDistance.toFixed(1);
            }

            if (shouldZoom && pointIndex % 20 === 0) {
                map.setView(new L.LatLng(run[pointIndex].latitude, run[pointIndex].longitude), parseInt(document.getElementById('run-zoom-input').value) > 0 ? parseInt(document.getElementById('run-zoom-input').value) : 4);
            }
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
function goBack20Runs() {
    let runsToRemove = Math.min(20, currentRunIndex);

    if (runsToRemove > 0 || isDrawing) {
        isDrawing = false;

        // Wait for any ongoing drawing to stop
        setTimeout(function() {
            // Remove segments from the current (unfinished) run
            if (drawnLines[currentRunIndex]) {
                drawnLines[currentRunIndex].forEach(line => map.removeLayer(line));
                drawnLines[currentRunIndex] = [];
            }

            // Remove the last 20 (or fewer) completed runs
            for (let i = 0; i < runsToRemove; i++) {
                let runIndex = currentRunIndex - i - 1;
                let segments = drawnLines[runIndex];
                if (segments) {
                    segments.forEach(line => map.removeLayer(line));
                    drawnLines[runIndex] = []; // Clear the segments for this run
                }
            }

            // Update the current run index
            currentRunIndex -= runsToRemove;
            currentRunIndex = Math.max(0, currentRunIndex); // Ensure it doesn't go below 0

            // Restart drawing from the updated index
            if (isDrawing) {

                startDrawingFromIndex(currentRunIndex);
            }
        }, 100); // Adjust delay as needed

    }

    let newStartRun = runs[currentRunIndex];
    if (newStartRun && newStartRun.length > 0) {
        let startPoint = newStartRun[0];
        let totalDistance = startPoint.distance;
        document.getElementById('total-distance-display').textContent = totalDistance.toFixed(2);
    }
    cumulativeDistance = 0.0;
    for (let i = 0; i < currentRunIndex; i++) {
        if (runs[i].length > 0) {
            cumulativeDistance += runs[i][runs[i].length - 1].distance;
        }
    }

    document.getElementById('cumulative-distance-display').textContent = cumulativeDistance.toFixed(1);
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

function startDrawingFromIndex(startIndex) {
    isDrawing = true;
    drawRun(startIndex, 0, null);
}
