// implemented as functions for easy testing when loading to main.js with jquery

geoJSON();
makeMap();

function geoJSON() {
    // make map
    var mymap = L.map('mapid').setView([39.75, -104.99], 13);
    // add basemap tiles
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiamhjYXJuZXkiLCJhIjoiY2pmbHE2ZTVlMDJnbTJybzdxNTNjaWsyMiJ9.hoiyrXTX3pOuEExAnhUtIQ'
    }).addTo(mymap);
    // make empty GeoJSON layer
    var myLayer = L.geoJSON().addTo(mymap);
    // make single feature
    var geojsonFeature = {
        "type": "Feature",
        "properties": {
            "name": "Coors Field",
            "amenity": "Baseball Stadium",
            "popupContent": "This is where the Rockies play!"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-104.99404, 39.75621]
        }
    };
    // make array of features
    var myLines = [{
        "type": "LineString",
        "coordinates": [[-104.99, 39.74], [-104.98, 39.75], [-104.97, 39.76]]
    }, {
        "type": "LineString",
        "coordinates": [[-105, 39.76], [-105, 39.77]]
    }];
    // add features layer
    myLayer.addData(geojsonFeature);
    myLayer.addData(myLines);

    // define states features
    var states = [{
        "type": "Feature",
        "properties": {"party": "Republican"},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-104.05, 48.99],
                [-97.22,  48.98],
                [-96.58,  45.94],
                [-104.03, 45.94],
                [-104.05, 48.99]
            ]]
        }
    }, {
        "type": "Feature",
        "properties": {"party": "Democrat"},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-109.05, 41.00],
                [-102.06, 40.99],
                [-102.03, 36.99],
                [-109.04, 36.99],
                [-109.05, 41.00]
            ]]
        }
    }];
    // style based on property and add to map
    L.geoJSON(states, {
        style: function(feature) {
            switch (feature.properties.party) {
                case 'Republican': return {color: "#ff0000"};
                case 'Democrat':   return {color: "#0000ff"};
            }
        }
    }).addTo(mymap);

    // make a style
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    // convert to vector layer
    L.geoJSON(geojsonFeature, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(mymap);

    // check if feature has popup content
    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }
    // set popup & add to map
    L.geoJSON(geojsonFeature, {
        onEachFeature: onEachFeature
    }).addTo(mymap);

};

function makeMap() {
    // make map
    var mymap = L.map('mapid').setView([37.68, -121.76], 13);
    // add basemap tiles
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiamhjYXJuZXkiLCJhIjoiY2pmbHE2ZTVlMDJnbTJybzdxNTNjaWsyMiJ9.hoiyrXTX3pOuEExAnhUtIQ'
    }).addTo(mymap);
    // make & add marker
    var marker = L.marker([37.68, -121.76]).addTo(mymap);
    // make & add circle
    var circle = L.circle([37.68, -121.79], 500, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(mymap);
    // make & add triangle
    var polygon = L.polygon([
        [37.69, -121.72],
        [37.68, -121.74],
        [37.67, -121.71]
    ]).addTo(mymap);
    // add popups to features directly
    marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
    circle.bindPopup("I am a circle.");
    polygon.bindPopup("I am a polygon.");
    // add popup without feature
    var popup = L.popup()
        .setLatLng([37.68, -121.785])
        .setContent("I am a standalone popup.")
        .openOn(mymap);
    // add popup on click
    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(mymap);
    }
    // click listener
    mymap.on('click', onMapClick);
};
