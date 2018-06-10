// implemented as functions for easy testing when loading to main.js with jquery
geoJSON();

function geoJSON() {
    // make map
    var mymap = L.map('mapid').setView([39.75, -104.99], 2);
    // add basemap tiles
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiamhjYXJuZXkiLCJhIjoiY2pmbHE2ZTVlMDJnbTJybzdxNTNjaWsyMiJ9.hoiyrXTX3pOuEExAnhUtIQ'
    }).addTo(mymap);
    // get features from geoJSON file
    $.ajax("data/megacities.geojson", {
        dataType: "json",
        success: function(response){
            // make a style
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            // vectorize and style and add markers
            var FG = L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);

                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.City);
                }
            }).addTo(mymap);
            // reset map bounds to fit markers
            mymap.fitBounds(FG.getBounds(), {padding: [2,2]});
        }
    });
};

