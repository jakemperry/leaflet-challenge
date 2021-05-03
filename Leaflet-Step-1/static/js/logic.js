// Create a variable for the USGS earthquake data geojson
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// Create a streetmap layer for the basemap
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

// Create the map, add the streetmap
var myMap = L.map("map", {
  center: [
    20, 180  // Offset the map over the Pacific Ocean to show the "Ring of Fire"
  ],
  zoom: 3,
  layers: [streetmap]
});

// Get the data from the USGS url
d3.json(queryUrl).then(function(data) {
  
  console.log(data.features)

  // Create a variable to store the USGS geojson data
  var EQData = data.features;

  // Use a For loop to make a new circle for every earthquake in the dataset
  for (var i = 0; i < EQData.length; i++) {

    // Create a variable to offset the latitude of some locations to center the map over the Pacific Ocean.
    var longitude;
    if (EQData[i].geometry.coordinates[0] < 0) {
      longitude= EQData[i].geometry.coordinates[0]+360;
    } else {
      longitude = EQData[i].geometry.coordinates[0];
    }

    // Create a color vairable that changes depending on the depth of the earthquake
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

    // Make a circle with the earthquake coords as the center
    L.circle([EQData[i].geometry.coordinates[1],longitude],

      // Set the radius as the square of the magnitude, times the cosine of the latitude, times 5000m
      {radius: ((EQData[i].properties.mag)**2) * Math.cos((Math.PI/180)* EQData[i].geometry.coordinates[1]) * 5000,
      color: "#000000", // Make the outside stroke black
      weight: 1, // Give the outside stroke a weight of 1
      fill: true, // Assign a fill to the circle
      fillColor: color, // The fill color is the one based on the depth
      fillOpacity: 0.7} // Create some transparency on the cirlces, so you can see cities through them
      ).bindPopup(
        "<h1>" + EQData[i].properties.title+"</h1> <hr> <h3>Date: " + new Date(EQData[i].properties.time) + "<br> Depth: "+ EQData[i].geometry.coordinates[2]+" km</h3>"
      ).addTo(myMap)

  }
});

// Create a legend to show the depths of the earthquakes
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {

  // Add a div for the legend in index.html
  var div = L.DomUtil.create("div", "info legend");

  // Set limits for the depths
  var limits = [10,30,50,70,90,1000];

  // Set colors for depths.  Greener = more shallow, redder  = deeper.
  var colors = ["#1a9850","#91cf60","#d9ef8b","#fee08b","#fc8d59","#d73027"];

  // Create a labels variable
  var labels=[];

  // Create intervals array
  var intervals = ["<10", "10 to 30", "30 to 50", "50 to 70", "70 to 90",">90"];

  // Add legendInfo varaible
  var legendInfo = "<h3>Depth (km)</h3>" //+
    "<div class=\"labels\">" +
    "</div>";

  // Add the legendInfo html into the legend div
  div.innerHTML = legendInfo;

  // For each limit, make a new label that is a new html paragraph with the 
  // interval color as the background color
  limits.forEach(function(limit, index) {
    labels.push("<p style=\"line-height:1.5; margin:0; background-color: " + colors[index] +"\">"+ intervals[index]+"</p>");
  });

  // Add the new labels html to the legend div
  div.innerHTML += "<div>" + labels.join("") + "</div>";
  return div;
};

// Add the legend to the map
legend.addTo(myMap);
