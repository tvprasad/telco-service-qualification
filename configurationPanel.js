{
    "configurationSettings": [
        {
            "category": "General Settings",
            "fields": [
                {
                    "type": "string",
                    "fieldName": "appTitle",
                    "label": "App Title",
                    "tooltip": "Text displayed in the header of the app",
                    "stringFieldOption": "text"
                },
                {
                    "type": "string",
                    "fieldName": "businessesLayerName",
                    "label": "Business Layer Name",
                    "tooltip": "Location of all businesses within the market being analyzed."
                },
                {
                    "type": "string",
                    "fieldName": "accessPointsLayersName",
                    "label": "Access Points Layer Names(seperated multi with a comma):",
                    "tooltip": "Facilities or locations that will be used when analyzing routes from the customer premise back to the network."
                },
                {
                    "type": "string",
                    "fieldName": "routeLengthLabelUnits",
                    "label": "Route Length Display Text",
                    "tooltip": "Label used for the route length"
                },
                {
                    "type": "number",
                    "fieldName": "bufferDistance",
                    "label": "Buffer Distance",
                    "tooltip": "Distance to buffer route",
                    "constraints": "{min:0,max:20000,places:0}"
                },
                {
                    "type": "options",
                    "fieldName": "bufferEsriUnits",
                    "label": "Units used for Buffering",
                    "tooltip": "Units used for Buffering",
                    "options": [
                        {
                            "label": "Feet",
                            "value": "UNIT_FOOT"
                        },
                        {
                            "label": "Miles",
                            "value": "UNIT_STATUTE_MILE"
                        },
                        {
                            "label": "Meters",
                            "value": "UNIT_METER"
                        },
                        {
                            "label": "Kilometers",
                            "value": "UNIT_KILOMETER"
                        }
                    ]
                },
                {
                    "type": "number",
                    "fieldName": "facilitySearchDistance",
                    "label": "Facility Search Distance",
                    "tooltip": "Distance to search for facilities",
                    "constraints": "{min:0,max:100000,places:0}"
                },
                {
                    "type": "string",
                    "fieldName": "geometryUrl",
                    "label": "Geometry Service Url",
                    "tooltip": "Geometry service Url",
                    "stringFieldOption": "text"
                },
                {
                    "type": "string",
                    "fieldName": "closestFacilityURL",
                    "label": "Closest Facility Service Url",
                    "tooltip": "Closest Facility Service Url",
                    "stringFieldOption": "text"
                },
                {
                    "type": "string",
                    "fieldName": "impedanceAttribute",
                    "label": "Impediance Attribute",
                    "tooltip": "Impediance Attribute",
                    "stringFieldOption": "text"
                },
                {
                    "type": "string",
                    "fieldName": "attributeName",
                    "label": "Attribute Name",
                    "tooltip": "Attribute Name",
                    "stringFieldOption": "text"
                },
                {
                    "type": "string",
                    "fieldName": "parameterName",
                    "label": "Parameter Name",
                    "tooltip": "Parameter Name",
                    "stringFieldOption": "text"
                },
                {
                    "type": "number",
                    "fieldName": "defaultCutoff",
                    "label": "Cutoff Value",
                    "tooltip": "The default cutoff value to stop traversing.",
                    "constraints": "{min:0,max:50000000,places:0}"
                },
                {
                    "type": "string",
                    "fieldName": "serviceRequestLayerAvailibiltyFieldValueNotAvail",
                    "label": "No value",
                    "tooltip": "Value to set when the request location does not intersects a lookup feature",
                    "stringFieldOption": "text"
                }
            ]
        }
    ],
    "values": {
        "businessesLayerName": "Businesses",
        "accessPointsLayersName": "Patch Panel,Splice Closure",
        "routeLengthLabelUnits": "Feet",
        "bufferEsriUnits": "UNIT_FOOT",
        "bufferWKID": "102100",
        "bufferDistance": 500,
        "facilitySearchDistance": 20000,
        "geometryUrl": "http://54.214.169.132:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer",
        "closestFacilityURL": "http://54.214.169.132:6080/arcgis/rest/services/ServiceQualificationRoute/NAServer/Closest%20Facility",
        "impedanceAttribute": "LengthToBusinessRatio",
        "attributeName": "LengthToBusinessRatio",
        "parameterName": "Business Influence",
        "defaultCutoff": 25000000,
        "appTitle": "Service Qualification"
    }
}