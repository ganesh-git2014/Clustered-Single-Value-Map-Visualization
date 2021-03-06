define([
            'jquery',
            'underscore',
            'leaflet',
            'togeojson',
            'jszip',
            'jszip-utils',
            'vizapi/SplunkVisualizationBase',
            'vizapi/SplunkVisualizationUtils',
            'drmonty-leaflet-awesome-markers',
            '../contrib/leaflet.markercluster-src',
            '../contrib/leaflet.featuregroup.subgroup-src',
            '../contrib/leaflet-measure'
        ],
        function(
            $,
            _,
            L,
            toGeoJSON,
            JSZip,
            JSZipUtils,
            SplunkVisualizationBase,
            SplunkVisualizationUtils
        ) {


    return SplunkVisualizationBase.extend({
        maxResults: 0,
        tileLayer: null,
        contribUri: '/en-US/static/app/leaflet_maps_app/visualizations/leaflet_maps/contrib/',
        defaultConfig:  {
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.cluster': 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.allPopups': 0,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.multiplePopups': 0,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.animate': 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.singleMarkerMode': 0,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.maxClusterRadius': 80,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.maxSpiderfySize': 100,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.spiderfyDistanceMultiplier': 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapTile': 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapTileOverride': "",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapAttributionOverride': "",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.layerControl' : 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.layerControlCollapsed': 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.scrollWheelZoom': 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.fullScreen': 0,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.defaultHeight': 600,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapCenterZoom': 6,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapCenterLat': 39.50,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapCenterLon': -98.35,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.minZoom': 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.maxZoom': 19,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.kmlOverlay' : "",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeOneBgColor': "#B5E28C",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeOneFgColor': "#6ECC39",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.warningThreshold': 55,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeTwoBgColor': "#F1D357",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeTwoFgColor': "#F0C20C",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.criticalThreshold': 80,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeThreeBgColor': "#FD9C73",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeThreeFgColor': "#F18017",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureTool': 1,
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureIconPosition': "topright",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measurePrimaryLengthUnit': "feet",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureSecondaryLengthUnit': "miles",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measurePrimaryAreaUnit': "acres",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureSecondaryAreaUnit': "sqmiles",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureActiveColor': "#00ff00",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureCompletedColor': "#0066ff",
            'display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureLocalization': "en"
        },
        ATTRIBUTIONS: {
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png': '&copy; OpenStreetMap contributors',
        'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png': '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png': '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        'http://tile.stamen.com/toner/{z}/{x}/{y}.png': 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg': 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
        'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg': 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
        },


        initialize: function() {
            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
            this.$el = $(this.el);
            this.isInitializedDom = false;
        },
  
        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.RAW_OUTPUT_MODE,
                count: this.maxResults
            });
        },

        setupView: function() {
            this.clearMap = false;
        },

        // Convert hex values to RGB for marker icon colors
        hexToRgb: function(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        // Convert string '1/0' or 'true/false' to boolean true/false
        isArgTrue: function(arg) {
            if(arg === 1 || arg === 'true') {
                return true;
            } else {
                return false;
            }
        },
      
        // Create RGBA string and corresponding HTML to dynamically set marker CSS in HTML head
        createMarkerStyle: function(bgHex, fgHex, markerName) {
            var bgRgb = this.hexToRgb(bgHex);
            var fgRgb = this.hexToRgb(fgHex);
            var bgRgba = 'rgba(' + bgRgb.r + ', ' + bgRgb.g + ', ' + bgRgb.b + ', 0.6)';
            var fgRgba = 'rgba(' + fgRgb.r + ', ' + fgRgb.g + ', ' + fgRgb.b + ', 0.6)';

            var html = '.marker-cluster-' + markerName + ' { background-color: ' + bgRgba + ';} .marker-cluster-' + markerName + ' div { background-color: ' + fgRgba + ';}';
            $("<style>")
                .prop("type", "text/css")
                .html(html)
                .appendTo("head");
        },

        // Create a control icon and description in the layer control legend
        addLayerToControl: function(lg, control) {
            if(!lg.layerExists) {
                // update blue to awesome-marker blue color
                if(lg.icon.options.markerColor === "blue") {
                    var styleColor = "#38AADD";
                }
                else {
                    var styleColor = lg.icon.options.markerColor;
                }

                var iconHtml= "<i class=\"legend-toggle-icon " + lg.icon.options.prefix + " " + lg.icon.options.prefix + "-" + lg.icon.options.icon + "\" style=\"color: " + styleColor + "\"></i> " + lg.layerDescription;
                control.addOverlay(lg.group, iconHtml);
                lg.layerExists = true;
            }

        },

        // Fetch KMZ or KML files and add to map
        fetchKmlAndMap: function(url, file, map) {
            // Test if it's a kmz file
            if(/.*\.kmz/.test(file)) {
                JSZipUtils.getBinaryContent(url, function (e, d) {
                    var z = new JSZip();

                    z.loadAsync(d)
                    .then(function(zip) {
                        return zip.file(/.*\.kml/)[0].async("string");
                    })
                    .then(function (text) {
                        var kmlText = $.parseXML(text);
                        var geojson = toGeoJSON.kml(kmlText);

                        L.geoJson(geojson.features, {
                            style: function (feature) {
                                 return feature.properties.style;
                             },
                             onEachFeature: function (feature, layer) {
                                 layer.bindPopup(feature.properties.name);
                            }
                        }).addTo(map);
                    });
                });
            // it's a kml file
            } else {
                $.ajax({url: url, context: this}).done(function(text) {
                    var kmlText = $.parseXML(text);
                    var geojson = toGeoJSON.kml(kmlText);

                    L.geoJson(geojson.features, {
                        style: function (feature) {
                             return feature.properties.style;
                         },
                         onEachFeature: function (feature, layer) {
                             layer.bindPopup(feature.properties.name);
                        }
                    }).addTo(map);
                });
            }
        },

        // Do the work of creating the viz
        updateView: function(data, config) {
            // viz gets passed empty config until you click the 'format' dropdown
            // intialize with defaults
            if(_.isEmpty(config)) {
                config = this.defaultConfig;
            }

            // Clear map and reset everything
            if(this.clearMap === true) {
                //console.log("CLEARING MAP!!");
                this.offset = 0; // reset offset
                this.updateDataParams({count: this.chunk, offset: this.offset}); // update data params
                this.invalidateUpdateView();  // redraw map
                var markers = this.markers;
                this.markers.clearLayers();
                var clearMap = this.clearMap;
                this.clearMap = false;
                // remove layers from map and clear out marker data
                _.each(this.layerFilter, function(lg, i) {
                    lg.group.clearLayers();
                    lg.markerList = [];
                }, this);
            }

            // get data
            var dataRows = data.results;

            // check for data
            if (!dataRows || dataRows.length === 0 || dataRows[0].length === 0) {
                return this;
            }

            // Validate we have at least latitude and longitude fields
            if(!("latitude" in dataRows[0]) || !("longitude" in dataRows[0])) {
                 throw new SplunkVisualizationBase.VisualizationError(
                    'Incorrect Fields Detected - latitude & longitude fields required'
                );
            }

            // get configs
            var cluster     = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.cluster']),
                allPopups   = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.allPopups']),
                multiplePopups = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.multiplePopups']),
                animate     = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.animate']),
                singleMarkerMode = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.singleMarkerMode']),
                maxClusterRadius = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.maxClusterRadius']),
                maxSpiderfySize = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.maxSpiderfySize']),
                spiderfyDistanceMultiplier = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.spiderfyDistanceMultiplier']),
                mapTile     = SplunkVisualizationUtils.makeSafeUrl(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapTile']),
                mapTileOverride  = SplunkVisualizationUtils.makeSafeUrl(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapTileOverride']),
                mapAttributionOverride = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapAttributionOverride'],
                layerControl = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.layerControl']),
                layerControlCollapsed = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.layerControlCollapsed']),
                scrollWheelZoom = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.scrollWheelZoom']),
                fullScreen = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.fullScreen']),
                defaultHeight = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.defaultHeight']),
                mapCenterZoom = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapCenterZoom']),
                mapCenterLat = parseFloat(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapCenterLat']),
                mapCenterLon = parseFloat(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.mapCenterLon']),
                minZoom     = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.minZoom']),
                maxZoom     = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.maxZoom']),
                kmlOverlay  = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.kmlOverlay'],
                rangeOneBgColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeOneBgColor'],
                rangeOneFgColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeOneFgColor'],
                warningThreshold = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.warningThreshold'],
                rangeTwoBgColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeTwoBgColor'],
                rangeTwoFgColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeTwoFgColor'],
                criticalThreshold = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.criticalThreshold'],
                rangeThreeBgColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeThreeBgColor'],
                rangeThreeFgColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.rangeThreeFgColor'],
                measureTool = parseInt(config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureTool']),
                measureIconPosition = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureIconPosition'],
                measurePrimaryLengthUnit = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measurePrimaryLengthUnit'],
                measureSecondaryLengthUnit = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureSecondaryLengthUnit'],
                measurePrimaryAreaUnit = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measurePrimaryAreaUnit'],
                measureSecondaryAreaUnit = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureSecondaryAreaUnit'],
                measureActiveColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureActiveColor'],
                measureCompletedColor = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureCompletedColor'],
                measureLocalization = config['display.visualizations.custom.leaflet_maps_app.leaflet_maps.measureLocalization']

            this.activeTile = (mapTileOverride) ? mapTileOverride:mapTile;
            this.attribution = (mapAttributionOverride) ? mapAttributionOverride:this.ATTRIBUTIONS[mapTile];

            // Initialize the DOM
            if (!this.isInitializedDom) {
                // Set defaul icon image path
                L.Icon.Default.imagePath = location.origin + this.contribUri + 'images';

                // Create layer filter object
                var layerFilter = this.layerFilter = {};

                // Setup cluster marker CSS
                this.createMarkerStyle(rangeOneBgColor, rangeOneFgColor, "one");
                this.createMarkerStyle(rangeTwoBgColor, rangeTwoFgColor, "two");
                this.createMarkerStyle(rangeThreeBgColor, rangeThreeFgColor, "three");

                // Enable all or multiple popups
                if(this.isArgTrue(allPopups) || this.isArgTrue(multiplePopups)) {
                    L.Map = L.Map.extend({
                        openPopup: function (popup, latlng, options) {
                            if (!(popup instanceof L.Popup)) {
                                popup = new L.Popup(options).setContent(popup);
                            }

                            if (latlng) {
                                popup.setLatLng(latlng);
                            }

                            if (this.hasLayer(popup)) {
                                return this;
                            }

                            this._popup = popup;
                            return this.addLayer(popup);
                        }
                    });                    

            	    var map = this.map = new L.Map(this.el, {closePopupOnClick: false}).setView([mapCenterLat, mapCenterLon], mapCenterZoom);
                } else {
            	    var map = this.map = new L.Map(this.el).setView([mapCenterLat, mapCenterLon], mapCenterZoom);
                }
               
                // Setup the tile layer with map tile, zoom and attribution
				this.tileLayer = L.tileLayer(this.activeTile, {
                    attribution: this.attribution,
                    minZoom: minZoom,
                    maxZoom: maxZoom
				});

                // Add tile layer to map
                this.map.addLayer(this.tileLayer);   

                this.markers = new L.MarkerClusterGroup({ 
                    chunkedLoading: true,
                    maxClusterRadius: maxClusterRadius,
                    maxSpiderfySize: maxSpiderfySize,
                    spiderfyDistanceMultiplier: spiderfyDistanceMultiplier,
                    singleMarkerMode: (this.isArgTrue(singleMarkerMode)),
                    animate: (this.isArgTrue(animate)),
                    iconCreateFunction: function(cluster) {
                        var childCount = cluster.getChildCount();
                        var c = ' marker-cluster-';
                        if (childCount >= criticalThreshold) {
                            c += 'three';
                        } else if (childCount >= warningThreshold) {
                            c += 'two';
                        } else {
                            c += 'one';
                        }
                        return new L.DivIcon({ html: '<div><span><b>' + childCount + '</span></div></b>', className: 'marker-cluster' + c , iconSize: new L.Point(40, 40) });
                    }
                });

                this.control = L.control.layers(null, null, { collapsed: this.isArgTrue(layerControlCollapsed)});
                this.markers.addTo(this.map);
           
                // Get parent element of div to resize
                var parentEl = $(this.el).parent().parent().closest("div").attr("data-cid");

                // Map Full Screen Mode
                if (this.isArgTrue(fullScreen)) {
                    var vh = $(window).height() - 120;
                    $("div[data-cid=" + parentEl + "]").css("height", vh);

                    $(window).resize(function() {
                        var vh = $(window).height() - 120;
                        $("div[data-cid=" + parentEl + "]").css("height", vh);
                    });
                    this.map.invalidateSize();
                } else {
                    $("div[data-cid=" + parentEl + "]").css("height", defaultHeight);
                    this.map.invalidateSize();
                }

                // Enable measure tool plugin and add to map
                if(this.isArgTrue(measureTool)) {
                    var measureOptions = { position: measureIconPosition,
                                           activeColor: measureActiveColor,
                                           completedColor: measureCompletedColor,
                                           primaryLengthUnit: measurePrimaryLengthUnit,
                                           secondaryLengthUnit: measureSecondaryLengthUnit,
                                           primaryAreaUnit: measurePrimaryAreaUnit,
                                           secondaryAreaUnit: measureSecondaryAreaUnit,
                                           localization: measureLocalization};

                    var measureControl = new L.Control.Measure(measureOptions);
                    measureControl.addTo(this.map);
                }

                // Iterate through KML files and load overlays into layers on map 
                if(kmlOverlay) {
                    // Create array of kml/kmz files
                    var kmlFiles = kmlOverlay.split(/\s*,\s*/);

                    // Loop through each file and load it onto the map
                    _.each(kmlFiles, function(file, i) {
                        var url = location.origin + this.contribUri + 'kml/' + file;
                        this.fetchKmlAndMap(url, file, this.map);
                    }, this);
                }
               
                // Init defaults
                this.chunk = 50000;
                this.offset = 0;
				this.isInitializedDom = true;         
                this.clearMap = false;
            } 


            // Map Scroll
            (this.isArgTrue(scrollWheelZoom)) ? this.map.scrollWheelZoom.enable() : this.map.scrollWheelZoom.disable();

            // Reset Tile If Changed
            if(this.tileLayer._url != this.activeTile) {
                this.tileLayer.setUrl(this.activeTile);
            }

            // Reset tile zoom levels if changed
            if (this.tileLayer.options.maxZoom != maxZoom) {
                this.tileLayer.options.maxZoom = maxZoom;
            }

            if (this.tileLayer.options.minZoom != minZoom) {
                this.tileLayer.options.minZoom = minZoom;
            }

            // Reset map zoom
            if (this.map.getZoom() != mapCenterZoom) {
                this.map.setZoom(mapCenterZoom);
            }
            
            // Iterate through each row creating layer groups per icon type
            // and create markers appending to a markerList in each layerfilter object
            _.each(dataRows, function(userData, i) {
                // Set icon options
                if("icon" in userData) {
                    var icon = userData["icon"];

                } else {
                    var icon = "circle";

                }

                // Create Clustered featuregroup subgroup layer
                if (typeof this.layerFilter[icon] == 'undefined' && this.isArgTrue(cluster)) {
                    this.layerFilter[icon] = {'group' : L.featureGroup.subGroup(this.markers),
                                              'markerList' : [],
                                              'iconStyle' : icon,
                                              'layerExists' : false
                                             };
                // Create normal layergroup
                } else if (typeof this.layerFilter[icon] == 'undefined') {
                    this.layerFilter[icon] = {'group' : L.layerGroup(),
                                              'markerList' : [],
                                              'iconStyle' : icon,
                                              'layerExists' : false
                                             };
                }

                if("layerDescription" in userData) {
                    var layerDescription = userData["layerDescription"];
                } else {
                    var layerDescription = "";
                }

                if (typeof this.layerFilter[icon] !== 'undefined') {
                    this.layerFilter[icon].layerDescription = layerDescription;
                }

                if("markerColor" in userData) {
                    var markerColor = userData["markerColor"];
                } else {
                    var markerColor = "blue";
                }

                if("iconColor" in userData) {
                    var iconColor = userData["iconColor"];
                } else {
                    var iconColor = "white";
                }

                if("prefix" in userData && userData["prefix"] === "ion") {
                    var prefix = "ion";
                } else {
                    var prefix = "fa";
                }

                if(/^(fa-)?map-marker/.test(icon) || /^(fa-)?map-pin/.test(icon)) {
                    var className = "";
                    var popupAnchor = [-3, -35];
                } else {
                    var className = "awesome-marker";
                    extraClasses = "";
                    var popupAnchor = [1, -35];
                }

                if("extraClasses" in userData) {
                    var extraClasses = userData["extraClasses"];
                } else if (prefix === "fa") {
                    var extraClasses = "fa-4x";
                } else {
                    var extraClasses = "";
                }
            
                if("description" in userData) {
                    var description = userData["description"]
                }
                else {
                    var description = "";
                }    

                // Create marker icon
                var markerIcon = L.AwesomeMarkers.icon({
                    icon: icon,
                    markerColor: markerColor,
                    iconColor: iconColor,
                    prefix: prefix,
                    className: className,
                    extraClasses: extraClasses,
                    popupAnchor: popupAnchor,
                    description: description
                }); 

                // Add the icon so we can access properties for overlay
                if (typeof this.layerFilter[icon] !== 'undefined') {
                    this.layerFilter[icon].icon = markerIcon;
                }

                // Create marker
                var marker = L.marker([userData['latitude'], userData['longitude']], {icon: markerIcon, layerDescription: layerDescription});

                // Bind description popup if description exists
                if(userData["description"]) {
                    marker.bindPopup(userData['description']);
                }

                // Save each icon in the layer
                this.layerFilter[icon].markerList.push(marker);

            }, this);            

            // Enable/disable layer controls and toggle collapse 
            if (this.isArgTrue(layerControl)) {           
                this.control.addTo(this.map);
                this.control.options.collapsed = this.isArgTrue(layerControlCollapsed);
            } else {
                this.control.remove();
            }

            // Clustered
            if (this.isArgTrue(cluster)) {           
                _.each(this.layerFilter, function(lg, i) { 
                    // Create temp clustered layergroup and add markerlist
                    this.tmpFG = L.featureGroup.subGroup(this.markers, lg.markerList);

                    // add temp layergroup to layer filter layergroup and add to map
                    lg.group.addLayer(this.tmpFG);
                    lg.group.addTo(this.map);

                    this.addLayerToControl(lg, this.control);

                }, this);
            // Single value
            } else {
                // Loop through layer filters
                _.each(this.layerFilter, function(lg, i) { 
                    lg.group.addTo(this.map);

                    // Loop through markers and add to map
                    _.each(lg.markerList, function(m, k) {
                        if(this.isArgTrue(allPopups)) {
                            m.addTo(lg.group).bindPopup(m.options.icon.options.description).openPopup();
                        } else {
                            m.addTo(lg.group);
                        }
                    }, this);

                    // Add layer controls
                    this.addLayerToControl(lg, this.control);
                }, this);

            }

            // Chunk through data 50k results at a time
            if(dataRows.length === this.chunk) {
                this.offset += this.chunk;
                this.updateDataParams({count: this.chunk, offset: this.offset});
            } else {
                this.clearMap = true;
            }

            return this;
        }
    });
});
