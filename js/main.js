/* J Carney, 2018 */

// initialize after page ready
$(document).ready(initialize);

// starting point for script
function initialize() {
    // for testing, to load alternate scripts
    //getExternal();
    
    // main create returns a map
    mapSizer(myMap());
};

// main flow to create map
function myMap() {
    // make map
    let map = L.map('map').setView([65.3129, -151.3130], 4);

    // add basemap tiles
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiamhjYXJuZXkiLCJhIjoiY2pmbHE2ZTVlMDJnbTJybzdxNTNjaWsyMiJ9.hoiyrXTX3pOuEExAnhUtIQ'
    }).addTo(map);

    // store json response
    let jsonResponse;

    // async load xmlhttprequest object of json data type
    $.ajax("data/AlaskaFloodHistory.geojson", {
        dataType: "json",
        success: function(response){
            // handle data manipulation, list of fields with "d_" in name (# floods by decades)
            let arrayFloodsByDecadeFieldNames = processData(response);

            // pass response to function to make proportional symbols
            let geoJSONLayerGroup = createPropSymbols(response);

            geoJSONLayerGroup.addTo(map);

            // setup sequence by decade
            createSequenceControls(arrayFloodsByDecadeFieldNames, geoJSONLayerGroup);



            // store response
            jsonResponse = response;
            // reset map bounds to fit markers
            map.fitBounds(geoJSONLayerGroup.getBounds(), {padding: [2,2]});
        }
    });

    // make array of attributes (fields) with "d_" in the name (# floods by decades)
    function processData(data) {
        // make array
        let attributesArray = [];
        // get properties of feature 1
        let properties = data.features[0].properties;
        // populate array
        for (let field in properties) {
            // only get attributes with pop
            if (field.indexOf("d_") > -1) {
                attributesArray.push(field);
            };
        };
        console.log(attributesArray.toString());  //////////////////////// LOG ///////////////////////////////////////////////////////
        return attributesArray;
    }

    // sequence by decade controls
    function createSequenceControls (attributesArray, layerGroup) {
        // logic variables for only allowing one tool to be turned on at a time. page loads with both OFF
        let decadeToolStatus = 0;
        let filterToolStatus = 0;
        let decadeToggleCount = 0;
        let filterToggleCount = 0;

        // decade sequence slider
        let decadeSlider = $("#decadeSlider").bootstrapSlider({
            handle: "custom",
            tooltip: "hide",
            tooltip_split: false,
            step:10,
            min: 1900,
            max: 2019,
            formatter: function(value){
                return value[0] + " - " + value[1];
            },
            enabled: false
        });
        // decade slider buttons start disabled
        $("#nextDecade").prop("disabled",true);
        $("#lastDecade").prop("disabled",true);

        // store old val decade
        let oldValDecade = decadeSlider.bootstrapSlider('getValue');

        // store index number which maps to element in attributesArray
        let decadeIndex = 0;

        // range filter
        let rangeFilter = $("#rangeFilter").bootstrapSlider({
            tooltip: "hide",
            tooltip_split: true,
            formatter: function(value){
                return value;
            },
            enabled: false
        });

        // store old val filter and layer
        let oldValFilter = rangeFilter.bootstrapSlider('getValue');
        let filterLayer;

        // decade skip button listeners
        $("#nextDecade").click(function() {
            if (decadeToolStatus === 1) {
                // controls
                let val = decadeSlider.bootstrapSlider('getValue');
                if (val[0] === 2019 || val[1] === 2019) {
                    val = [2010, 2019];
                    decadeSlider.bootstrapSlider('setValue', val);
                    oldValDecade = val;
                } else {
                    val = [val[0] + 10, val[1] + 10];
                    decadeSlider.bootstrapSlider('setValue', val);
                    oldValDecade = val;
                }
                // get new index
                decadeIndex = getNewIndex(val);
                // call for map update
                sequencePropSymbolsByDecade(attributesArray[decadeIndex],layerGroup);
            } else {
                // nothing
            }
        });

        $("#lastDecade").click(function() {
            if (decadeToolStatus === 1) {
                // control
                let val = decadeSlider.bootstrapSlider('getValue');
                if (val[0] === 1900 || val[1] === 1900) {
                    val = [1900,1909];
                    decadeSlider.bootstrapSlider('setValue',val);
                    oldValDecade = val;
                } else {
                    val = [val[0]-10,val[1]-10];
                    decadeSlider.bootstrapSlider('setValue',val);
                    oldValDecade = val;
                }
                // get new index
                decadeIndex = getNewIndex(val);
                // call for map update
                sequencePropSymbolsByDecade(attributesArray[decadeIndex],layerGroup);
            } else {
                // nothing
            }
        });

        // decade slider click listener
        decadeSlider.on("slideStop", function(ev) {
            if (decadeToolStatus === 1) {
                // control
                let val = decadeSlider.bootstrapSlider('getValue');
                // forward in time
                if ((val[0] + val[1]) >= (oldValDecade[0] + oldValDecade[1])) {
                    let max = Math.max(val[0],val[1]);
                    if (max === 2019){max=2020}
                    val = [max-10,max-1];
                    decadeSlider.bootstrapSlider('setValue',val);
                    oldValDecade = val;
                // back in time
                } else {
                    let min = Math.min(val[0],val[1]);
                    val = [min,min+9];
                    decadeSlider.bootstrapSlider('setValue',val);
                    oldValDecade = val;
                }
                // get new index
                decadeIndex = getNewIndex(val);
                // call for map update
                sequencePropSymbolsByDecade(attributesArray[decadeIndex],layerGroup);
            }
        });

        // decade toggle
        $("#toggleDecadeSlider").on("click", function(ev){
            // turn on
            if ($("#toggleDecadeSlider[type=checkbox]").prop("checked")){
                decadeSlider.bootstrapSlider('setAttribute','enabled',true);
                decadeSlider.bootstrapSlider('setAttribute','tooltip','always');
                decadeSlider.bootstrapSlider('setValue',[1900,1909]); // reset value
                decadeSlider.bootstrapSlider('refresh');
                $("#nextDecade").prop("disabled",false);
                $("#lastDecade").prop("disabled",false);
                decadeToolStatus = 1;
                // turn off filter if needed
                if (filterToolStatus === 1) {
                    $("#toggleFilterSlider").click();
                }
                // on first run only
                if (decadeToggleCount === 0) {
                    sequencePropSymbolsByDecade(attributesArray[decadeIndex],layerGroup);
                    decadeToggleCount = decadeToggleCount +1;
                }
            // turn off
            } else {
                decadeSlider.bootstrapSlider('setAttribute','tooltip','hide');
                decadeSlider.bootstrapSlider('setValue',[1900,1909]); // reset value
                decadeSlider.bootstrapSlider('refresh');
                decadeSlider.bootstrapSlider('disable');
                $("#nextDecade").prop("disabled",true);
                $("#lastDecade").prop("disabled",true);
                decadeToolStatus = 0;
                decadeIndex = 0; // reset index
                decadeToggleCount = decadeToggleCount + 1;
                resetSymbols(layerGroup);
            }
        });

        // filter toggle
        $("#toggleFilterSlider").on("click", function(ev) {
            // turn on
            if ($("#toggleFilterSlider[type=checkbox]").prop("checked")){
                rangeFilter.bootstrapSlider('setAttribute','enabled',true);
                rangeFilter.bootstrapSlider('setAttribute','tooltip','always');
                rangeFilter.bootstrapSlider('setValue',[0,40]); // reset value
                rangeFilter.bootstrapSlider('refresh');
                filterToolStatus = 1;
                // turn off decade if needed
                if (decadeToolStatus === 1) {
                    $("#toggleDecadeSlider").click();
                }
                // on first run only
                if (filterToggleCount === 0) {
                    map.removeLayer(layerGroup);
                    filterLayer = filterByFloodCount(0,1000,layerGroup,filterLayer);
                    filterToggleCount = filterToggleCount +1;
                }
            } else {
                // turn off
                rangeFilter.bootstrapSlider('setAttribute','tooltip','hide');
                rangeFilter.bootstrapSlider('setValue',[0,40]); // reset value
                rangeFilter.bootstrapSlider('refresh');
                rangeFilter.bootstrapSlider('disable');
                filterToolStatus = 0;
                map.removeLayer(filterLayer);
                map.addLayer(layerGroup);
                resetSymbols(layerGroup);
            }
        });

        // filter slider click listener
        rangeFilter.on("slideStop", function(ev) {
            if (filterToolStatus === 1) {
                // control
                let val = rangeFilter.bootstrapSlider('getValue');
                oldValFilter = val;

                let lower = Math.min(val[0],val[1]);
                let upper = Math.max(val[0],val[1]);

                // call for map update
                map.removeLayer(layerGroup);
                map.removeLayer(filterLayer);
                filterLayer =  filterByFloodCount(lower,upper,layerGroup, filterLayer);
            } else {
                // nothing
            }
        });

        // convert year to decade index
        function getNewIndex(val) {
            let index;
            switch (val[1]) {
                case 1909:
                    index = 0;
                    break;
                case 1919:
                    index = 1;
                    break;
                case 1929:
                    index = 2;
                    break;
                case 1939:
                    index = 3;
                    break;
                case 1949:
                    index = 4;
                    break;
                case 1959:
                    index = 5;
                    break;
                case 1969:
                    index = 6;
                    break;
                case 1979:
                    index = 7;
                    break;
                case 1989:
                    index = 8;
                    break;
                case 1999:
                    index = 9;
                    break;
                case 2009:
                    index = 10;
                    break;
                case 2019:
                    index = 11;
                    break;
            }
            return index;
        }
    };

    // update symbols for decade sequencing
    function sequencePropSymbolsByDecade(attribute, layerGroup) {
        layerGroup.eachLayer(function (layer){
            // new radius
            let radius = calcPropRadius(layer.feature.properties[attribute]);
            layer.setRadius(radius);
            // make popup
            let popupContent = "<b>"+layer.feature.properties.city + "</b> showing " + "<b>" + layer.feature.properties[attribute] + "</b> floods.";
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius),
                closeButton: false
            });
        });
    };

    // update symbols for filtering  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function filterByFloodCount(lower, upper) {

        let filterLayer = L.geoJson(jsonResponse, {
            filter: function(feature, layer) {
                //
                let totFloods = feature.properties.tot_floods;
                //
                if (totFloods >= lower && totFloods <= upper) {
                    return true;
                } else {
                    return false;
                }
            },
            pointToLayer: function (feature, latlng) {
                return pointToLayer(feature, latlng);
            }
        }).addTo(map);

        return filterLayer;
    };

    // update symbols for default view
    function resetSymbols(layerGroup) {
        // get style for markers
        let geojsonMarkerOptions = defaultMarkerOptions();
        // on each feature
        layerGroup.eachLayer(function (layer){
            // new radius
            layer.setStyle(geojsonMarkerOptions);

            // new radius
            let radius = calcPropRadius(layer.feature.properties.tot_floods);
            layer.setRadius(radius);

            // make popup
            let popupContent = "<b>"+layer.feature.properties.city + "</b> showing " + "<b>" + layer.feature.properties.tot_floods + "</b> floods.";
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-geojsonMarkerOptions.radius),
                closeButton: false
            });
        });
    };

    // parent function to vectorize features
    function createPropSymbols(data){
        // iterate through all features in json
        let layerCircleMarkers = L.geoJson(data, {
            // for each feature, call function to vectorize it
            pointToLayer: function (feature, latlng) {
                return pointToLayer(feature, latlng);
            }
        });
        return layerCircleMarkers;
    };

    // marker styling and proportial symbols, this is called for each feature from createPropSymbols
    function pointToLayer(feature, latlng) {
        //make a style for markers
        let geojsonMarkerOptions = defaultMarkerOptions();
        // marker
        let marker = L.circleMarker(latlng, geojsonMarkerOptions);

        // new radius
        let radius = calcPropRadius(feature.properties.tot_floods);
        marker.setRadius(radius);

        // make popup
        let popupContent = "<b>"+feature.properties.city + "</b> showing " + "<b>" + feature.properties.tot_floods + "</b> floods.";
        marker.bindPopup(popupContent, {
            offset: new L.Point(0,-geojsonMarkerOptions.radius),
            closeButton: false
        });
        // add listeners for hover popup and info panel
        addListeners(marker);
        // return the marker to the caller to be added to map
        return marker;
    };

    // called on creation of each marker to add listeners to it
    function addListeners (marker){
        marker.on({
            mouseover: function(){
                this.openPopup()
            },
            mouseout: function(){
                this.closePopup();
            },
            click: function () {
                // populate the "Community Overview" info panel with desc of clicked marker
                // city name
                let city =
                    "<b>"+marker.feature.properties.city + "</b>" + "<i> (" + marker.feature.properties.pronunciation + ")</i>";
                $("#city").html(city);
                // watershed
                let shed =
                    "HUC12: <i>" + marker.feature.properties.watershed + "</i>";
                $("#shed").html(shed);
                // desc
                let desc =
                    "<p>" + marker.feature.properties.desc + "</p>";
                $("#desc").html(desc);
            }
        });
    };

    // called to calculate scaled marker radius for proportional symbols
    function calcPropRadius(attValue) {
        let scaleFactor = 50;
        let area = attValue * scaleFactor;
        return Math.sqrt(area / Math.PI);
    };

    // for circle markers
    function  defaultMarkerOptions() {
        let geojsonMarkerOptions = {
            radius: 6,
            fillColor: "#b8060b",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        };
        return geojsonMarkerOptions;
    }

    // return map object
    return map;
};

// get screen size per BS breaks
function mapSizer(map) {
    // window resize listener
    $(window).on("resize", function () {
        let result = $('#device-size-detector').find('div:visible').first().attr('id');
        // console.log(result); // for debugging
        // set map size depending on breakpoint
        if (result === "xs" || result === "sm" || result === "md") {
            console.log("50vh");
            $("#map").css({"height": "50vh"});
        } else {
            console.log("88vh");
            $("#map").css({"height": "85vh"});
        }
        map.invalidateSize();
    }).trigger("resize");
}

// load other JS files if needed
function getExternal() {
    $.getScript("js/geojson.js", function() {
        console.log("external script loaded");
    });
};


