define([], function () {
    //Default configuration settings for the applciation. This is where you'll define things like a bing maps key, 
    //default web map, default app color theme and more. These values can be overwritten by template configuration settings
    //and url parameters.
    var defaults = {
        "appid": "",
        "webmap": "6365265583104716abbed804efa4b705", // 
        "oauthappid": null, //"",
        //Group templates must support a group url parameter. This will contain the id of the group. 
        //group: "",
        //Enter the url to the proxy if needed by the applcation. See the 'Using the proxy page' help topic for details
        //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
        "proxyurl": "http://tryitlive.arcgis.com/servicequalification/auth_proxy.ashx",
        //Example of a template specific property. If your template had several color schemes
        //you could define the default here and setup configuration settings to allow users to choose a different
        //color theme.  
        "theme": "none",
        "bingmapskey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
        "sharinghost": location.protocol + "//" + "www.arcgis.com", //Defaults to arcgis.com. Set this value to your portal or organization host name. 

        "businessesLayerName": "Businesses",
        "accessPointsLayersName": "Patch Panel,Splice Closure",

        "routeLengthLabelUnits": "Feet",
        /* one of 	UNIT_STATUTE_MILE, 
        UNIT_FOOT, 
        UNIT_KILOMETER, 
        UNIT_METER, 
        UNIT_NAUTICAL_MILE, 
        UNIT_US_NAUTICAL_MILE, 
        UNIT_DEGREE */
        "bufferEsriUnits": "UNIT_FOOT",
        "bufferWKID": "102100",
        "bufferDistance": 500,
        "facilitySearchDistance": 20000,

        "geometryUrl": "",

        // Network Analyst Configuration
        "closestFacilityURL": "http://54.214.169.132:6080/arcgis/rest/services/ServiceQualificationRoute/NAServer/Closest%20Facility",
        "impedanceAttribute": "LengthToBusinessRatio",
        "attributeName": "LengthToBusinessRatio",
        "parameterName": "Business Influence",
        "defaultCutoff": 25000000,
        "appTitle": "Service Feasibility"
    };
    return defaults;
});