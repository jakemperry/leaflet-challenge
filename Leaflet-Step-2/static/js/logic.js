// Set up a variable to store the USGS geojson query url
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// Set up a variable to store the path to the tectonic plate boundary geojson
var plateURL = "static/data/PB2002_boundaries.json";

// Declare a variable for quakes as a leaflet layer group
var USGSQuakes = L.layerGroup();

// NESTED PROMISES

// Set up a promise for tectonic plate data
d3.json(plateURL).then(function(data1) {
  
  // Set up function to create the map, complete with base maps, overlays, control, and legend
  function CreateMap(USGSQuakes, plates){

    // Set up street map basemap
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    // Set up dark map basemap
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });
  
    // Set up satellite map basemap
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "satellite-v9",
      accessToken: API_KEY
    });
  
    // Create the map.  Centered just a bit north of the equator (not as much land mass in southern hemisphere)
    var myMap= L.map("map", {
      center: [
        20, 0
      ],
      zoom: 3,
      layers: [satellite, USGSQuakes, plates]
    });
  
    // Create a JSON of the basemaps
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap,
      "Satellite Map": satellite
    };
  
    // Create a JSON of the overlay maps
    var overlayMaps = {
      "Earthquakes": USGSQuakes,
      "Tectonic Plates": plates
    };
  
    // Add a control to toggle basemaps and overlay maps
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

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
  
  };

  // Set up a promise for the USGS earthquake data
  d3.json(queryUrl).then(function(data2) {

    console.log("USGS Earthquake Data")
    console.log(data2.features)

    // Create an EQData varaible to hold the geojson data
    var EQData = data2.features;
    
    // Make a for loop to create circles for every feature in the USGS geojson
    for (var i = 0; i < EQData.length; i++) {
  
      // Create a variable that allows longitudes to be reassigned.  Step 1 logic.js file centers the 
      // map around the Pacific Ocean "Ring of Fire" for earthquakes.  Adding the tectonic plates 
      // adds the challenge of trying to center the plates around the pacific, instead of around 0,0.
      // The offset is now 0 to avoid shifting the earthquake data away from the tectonic plate geojson
      var longitude;

      if (EQData[i].geometry.coordinates[0] < 0) {
        longitude= EQData[i].geometry.coordinates[0]+0;
      } else {
        longitude = EQData[i].geometry.coordinates[0];
      }
  
      // Create a color variable
      var color = "";

      // Assign the color of the circle based on the depth of the earthquake
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
        ).addTo(USGSQuakes);  // After adding popup data, add the circle with popup to the USGSQuakes group
    };
    // return the quakes for use in the 1st promise
    return USGSQuakes
  });

  console.log('Tectonic Plate Data');
  console.log(data1.features)

  // Create a variable to hold the tectonic plate data
  var plateData = data1.features

  // Create a variable to hold the plate geojson with formatting
  var plates = L.geoJSON(plateData,{
    style: function (geoJsonFeature) {
      return {color: 'orange'}
    }
  });

  // Run the CreateMap function, passing in USGSQuakes and plates so they'll be added to the map and layer control
  CreateMap(USGSQuakes,plates)
});