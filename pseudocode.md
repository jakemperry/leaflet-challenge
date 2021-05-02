# PseudoCode: Outline for tasks

Level 1: Basic Visualization

1. Get Dataset
   > Pick a dataset to visualize from the USGS GeoJSON Feed page
2. Import and Visualize the Data
   - Data markers should reflect the magnitude of the earthquake by their size and depth of the earthquake by color.  Earthquakes with higher magnitudes should appear larger and earthquakes with greater depth should appear darker in color
    >Depth is the third coordinate in the earthquake location.  Activity 17-1-10, GeoJSON
    - Include popups that provide additional information about the earthquake when a marker is clicked
    > Activity 17-3-1 Citibike 
    - Create a legend that will provide context for your map data.
    > Activity 17-2-4 Money Choropleth
    - Your visualization should look something like the map on GitLab.

Level 2: More Data (optional)

1. Plot a second data set on our map
   > Add tectonic plates GeoJSON
2. Add a number of base maps to choose fro as well as separaate out our two different data sets into overlays that can be turned on and off independently.
   >Mapbox standard tile layers [here](https://docs.mapbox.com/api/maps/styles/#mapbox-styles)
3. Add layer controls to our map
   > Activity 17-3-1 Citibike

Host on GitHub Pages