// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  //console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  //Create a GeoJSON layer containing the features array on the earthquakeData object
  //Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      {radius: returnRadius(feature.properties.mag),
      fillColor: returnColor(feature.properties.mag),
      fillOpacity: .6,
      color: "#000",
      stroke: true,
      weight: .8
      })
    }

 });

 // Perform a GET request to the Tectonic  URL
d3.json(tectonicUrl, function(tectonicdata) {
  console.log(tectonicdata);
  // Once we get a response, create a group for tectonicdata.features
  var tectonicFeatures = tectonicdata.features

        // create a layer group 
        var tectonicPlates = new L.LayerGroup();

        var tectonicLines = L.geoJson(tectonicFeatures,{
          color: "blue",
          fillOpacity: 0,
          weight: 1
        }).addTo(tectonicPlates);
  
        createMap(earthquakes, tectonicLines);
});

  // Sending our earthquakes and faultlines layer to the createMap function
  // createMap(earthquakes, faultlines);
}

function createMap(earthquakes, tectonicPlates) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYW51anBhbmR5YSIsImEiOiJjamh2NGE5YzcwdmtkM3ZzZHlpdG44eG5zIn0.BT5eVZ--H1Brz8O2_bgx3g");

  // var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
  //   "access_token=pk.pk.eyJ1IjoiYW51anBhbmR5YSIsImEiOiJjamh2NGE5YzcwdmtkM3ZzZHlpdG44eG5zIn0.BT5eVZ--H1Brz8O2_bgx3g");

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?"+
  "access_token=pk.eyJ1IjoiYW51anBhbmR5YSIsImEiOiJjamh2NGE5YzcwdmtkM3ZzZHlpdG44eG5zIn0.BT5eVZ--H1Brz8O2_bgx3g");

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYW51anBhbmR5YSIsImEiOiJjamh2NGE5YzcwdmtkM3ZzZHlpdG44eG5zIn0.BT5eVZ--H1Brz8O2_bgx3g");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoors": streetmap,
    "Gray Scale": graymap,
    "Satellite": satellitemap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.62, -122.38, //San Francisco, CA
    ],
    zoom: 4,
    layers: [streetmap, earthquakes, graymap, satellitemap]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //LEGEND
  // var legend = L.control({position: 'bottomleft'})

  //      legend.onAdd = function(myMap){
  //       var div = L.DomUtil.create('div', 'info legend'),
  //           grades = [0, 1, 2, 3, 4, 5],
  //           labels = [];

  //       for (var i = 0; i < grades.length -1 ; i++){
  //           div.innerHTML += grades[i] + '-' + grades[i+1] + '<br>';
  //       }
  //       div.innerHTML += "5+ "
  //       return div;
  //   };
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1,2,3,4,5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + returnColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
 
  //END LEGEND
};

function returnColor(magnitude) {
  return magnitude > 5 ? "red":
         magnitude > 4 ? "orange":
         magnitude > 3 ? "gold":
         magnitude > 2 ? "yellow":
         magnitude > 1 ? "yellowgreen":
                         "greenyellow"; // <= 1 default
};
// function returnColor(magnitude){
//   if ( magnitude >=5 ) {
//     return "ff0000" ;//red 
//     }  
//     else if ( magnitude >=4) {
//       return "#FFA500"; //orange
//     }
//     else if ( magnitude >=3) {
//         return "#FFC200"; //amber
//     }
//     else if ( magnitude >=2) {
//       return "#F0E68C"; //khaki
//     } else {
//       return "#00ff00 "; //green
//     }
// }
      
function returnRadius(magnitude) {
  return magnitude*28000;
}
