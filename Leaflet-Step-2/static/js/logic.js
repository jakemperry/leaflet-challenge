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
    20, 0
  ],
  zoom: 3,
  layers: [streetmap]
});

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log("USGS Earthquake Data")
  console.log(data.features)
  var EQData = data.features;
  var USGSQuakes = L.layerGroup();

  for (var i = 0; i < EQData.length; i++) {

    var longitude;
    if (EQData[i].geometry.coordinates[0] < 0) {
      longitude= EQData[i].geometry.coordinates[0]+0;
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
      ).addTo(USGSQuakes)

  }
  USGSQuakes.addTo(myMap)
});

// Set up the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = [10,30,50,70,90,1000];
  var colors = ["#1a9850","#91cf60","#d9ef8b","#fee08b","#fc8d59","#d73027"];
  var labels=[];
  var intervals = ["<10", "10 to 30", "30 to 50", "50 to 70", "70 to 90",">90"];

  // Add min & max
  var legendInfo = "<h3>Depth (km)</h3>" //+
    "<div class=\"labels\">" +
    "</div>";

  div.innerHTML = legendInfo;

  limits.forEach(function(limit, index) {
    labels.push("<p style=\"line-height:1.5; margin:0; background-color: " + colors[index] +"\">"+ intervals[index]+"</p>");
  });

  div.innerHTML += "<div>" + labels.join("") + "</div>";
  return div;
};

// Adding legend to the map
legend.addTo(myMap);

var plateURL = "static/data/PB2002_boundaries.json"

d3.json(plateURL).then(function(data) {
  console.log('Tectonic Plate Data');
  console.log(data.features)

  var plateData = data.features

  var plates = L.geoJSON(plateData,{
    style: function (geoJsonFeature) {
      
      return {color: 'orange'}
  }}).addTo(myMap)
})