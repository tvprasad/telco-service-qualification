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
	proxyURL: "http://alba.esri.com/proxy/proxy.ashx",

	portalID: "http://telecomrc.maps.arcgis.com/",

	appId: "33uUL6Rj4QNesVkk",
	webMapOwner: "telecom_gis",
	webMapTag: "ServiceQualification.Fiber",
	basemapsGroupOwner: "telecom_gis",
	basemapsGroupTag: "ServiceQualification.Basemaps",
	businessesLayerWebMapTag: "ServiceQualification.Businesses",
	accessPointsLayerWebMapTag: "ServiceQualification.AccessPoint",
	
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
	defaultCutoff: 25000000,
	impedenceAttribute: "LengthToBusinessRatio",
	attributeName: "LengthToBusinessRatio",
	parameterName: "K Factor",
	closestFacilityURL: "http://telecom.esri.com/arcgis/rest/services/ServiceQualification/NA/NAServer/Closest Facility"
	
};

