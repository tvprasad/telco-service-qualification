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

//config.js - Javascript configuration parameters

var config = 
{
	// This application requires a proxy in order to function.
	// Download and deploy the appropriate proxy configuration 
	// from https://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
	proxyURL: "<your proxy URL>",
	
	portalID: "<your portal URL>",
	appId: "<your application ID>",
	webMapOwner: "<web map owner>",
	webMapTag: "<web map tag>",
	basemapsGroupOwner: "<basemaps group owner>",
	basemapsGroupTag: "<basemaps group>",
	businessesLayerWebMapTag: "<business layer web map tag>",
	accessPointsLayerWebMapTag: "<access points web map tag>",
	
	routeLengthLabelUnits: "Feet",
	/* one of 	UNIT_STATUTE_MILE, 
				UNIT_FOOT, 
				UNIT_KILOMETER, 
				UNIT_METER, 
				UNIT_NAUTICAL_MILE, 
				UNIT_US_NAUTICAL_MILE, 
				UNIT_DEGREE */
	bufferEsriUnits: "UNIT_FOOT", 
	bufferWKID: "102100",
	bufferDistance: 500,
	facilitySearchDistance: 20000,
	
	geometryUrl: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer", 
	geocodeURL: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",

	// Network Analyst Configuration
	closestFacilityURL: "http://telecom.esri.com/arcgis/rest/services/ServiceQualification/NA/NAServer/Closest Facility",
	impedanceAttribute: "LengthToBusinessRatio",
	attributeName: "LengthToBusinessRatio",
	parameterName: "Business Influence",
	defaultCutoff: 25000000
};

