// Store API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

// A function to determine the marker size based on the earthquake magnitude 
function markerSize(magnitude) {
    return magnitude * 5;
  }

// A function to determine the color based on earthquake depth
function depthColor(depth) {
    if (depth < 10) return "#fcfcfc";
    else if (depth < 30) return "#7a98f0";
    else if (depth < 50) return "#9df5b1";
    else if (depth < 70) return "#eff549";
    else if (depth < 90) return "#f59c49";
    else return "#700303";
}

function createMap(earthquakes) {
    // Add the earthquakes layer to the map
    earthquakes.addTo(myMap);
}

function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(
          `<h3>${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`
        );
    }
    

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        let geoJsonMarkerOptions = {
            radius: markerSize(feature.properties.mag),
            fillColor: depthColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker(latlng, geoJsonMarkerOptions);
    }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

// Creating our initial map object:
let myMap = L.map("map", {
    center: [35.52, -102.67],
    zoom: 4
  });

// Adding a tile layer to our map:
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Adding a legend to the map
let legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend"),
        depths = [-10, 10, 30, 50, 70, 90],
        labels = [];
    
    // Set white background with some padding and a border
    div.style.backgroundColor = 'white';
    div.style.padding = '8px';
    div.style.border = '1px solid gray';

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        labels.push(
          '<i style="background:' + depthColor(depths[i]) + '; width: 18px; height: 18px; float: left; margin-right: 8px;"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+')
        );
    }

    div.innerHTML = labels.join('');
    return div;
};

legend.addTo(myMap);