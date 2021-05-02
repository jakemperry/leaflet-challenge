// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

var myMap = L.map("map", {
  center: [
    20, 180
  ],
  zoom: 3,
  layers: [streetmap]
});

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data.features)
  var EQData = data.features;

  for (var i = 0; i < EQData.length; i++) {

    var longitude;
    if (EQData[i].geometry.coordinates[0] < 0) {
      longitude= EQData[i].geometry.coordinates[0]+360;
    } else {
      longitude = EQData[i].geometry.coordinates[0];
    }

    var color = "";
    if (EQData[i].geometry.coordinates[2] < 10) {
      color = "#1a9850";
    }
    else if (EQData[i].geometry.coordinates[2] < 30) {
      color = "#91cf60";
    }
    else if (EQData[i].geometry.coordinates[2] < 50) {
      color = "#d9ef8b";
    }
    else if (EQData[i].geometry.coordinates[2] < 70) {
      color = "#fee08b";
    }
    else if (EQData[i].geometry.coordinates[2] < 90) {
      color = "#fc8d59";
    }
    else {
      color = "#d73027";
    }

    L.circle([EQData[i].geometry.coordinates[1],longitude],
      {radius: ((EQData[i].properties.mag)**2) * Math.cos((Math.PI/180)* EQData[i].geometry.coordinates[1]) * 5000,
      color: "#000000",
      weight: 1, 
      fill: true,
      fillColor: color,
      fillOpacity: 0.7}
      
      ).bindPopup(
        "<h1>" + EQData[i].properties.title+"</h1> <hr> <h3>Date: " + new Date(EQData[i].properties.time) + "<br> Depth: "+ EQData[i].geometry.coordinates[2]+" km</h3>"
      ).addTo(myMap)

  }
});

// Set up the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = [10,30,50,70,90,1000];
  var colors = ["#1a9850","#91cf60","#d9ef8b","#fee08b","#fc8d59","#d73027"];
  var labels = ["<10 km", "10 to 30 km", "30 to 50 km", "50 to 70 km", "70 to 90 km",">90 km"];

  // Add min & max
  var legendInfo = "<h3>Earthquake Depth</h3>" //+
    // "<div class=\"labels\">" +
    //   "<div class=\"min\">" + limits[0] + "</div>" +
    //   "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
    // "</div>";

  div.innerHTML = legendInfo;

  limits.forEach(function(limit, index) {
    labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
  });

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};

// Adding legend to the map
legend.addTo(myMap);


// function createMap(earthquakes) {

//   // Define streetmap and darkmap layers


//   var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "dark-v10",
//     accessToken: API_KEY
//   });

//   // Define a baseMaps object to hold our base layers
//   var baseMaps = {
//     "Street Map": streetmap,
//     "Dark Map": darkmap
//   };

//   // Create overlay object to hold our overlay layer
//   var overlayMaps = {
//     Earthquakes: earthquakes
//   };

//   // Create our map, giving it the streetmap and earthquakes layers to display on load


//   // Create a layer control
//   // Pass in our baseMaps and overlayMaps
//   // Add the layer control to the map
//   L.control.layers(baseMaps, overlayMaps, {
//     collapsed: false
//   }).addTo(myMap);

// }

// function createFeatures(earthquakeData) {

//   // Define a function we want to run once for each feature in the features array
//   // Give each feature a popup describing the place and time of the earthquake
//   // function onEachFeature(feature, layer) {
//   //   layer.bindPopup("<h3>" + feature.properties.place +
//   //     "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
//   // }

//   // Create a GeoJSON layer containing the features array on the earthquakeData object
//   // Run the onEachFeature function once for each piece of data in the array
//   var earthquakes = L.geoJSON(earthquakeData);

//   // Sending our earthquakes layer to the createMap function
//   createMap(earthquakes);
// }