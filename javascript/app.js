/*
 |
 | Copyright 2012 Esri
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


// app.js - Main app functions

var webmap;

var map;

var basemap; // from inital web map
var basemaps = []; // list of basemaps from a group if configured
var currentBasemapIndex = 0;

var loc;

var records = [];

var bufferGraphic;

var businessLyr;

var addressGraphic;

var businessObjectids;

var geocodeBufferPolygon;

var webMapID;

var portal;

var operationalLayers;

var mapClickHandle;

// Initialize the application
dojo.addOnLoad(oAuth);

function oAuth(){
	try{
		dojo.style("loader", "display", "block");
		
		esri.config.defaults.io.proxyUrl = config.proxyURL;
		esri.config.defaults.io.alwaysUseProxy = false;	
		esri.arcgis.utils.arcgisUrl = config.portalID + "sharing/content/items";	
	
		OAuthHelper.init({
			appId:      config.appId,
			portal:     config.portalID,
			expiration: (14 * 24 * 60), // 2 weeks, in minutes
			popup:      false
		});	
				  
		if (OAuthHelper.isSignedIn()) {
			console.log("already signed in!");
			new esri.arcgis.Portal(config.portalID).signIn().then(function(data){
				portal = data.portal;
				findWebMap(config.webMapTag, config.webMapOwner).then(function(data){
					webMapID = data.results[0].id;
					init(webMapID);						
				});
			});
		}	  
		else{
			OAuthHelper.signIn().then(function(data){
				new esri.arcgis.Portal(config.portalID).signIn().then(function(data){
					portal = data.portal;
					findWebMap(config.webMapTag, config.webMapOwner).then(function(data){
						webMapID = data.results[0].id;
						init(webMapID);						
					});
				});
			});		
		}
	}
	catch(err){
		dojo.style("loader", "display", "none");
		console.log("Error on Portal Sign In");
		console.log(err.message);
	}
}

function findWebMap(webMapTag,webMapOwner){
	try{
		console.log("Searching for web map...");

		var params = {
		  q:'type: Web Map AND tags: ' + webMapTag + ' AND owner: ' + webMapOwner,
		  num:1
		};
		
		deferred = portal.queryItems(params).then(function(data){
		  if(!data || !(data.results) || data.results.length == 0)
		  {
			alert("Web map with tag '" + webMapTag + "' and owner '" + webMapOwner + "' not found.");
			console.log("Web map not found.");
		  }
		  else
		  {
			console.log("Web map successfully found.");
			return data;
		  }
		},function(error){
			console.log("Error finding web map: " + error.message);
		});
		return deferred;
	}
	catch(err){
		dojo.style("loader", "display", "none");
		console.log("Error finding web map with tag: " + webMapTag);
		console.log(err.message);
	}		
}

function findGroupWithTag(groupTag,groupOwner){
	try{
		console.log("Searching for group...");

		var params = {
		  q:'tags: ' + groupTag + ' AND owner: ' + groupOwner,
		  num:1
		};
		
		deferred = portal.queryGroups(params).then(function(data){
		  if(!data || !(data.results) || data.results.length == 0)
		  {
			console.log("Group with tag '" + groupTag + "' and owner '" + groupOwner + "' not found.");
		  }
		  else
		  {
			console.log("Group successfully found.");
			return data;
		  }
		},function(error){
			console.log("Error finding group: " + error.message);
		});
		return deferred;
	}
	catch(err){
		dojo.style("loader", "display", "none");
		console.log("Error finding group with tag: " + groupTag);
		console.log(err.message);
	}		
}

function findOperationalLayersWithTag(tag){	
	try{
		// Get all the possible itemIds (items that are 
		// registered with AGO so could have tags)
		var itemIDs = [];
		dojo.forEach(operationalLayers, function(layer, index){
			if(layer.itemId){
				itemIDs.push(layer.itemId);
			}
		});
		// Add in OR for id portion of query
		var idQuery = itemIDs.join(" OR ");

		// Build the AGO query
		var params = {
		  q:'type: Service id: (' + idQuery + ") AND tags: " + tag
		};

		// Do the query
		console.log("Searching for operational layers with tag: " + tag);
		deferred = portal.queryItems(params).then(function(data){
		  if(data && data.results && data.results.length > 0)
		  {
			console.log(data.results.length.toString() + " Operational layers with tag: '" + tag + "' found.");
			return data.results;
		  }
		  else
		  {
			console.log("0 Operational layers with tag: '" + tag + "' found.");
		  }
		  console.log("Done searching operational layers");
		},function(error){
			console.log("Error occurred on portal query: " + error.message);
		});
		
		return deferred;
	}
	catch(err){
		dojo.style("loader", "display", "none");
		console.log("Error finding operational layer");
		console.log(err.message);
	}	
}

function findMapGraphicLayerWithUrl(url) {
  for(var j = 0; j < map.graphicsLayerIds.length; j++) {
    var layer = map.getLayer(map.graphicsLayerIds[j]);
	if(layer.url == url)
	{
		return layer;
	}
  }
  return null;
}

// INIT
function init(webMapID){
	try{							
		// popup dijit configuration
		var customPopup = new esri.dijit.Popup({
			fillSymbol: false,
			highlight: false,
			lineSymbol: false,
			markerSymbol: false
		}, dojo.create("div"));

		// popup theme
		dojo.addClass(customPopup.domNode, "noir");
		
		var mapDeferred = esri.arcgis.utils.createMap(webMapID, "map", {
			mapOptions: {
				wrapAround180:true,
				slider: true,
				nav: false,
				logo: true
			},
			ignorePopups: false
		});
				
		mapDeferred.addCallback(function(response) {
			map = response.map;
			basemap = response.itemInfo.itemData.baseMap;						
			operationalLayers = response.itemInfo.itemData.operationalLayers;  
			
			dojo.byId("panelBasemap").innerHTML = basemap.title;			

			// ---------------------------------------------------------------------
			// Find the business layer within the operational layers of the web map.
			// ---------------------------------------------------------------------
			findOperationalLayersWithTag(config.businessesLayerWebMapTag).then(function(data){
				if(!data){
					console.log("Could not find businesses layer. \nApplication initialization failed.");
					return;
				}
				else{
					// Would love to do lookup by id but map layer 
					// ids dont match web map item ids.
					businessLyr = findMapGraphicLayerWithUrl(data[0].url);
					businessLyr.setVisibility(false);
				}
			});									

			// ---------------------------------------------------------------------
			// Find the access points within the operational layers of the web map.
			// ---------------------------------------------------------------------
			findOperationalLayersWithTag(config.accessPointsLayerWebMapTag).then(function(data){
				if(!data){
					console.log("Could not find access point layers. \nApplication initialization failed.");
					return;
				}
				else{
					var dropDownData = [];
					dojo.forEach(data, function(item, index){
						dropDownData.push({label: item.title, value: item.url});
					});
								
					var sel = dijit.byId("findType");
					sel.options = dropDownData;
					sel.startup();				
				}
			});									

			// ---------------------------------------------------------------------
			// Find the basemaps group and layers to be used in the application.
			// ---------------------------------------------------------------------
			findGroupWithTag(config.basemapsGroupTag, config.basemapsGroupOwner).then(function(data){
				if(!data){
						dojo.style("panelBasemap", "display", "none");
				}
				else{
					console.log("Found basemaps group");

					var params = {q:'type: Service'};
					data.results[0].queryItems(params).then(function(data){
						if(data.results.length == 0){
							console.log("Basemap group contained no service type items");
							return;
						}
						
						console.log("Found basemap items");
						basemaps = data.results;

						// Setup the first base map
						var lyr = map.getLayer(map.layerIds[0]);		
						map.removeLayer(lyr);
						var newLyr = new esri.layers.ArcGISTiledMapServiceLayer(basemaps[0].url);
						map.addLayer(newLyr,0);	
						dojo.byId("panelBasemap").innerHTML = basemaps[0].title;			
					});			
				}	
				dojo.style("loader", "display", "none");
			});
			
			//resize the map when the browser resizes
			dojo.connect(dijit.byId('map'), 'resize', map,map.resize);
						
			// Initialize geocoding capability
			initGeocoder();			
		}); 
		
		mapDeferred.addErrback(function(error) {
			dojo.style("loader", "display", "none");
			console.log("Map creation failed: ", error.message);
	//		window.location = "http://www.esri.com";
		});		
	}
	catch(err){
		dojo.style("loader", "display", "none");
		console.log("Error opening web map...");
		console.log(err.message);
	}		
}

function initGeocoder(){
	try{
		// create the geocoder
		var geocoder = new esri.dijit.Geocoder({ 
		  autoNavigate: false, // do not zoom to best result
		  maxLocations: 5, // increase number of results returned
		  map: map,
		  arcgisGeocoder: {
			url: config.geocodeURL,
			name: "Esri World Geocoder",
			placeholder: "Find a place",
			sourceCountry: config.geocodeSourceCountry // limit search to the United States
		  },
		  autoComplete: config.geocodeAutoComplete
		}, "search-input");
		geocoder.startup();
		geocoder.focus();		

		dojo.connect(geocoder, "onFindResults", onFindResultsComplete);	
		dojo.connect(geocoder, "onSelect", onSelectComplete);	
		dojo.connect(geocoder, "onClear", onClearGeocode);		
	}
	catch(err){
		console.log("Error creating geocoder...");
		console.log(err.message);
	}		
}

function onClearGeocode(response) {
		console.log("onClearGeocode()");
		geocodeBufferPolygon = undefined;
		loc = undefined;
		dojo.style("ControlPanel", "display", "none");
	}

function onFindResultsComplete(response){
	locationSelected(new esri.geometry.Point(response.feature.geometry.x, response.feature.geometry.y, map.spatialReference));
}

function onSelectComplete(response){
	locationSelected(new esri.geometry.Point(response.feature.geometry.x, response.feature.geometry.y, map.spatialReference));
}

function locationSelected(point){
	console.log("onSelectComplete(): ", point);

	loc = point;
	dojo.style("ControlPanel", "display", "block");

	displayLocation();

	// First buffer the geocoded location and so we can get a 
	// subset of the facilities in the area as input to network 
	// analyst call... if we just pass in a facilities url to 
	// NA it will only use the first 1K or however many the 
	// server is setup to return.	  
	var deferred = bufferGeometries([point],
		[ config.facilitySearchDistance ],
		config.bufferEsriUnits,
		config.bufferWKID).then(onBufferLocationComplete,onBufferLocationError);
}

function mapClickLocate(){
	mapClickHandle = dojo.connect(map, "onClick", mapClickHandler);
}

function displayLocation(){
	console.log("displayLocation()");
	if (loc) {
		map.graphics.remove(addressGraphic);
		var symLoc = new esri.symbol.PictureMarkerSymbol('images/loc.png', 28, 50);
		addressGraphic = new esri.Graphic(loc, symLoc);
		map.graphics.add(addressGraphic);
		map.centerAt(loc);
	}	  
}

// Generic buffering function
function bufferGeometries(geometries, distances, units, wkid){	
	console.log("bufferGeometries()...");
	var params = new esri.tasks.BufferParameters();
	var gsvc = new esri.tasks.GeometryService(config.geometryUrl);
	
	params.distances = distances;
	params.bufferSpatialReference = new esri.SpatialReference({wkid: wkid});
	params.outSpatialReference = map.spatialReference;
	params.unit = eval("esri.tasks.GeometryService."+units);	
	params.geometries = geometries;

	var deferred = gsvc.buffer(params).then(function(data){
			console.log("bufferGeometries() success");
			return data;
		},
		function(error){
			console.log("bufferGeometries():" + error.message);
		});

		
	return deferred;
}

function onBufferLocationError(error){
	geocodeBufferPolygon = undefined;
	alert("Error: " + error);
}

function onBufferLocationComplete(geometries){
	console.log("onBufferLocationComplete()");
	geocodeBufferPolygon = geometries[0];

	// We wont do anything more at this point since the 
	// user might change the facilities selected in the 
	// drop down. Dont filter the facilities until they 
	// hit calculcate.	
}

// SWITCH BASEMAP
 function toggleBasemap() {
	if(basemaps.length == 0){
		console.log("No basemaps to toggle with");
		return;
	}
	
	console.log("switching basemap...");

	// move to next basemap
	currentBasemapIndex++;
	if(currentBasemapIndex >= basemaps.length)
	{
		currentBasemapIndex = 0;
	}
	
	var lyr = map.getLayer(map.layerIds[0]);		
	map.removeLayer(lyr);
	
	var newLyr = new esri.layers.ArcGISTiledMapServiceLayer(basemaps[currentBasemapIndex].url);
	map.addLayer(newLyr,0);	
	dojo.byId("panelBasemap").innerHTML = basemaps[currentBasemapIndex].title;			
	
	console.log("switched basemap");
}

// MAP CLICK HANDLER
function mapClickHandler(event) {
	locationSelected(event.mapPoint);
	dojo.disconnect(mapClickHandle);
}

// RENDER ROUTE
function renderNetworkRoute(obj){
		
	var sym = new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([0, 0, 255, 0.5]), 4);
	var line = new esri.geometry.Polyline(new esri.SpatialReference({wkid:102100}));
	line.addPath(obj.geometry.paths[0]);
	var route = new esri.Graphic(line, sym, {id: "route"});
	map.graphics.add(route);
	
	if(route.getDojoShape()){
		route.getDojoShape().moveToBack();
	}
	
	var ext = line.getExtent();
	if (ext) {
		map.setExtent(ext.expand(1.5));
	} 
}

// CLEAR ROUTE
function clearRoute() {
	var graphics = map.graphics.graphics;
	var i = graphics.length;
	while (i--) {
		var gra = graphics[i];
		if(gra.attributes && gra.attributes.id == "route")
			map.graphics.remove(gra);
	}
}

// ROUTE DETERMINATION
function setKFactor(){
	dojo.byId('businessInfluenceVal').value = dojo.number.round(dijit.byId('businessInfluenceSlider').value);
}

function calculateSolution(){
	console.log("calculateSolution()...");
	
	// Get a slimmed down list of facilities that makes sense 
	// to solve against in the immediate area.
	var deferred = queryFacilitiesData(geocodeBufferPolygon).then(function(result){
		console.log("Found " + result.features.length + " facilities in immediate area");

		// Now solve the route problem using the inputs from 
		// the user on preference to find routes favouring 
		// business or simply by shortest route.
		var deferred = solveNetworkRoute(result).then(function(solveResult){
			dojo.byId("infoSignal").innerHTML = solveResult.routes[0].attributes["Shape_Length"].toFixed(0) + " " + config.routeLengthLabelUnits;	
		
			// Buffer the network route and then get the business 
			// details for the contained area  
			var geomDeferred = bufferGeometries([solveResult.routes[0].geometry],
			[ config.bufferDistance ],
			config.bufferEsriUnits,
			config.bufferWKID)
			.then(onRouteBufferComplete,onRouteBufferError)
			.then(function(bufferedGeometries){
				// Get the business data within the buffered route area
				queryBusinessData(bufferedGeometries[0]);	
			});
		});

	});
	
}

function solveNetworkRoute(facilityFeatures){
	try
	{
		console.log("solveNetworkRoute()...");
		dojo.style("loader", "display", "block");
		
		map.infoWindow.hide();
		
		clearRoute();
		
		businessLyr.setDefinitionExpression("");
		businessLyr.setVisibility(false);

		map.graphics.remove(bufferGraphic);

		params = new esri.tasks.ClosestFacilityParameters();
		params.defaultCutoff = config.defaultCutoff;
		params.useHierarchy = false;
		params.returnIncidents = false;
		params.returnRoutes = true;
		params.returnDirections = false;
		params.defaultTargetFacilityCount=1;
		params.impedenceAttribute = config.impedanceAttribute;

		var attributeParameterValues = [];
		kfactor = dojo.number.round(dijit.byId('businessInfluenceSlider').value); 
		attributeParameterValues.push({ attributeName: config.attributeName, 
										parameterName: config.parameterName,  
										value: kfactor.toString()});	  
		params.attributeParameterValues = attributeParameterValues;

		// Use customer location as incident
		var incidents = new esri.tasks.FeatureSet();
		var features = [];
		var location = new esri.Graphic(loc);
		features.push(location);
		incidents.features = features;
		params.incidents = incidents;	  

		// Get the facilities from the chosen layer type
		// Server by default only returns 1000 features, 
		// need to limit the search radius of the facilities to consider
		var facilities = new esri.tasks.FeatureSet();
		var locationGraphics = [];
		if(!facilityFeatures.features || facilityFeatures.features.length == 0){
			alert("0 Facilities within configured search distance. No solve possible.");
			console.log("No facility features within facility search distance specified");
			dojo.style("loader", "display", "none");			
			return;
		}
		dojo.forEach(facilityFeatures.features, function(location, index){
			locationGraphics.push(new esri.Graphic(location.geometry));
		});
		facilities.features = locationGraphics;
		params.facilities = facilities;

		params.outSpatialReference = map.spatialReference;	 

		closestFacilityTask = new esri.tasks.ClosestFacilityTask(config.closestFacilityURL);	  
	  
		// Solve 
		var deferred = closestFacilityTask.solve(params).then(function(solveResult){
			console.log("solveNetworkRoute() success");
			console.log("result : ", solveResult);

			dojo.style("panelResults", "display", "block");			
			dojo.style("loader", "display", "none");
			renderNetworkRoute(solveResult.routes[0]);

			return solveResult;
		},
		function(error){
			console.log("Closest facility solve error: " + error.message);
		});
		
		return deferred;
	}
	catch(err)
	{
		console.log("calculateNetworkRoute() error: " + err.message);
		dojo.style("loader", "display", "none");

		txt="There was an error on this page.\n\n";
		txt+="Error description: " + err.message + "\n\n";
		txt+="Click OK to continue.\n\n";
		alert(txt);
	}	
}

function onRouteBufferComplete(bufferedGeometries) {
	console.log("onRouteBufferComplete(): ", bufferedGeometries);
  
	var symbol = new esri.symbol.SimpleFillSymbol(
	esri.symbol.SimpleFillSymbol.STYLE_SOLID,
	new esri.symbol.SimpleLineSymbol(
		esri.symbol.SimpleLineSymbol.STYLE_SOLID,
		new dojo.Color([0,0,0,0.65]), 4
		),new dojo.Color([255,255,255,0]));	
  
	var geometry = bufferedGeometries[0];
	bufferGraphic = new esri.Graphic(geometry,symbol);
	map.graphics.add(bufferGraphic);
  
	if(bufferGraphic.getDojoShape()){
		bufferGraphic.getDojoShape().moveToBack();
	}
	if(addressGraphic.getDojoShape()){
		addressGraphic.getDojoShape().moveToFront();	
	}
	
	return bufferedGeometries;
}	

function onRouteBufferError(error){
	console.log("onRouteBufferError(): " + error.message);
}  

function queryFacilitiesData(geometry){
	console.log("queryFacilitiesData()...");
	var query = new esri.tasks.Query();
    query.geometry = geometry;
	query.returnGeometry = true;
	query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_CONTAINS;
	query.outFields = ["*"];
	var url = dijit.byId("findType").value;
	var facilityLyr = findMapGraphicLayerWithUrl(url);
	var deferred = facilityLyr.queryFeatures(query).then(function(result){
		console.log("queryFacilitiesData() success");
		return result;
	});
	return deferred;	
}


function queryBusinessData(geometry){
	console.log("queryBusinessData()...");
	var query = new esri.tasks.Query();
    query.geometry = geometry;
	
	businessLyr.queryIds(query, function(results,index){
		console.log("queryBusinessData() success");
		console.log("result: " + results);
		dojo.byId("infoFeatures").innerHTML = results.length;

		businessObjectids = results;

		businessLyr.clearSelection();
		businessLyr.setDefinitionExpression("OBJECTID IN \(" + businessObjectids.toString() + "\)")
		businessLyr.setVisibility(true);		
		businessLyr.refresh();
	});
}
	
	
