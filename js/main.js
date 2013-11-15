/** @license
 | Version 10.2
 | Copyright 2013 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

define([
    "dojo/ready",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/arcgis/utils",
    "esri/IdentityManager",
    "dojo/on",
    "esri/dijit/Geocoder",
    "dojo/_base/array",
    "esri/graphic",
    "esri/toolbars/draw",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol",
    "esri/layers/GraphicsLayer",
    "esri/tasks/query",
    "esri/InfoTemplate",
    "esri/dijit/LocateButton",
    "esri/geometry",
    "dojo/html",
    "dijit/form/Select",
    "esri/tasks/GeometryService",
    "esri/tasks/BufferParameters",
    "esri/tasks/ClosestFacilityTask",
    "esri/tasks/ClosestFacilityParameters",
    "esri/tasks/FeatureSet",
    "dijit/form/Button",
     "esri/layers/FeatureLayer",
     "esri/dijit/BasemapGallery"

],
function (
    ready,
    declare,
    lang,
    arcgisUtils,
    IdentityManager,
    on,
    Geocoder,
    array,
    Graphic,
    Draw,
    SimpleMarkerSymbol,
    SimpleFillSymbol,
    SimpleLineSymbol,
    GraphicsLayer,
    Query,
    InfoTemplate,
    LocateButton,
    Geometry,
    html,
    Select,
    GeometryService,
    BufferParameters,
    ClosestFacilityTask,
    ClosestFacilityParameters,
        FeatureSet,
        Button,
        FeatureLayer,
        BasemapGallery
) {
    return declare("", null, {
        config: {},
        constructor: function (config) {
            //config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id
            // any url parameters and any application specific configuration information. 
            this.config = config;
            ready(lang.hitch(this, function () {
                this._initPage();
                this._createWebMap();
            }));
        },
        _mapLoaded: function () {
            // Map is ready
            console.log('map loaded');
            this._createLocatorButton();
            console.log('Locator Created');
            this._createGeocoder();
            console.log('Geocder Created');
            this._initGraphic();
            console.log('Graphics Created');
            this._createBaseMapGallery()
            console.log('Basemap Created');
            this._initMap();
            console.log('Map Initilized');
            this._createToolbar();
            console.log('Toolbar Created');

            console.log('Init Code Completed');
            dojo.style("loader", "display", "none");
            console.log('Loader Hidden');

        },
        _createBaseMapGallery: function () {
            if (this.config.basemapGalleryGroupQuery) {
                this.basemapGallery = new BasemapGallery({
                    basemap: this.config.basemapGalleryGroupQuery,
                    map: this.map
                }, "basemapGallery");
            }
            else {
                this.basemapGallery = new BasemapGallery({
                    showArcGISBasemaps: true,
                    map: this.map
                }, "basemapGallery");
            }

            this.basemapGallery.startup();

            this.basemapGallery.on("error", function (msg) {
                console.log("basemap gallery error:  ", msg);
            });
        },
        _initPage: function () {

            var control;
            this.acticeTrace = false;
            document.title = this.config.i18n.page.title;

            html.set(dojo.byId("businflu"), this.config.i18n.ui.busInflu);

            html.set(dojo.byId("searchfor"), this.config.i18n.ui.searchFor);

            html.set(dojo.byId("titleblock"), this.config.appTitle);

            html.set(dojo.byId("titleSignal"), this.config.i18n.ui.routeLen);

            html.set(dojo.byId("titleFeatures"), this.config.i18n.ui.busCnt);

            dijit.byId("basemapTitle").set("title", this.config.i18n.ui.basemapButton);

            dojo.byId('businessInfluenceVal').value = 0;

            control = dojo.byId("businessInfluenceSlider");

            dojo.connect(control, "onmouseup", lang.hitch(this, function (evt) {
                dojo.byId('businessInfluenceVal').value = dojo.number.round(dijit.byId('businessInfluenceSlider').value);
                if (this.locGraphic != null) {
                    this._addToMap(this.locGraphic.geometry);
                }
            }));



            dojo.connect(dojo.byId('traceButton'), 'onclick', lang.hitch(this, function () {

                this._toggleTool();

            }));



        },
        _toggleTool: function (forceState) {
            if (this.toolbar == null) return;

            if (forceState == true) {
                this.acticeTrace = true;

                document.getElementById("traceButton").className = "traceButtonPressed";
                this.toolbar.activate(Draw.POINT);


            }
            else if (forceState == false) {
                this.acticeTrace = false;



                document.getElementById("traceButton").className = "traceButtonNotPressed";
                this.toolbar.deactivate();


            }
            else {
                this.acticeTrace = !this.acticeTrace;
                if (this.acticeTrace == true) {
                    
                    document.getElementById("traceButton").className = "traceButtonPressed";
                    this.toolbar.activate(Draw.POINT);

                }
                else {
                    document.getElementById("traceButton").className = "traceButtonNotPressed";
                    this.toolbar.deactivate();

                }
            }
        },
        _createLocatorButton: function () {
            this.geoLocate = new LocateButton({
                map: this.map,
                pointerGraphic: new Graphic()
            }, "LocateButton");


            this.geoLocate.on("locate", lang.hitch(this, function (location) {
                this.geoLocate.clear();
                var point = new Geometry.Point({ "x": location.position.coords.longitude, "y": location.position.coords.latitude, " spatialReference": { " wkid": 4326 } });

                this._addToMap(point);

            }));


            this.geoLocate.startup();
        },
        _createGeocoder: function () {

            this.geocoder = new Geocoder({
                autoComplete: true,
                theme: "simpleGeocoder",
                arcgisGeocoder: {
                    placeholder: this.config.i18n.geocoder.defaultText,
                    searchExtent: this.map.extent

                },
                map: this.map
            }, dojo.byId('searchDiv'));

            this.geocoder.on("select", lang.hitch(this, function (result) {

                var pt = result.result.feature.geometry;
                this._addToMap(pt);
            }));
            // address search startup
            this.geocoder.startup();


        },
        _createToolbar: function () {
            this.toolbar = new Draw(this.map);
            this.toolbar.on("draw-end", lang.hitch(this, this._drawEnd));
            esri.bundle.toolbars.draw.addPoint = this.config.i18n.map.mouseToolTip;
            this.toolbar.deactivate();

        },
        _initGraphic: function () {


            this.editSymbol = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_PATH).setPath("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z").setSize(28).setColor(new dojo.Color([255, 0, 0]));



        },
        _drawEnd: function (evt) {
            this._addToMap(evt.geometry);
        },
        _addToMap: function (point) {
            this.map.infoWindow.hide();

            dojo.style("loader", "display", "block");

            this.map.graphics.clear();

            this.locGraphic = new Graphic(point, this.editSymbol);
            this.map.graphics.add(this.locGraphic);
            this.map.centerAt(point);
            this._locationSelected(point);


        },
        _locationSelected: function (point) {
            console.log("_locationSelected: ", point);


            // First buffer the geocoded location and so we can get a 
            // subset of the facilities in the area as input to network 
            // analyst call... if we just pass in a facilities url to 
            // NA it will only use the first 1K or however many the 
            // server is setup to return.


            var geomDeferred = this._bufferGeometries([point],
                [this.config.facilitySearchDistance],
                this.config.bufferEsriUnits,
                this.config.bufferWKID);

            geomDeferred.addCallback(lang.hitch(this, function (bufferedGeometries) {
                this._onBufferLocationComplete(bufferedGeometries);

            }));
            geomDeferred.addErrback(lang.hitch(this, function (error) {
                this._onBufferLocationError(error);

                dojo.style("loader", "display", "none");

            }));


        },
        _bufferGeometries: function (geometries, distances, units, wkid) {
            console.log("bufferGeometries()...");
            var params = new BufferParameters();
            var gsvc ;
            if (this.config.geometryUrl == null || this.config.geometryUrl == "") {
                gsvc = esriConfig.defaults.geometryService;
            }
            else {
                gsvc = new GeometryService(this.config.geometryUrl);
            }


            params.distances = distances;
            params.bufferSpatialReference = this.map.spatialReference;//new esri.SpatialReference({ wkid: wkid });
            params.outSpatialReference = this.map.spatialReference;
            params.unit = eval("esri.tasks.GeometryService." + units);
            params.geometries = geometries;

            return gsvc.buffer(params)

        },
        _onBufferLocationError: function (error) {
            geocodeBufferPolygon = undefined;
            alert("Error: " + error);
        },
        _onBufferLocationComplete: function (geometries) {
            if (geometries === undefined) {
                this.geocodeBufferPolygon = null;
                return;
            }


            console.log("onBufferLocationComplete()");
            this.geocodeBufferPolygon = geometries[0];
            this._calculateSolution();

        },
        _calculateSolution: function () {
            console.log("calculateSolution()...");

            // Get a slimmed down list of facilities that makes sense 
            // to solve against in the immediate area.
            var queryDeferred = this._queryFacilitiesData(this.geocodeBufferPolygon);//  this.locGraphic.geometry
            queryDeferred.addCallback(lang.hitch(this, function (result) {

                console.log("Found " + result.features.length + " facilities in immediate area");

                // Now solve the route problem using the inputs from 
                // the user on preference to find routes favouring 
                // business or simply by shortest route.
                var solveDeferred = this._solveNetworkRoute(result)
                if (solveDeferred != null) {
                    solveDeferred.addCallback(lang.hitch(this, function (solveResult) {
                        this._renderNetworkRoute(solveResult.routes[0]);

                        dojo.byId("infoSignal").innerHTML = solveResult.routes[0].attributes["Shape_Length"].toFixed(0) + " " + this.config.routeLengthLabelUnits;

                        // Buffer the network route and then get the business 
                        // details for the contained area  
                        var geomDeferred = this._bufferGeometries([solveResult.routes[0].geometry], [this.config.bufferDistance], this.config.bufferEsriUnits, this.config.bufferWKID);
                        geomDeferred.addCallback(lang.hitch(this, function (bufferedGeometries) {


                            var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.65]), 4), new dojo.Color([255, 255, 255, 0]));


                            var geometry = bufferedGeometries[0];
                            this.bufferGraphic = new Graphic(geometry, symbol);

                            this.map.graphics.add(this.bufferGraphic);

                            if (this.bufferGraphic.getDojoShape()) {
                                this.bufferGraphic.getDojoShape().moveToBack();
                            }
                            if (this.locGraphic.getDojoShape()) {
                                this.locGraphic.getDojoShape().moveToFront();
                            }


                            this._queryBusinessData(bufferedGeometries[0]);

                        }));
                        geomDeferred.addErrback(lang.hitch(this, function (error) {
                            console.log(error);
                            alert(this.config.i18n.error.errorSolve);

                            dojo.style("loader", "display", "none");

                        }));

                    }));
                    solveDeferred.addErrback(lang.hitch(this, function (error) {
                        console.log(error);
                        alert(this.config.i18n.error.errorSolve);

                        dojo.style("loader", "display", "none");


                    }));
                }
            }));

            queryDeferred.addErrback(lang.hitch(this, function (error) {
                console.log(error);
                alert(this.config.i18n.error.errorAccessPoints);

                dojo.style("loader", "display", "none");


            }));



        },

        _queryFacilitiesData: function (geometry) {
            console.log("queryFacilitiesData()...");
            var query = new Query();
            query.geometry = geometry;
            query.returnGeometry = true;
            query.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
            query.outFields = ["*"];
            var url = dijit.byId("findType").value;
            var queryTask = new esri.tasks.QueryTask(url);
            var queryDeferred = queryTask.execute(query);

            return queryDeferred;

        },
        _queryBusinessData: function (geometry) {
            console.log("queryBusinessData()...");
            var query = new esri.tasks.Query();
            query.geometry = geometry;



            var queryDef = this.businessLayerWebMap.layerObject.queryIds(query);

            queryDef.addCallback(lang.hitch(this, function (results, index) {
                console.log("queryBusinessData() success");
                console.log("result: " + results);
                dojo.byId("infoFeatures").innerHTML = results.length;

                businessObjectids = results;
                this.businessLayerWebMap.layerObject = this.businessLayerWebMap.layerObject.setDefinitionExpression("OBJECTID IN \(" + businessObjectids.toString() + "\)")
                this.businessLayerWebMap.layerObject.show();

                dojo.style("loader", "display", "none");
                this._toggleTool(false);

            }));
            queryDef.addErrback(lang.hitch(this, function (results) {

                alert(this.config.i18n.error.errorBufferBusiness);

                console.log("error: " + results);
                dojo.style("loader", "display", "none");

            }));

        },
        _solveNetworkRoute: function (facilityFeatures) {
            try {
                console.log("solveNetworkRoute()...");


                this._clearRoute();

                this.businessLayerWebMap.layerObject.setDefinitionExpression("");
                // this.businessLayerWebMap.layerObject.clear();
                this.businessLayerWebMap.layerObject.setVisibility(false);


                this.map.graphics.remove(this.bufferGraphic);

                var params = new ClosestFacilityParameters();
                params.defaultCutoff = this.config.defaultCutoff;
                params.useHierarchy = false;
                params.returnIncidents = false;
                params.returnRoutes = true;
                params.returnDirections = false;
                params.defaultTargetFacilityCount = 1;
                params.impedenceAttribute = this.config.impedanceAttribute;

                var attributeParameterValues = [];
                var kfactor = dojo.number.round(dijit.byId('businessInfluenceSlider').value);
                attributeParameterValues.push({
                    attributeName: this.config.attributeName,
                    parameterName: this.config.parameterName,
                    value: kfactor.toString()
                });
                params.attributeParameterValues = attributeParameterValues;

                // Use customer location as incident
                var incidents = new FeatureSet();
                var features = [];
                var location = new Graphic(this.locGraphic.geometry);
                features.push(location);
                incidents.features = features;
                params.incidents = incidents;

                // Get the facilities from the chosen layer type
                // Server by default only returns 1000 features, 
                // need to limit the search radius of the facilities to consider
                var facilities = new FeatureSet();
                var locationGraphics = [];
                if (!facilityFeatures.features || facilityFeatures.features.length == 0) {
                    alert(this.config.i18n.error.businessNotInBuffer);

                    console.log("No facility features within facility search distance specified");
                    dojo.style("loader", "display", "none");
                    return null;
                }
                dojo.forEach(facilityFeatures.features, function (location, index) {
                    locationGraphics.push(new Graphic(location.geometry));
                });
                facilities.features = locationGraphics;
                params.facilities = facilities;

                params.outSpatialReference = this.map.spatialReference;

                closestFacilityTask = new ClosestFacilityTask(this.config.closestFacilityURL);

                // Solve 
                return closestFacilityTask.solve(params);
            }
            catch (err) {
                console.log("calculateNetworkRoute() error: " + err.message);
                dojo.style("loader", "display", "none");

                txt = "There was an error on this page.\n\n";
                txt += "Error description: " + err.message + "\n\n";
                txt += "Click OK to continue.\n\n";
                alert(txt);
            }
        },
        // CLEAR ROUTE
        _clearRoute: function () {
            var graphics = this.map.graphics.graphics;
            var i = graphics.length;
            while (i--) {
                var gra = graphics[i];
                if (gra.attributes && gra.attributes.id == "route")
                    this.map.graphics.remove(gra);
            }
        },
        _renderNetworkRoute: function (obj) {

            var sym = new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([0, 0, 255, 0.5]), 4);
            var line = new Geometry.Polyline(new esri.SpatialReference({ wkid: 102100 }));
            line.addPath(obj.geometry.paths[0]);
            var route = new Graphic(line, sym, { id: "route" });
            this.map.graphics.add(route);

            if (route.getDojoShape()) {
                route.getDojoShape().moveToBack();
            }

            var ext = line.getExtent();
            if (ext) {
                this.map.setExtent(ext.expand(1.5));
            }

        },

        _initMap: function () {
            console.log("InitMap");


            var accessPointLayers = new Array();

            accessPointLayers = this.config.accessPointsLayersName.split(',');
            this.accessLayers = new Array();

            array.forEach(this.layers, function (layer) {


                if (dojo.indexOf(accessPointLayers, layer.title) != -1) {

                    this.accessLayers.push({ label: layer.title, value: layer.layerObject.url });

                    console.log(layer.title + " :Access Layer Added");

                }

                if (this.config.businessesLayerName == layer.title) {

                    this.businessLayerWebMap = layer;
                    //this.businessLayerWebMap.mode = 2;
                    //this.businessLayerWebMap.layerObject.mode = 2;
                    //this.businessLayerWebMap.layerObject.setSelectionSymbol(this.editSymbolAvailable);

                    console.log(layer.title + " :Business Layer Added");

                }


            }, this);

            if (accessPointLayers.length != this.accessLayers.length) {
                alert(this.config.i18n.error.layerNotFound);

            }

            if (accessPointLayers.length != this.accessLayers.length) {
                alert(this.config.i18n.error.layerNotFound);

            }





            var sel = new Select({
                name: "findType",
                options: this.accessLayers,
                maxHeight: -1
            }, "findType");
            sel.startup();
            sel.on('change', lang.hitch(this, function () {

                if (this.locGraphic != null) {
                    this._addToMap(this.locGraphic.geometry);
                }

            }));




        },
        //create a map based on the input web map id
        _createWebMap: function () {
            dojo.style("loader", "display", "block");

            arcgisUtils.createMap(this.config.webmap, "mapDiv", {
                mapOptions: {
                    //Optionally define additional map config here for example you can 
                    //turn the slider off, display info windows, disable wraparound 180, slider position and more. 
                },
                bingMapsKey: this.config.bingmapskey
            }).then(lang.hitch(this, function (response) {
                //Once the map is created we get access to the response which provides important info 
                //such as the map, operational layers, popup info and more. This object will also contain
                //any custom options you defined for the template. In this example that is the 'theme' property.
                //Here' we'll use it to update the application to match the specified color theme.  
                console.log(this.config);
                this.layers = response.itemInfo.itemData.operationalLayers;


                this.map = response.map;
                if (this.map.loaded) {
                    // do something with the map
                    this._mapLoaded();
                } else {
                    on.once(this.map, "load", lang.hitch(this, function () {
                        // do something with the map
                        this._mapLoaded();
                    }));
                }
            }), lang.hitch(this, function (error) {
                //an error occurred - notify the user. In this example we pull the string from the 
                //resource.js file located in the nls folder because we've set the application up 
                //for localization. If you don't need to support mulitple languages you can hardcode the 
                //strings here and comment out the call in index.html to get the localization strings. 
                if (this.config && this.config.i18n) {
                    alert(this.config.i18n.map.error + ": " + error.message);
                } else {
                    alert("Unable to create map: " + error.message);
                }
            }));
        }

    });
});