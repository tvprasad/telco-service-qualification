/*
|
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


// portal.js - portal and web map functions


function findWebMap(webMapTag, webMapOwner) {
    try {
        console.log("Searching for web map...");

        var params = {
            q: 'type: Web Map AND tags: ' + webMapTag + ' AND owner: ' + webMapOwner,
            num: 1
        };

        deferred = portal.queryItems(params).then(function (data) {
            if (!data || !(data.results) || data.results.length == 0) {
                alert("Web map with tag '" + webMapTag + "' and owner '" + webMapOwner + "' not found.");
                console.log("Web map not found.");
            }
            else {
                console.log("Web map successfully found.");
                return data;
            }
        }, function (error) {
            console.log("Error finding web map: " + error.message);
        });
        return deferred;
    }
    catch (err) {
        dojo.style("loader", "display", "none");
        console.log("Error finding web map with tag: " + webMapTag);
        console.log(err.message);
    }
}

function findGroupWithTag(groupTag, groupOwner) {
    try {
        console.log("Searching for group...");

        var params = {
            q: 'tags: ' + groupTag + ' AND owner: ' + groupOwner,
            num: 1
        };

        deferred = portal.queryGroups(params).then(function (data) {
            if (!data || !(data.results) || data.results.length == 0) {
                console.log("Group with tag '" + groupTag + "' and owner '" + groupOwner + "' not found.");
            }
            else {
                console.log("Group successfully found.");
                return data;
            }
        }, function (error) {
            console.log("Error finding group: " + error.message);
        });
        return deferred;
    }
    catch (err) {
        dojo.style("loader", "display", "none");
        console.log("Error finding group with tag: " + groupTag);
        console.log(err.message);
    }
}

function findOperationalLayersWithTag(tag) {
    try {
        // Get all the possible itemIds (items that are 
        // registered with AGO so could have tags)
        var itemIDs = [];
        dojo.forEach(operationalLayers, function (layer, index) {
            if (layer.itemId) {
                itemIDs.push(layer.itemId);
            }
        });
        // Add in OR for id portion of query
        var idQuery = itemIDs.join(" OR ");

        // Build the AGO query
        var params = {
            q: 'type: Service id: (' + idQuery + ") AND tags: " + tag
        };

        // Do the query
        console.log("Searching for operational layers with tag: " + tag);
       
        deferred = portal.queryItems(params).then(function (data) {
            if (data && data.results && data.results.length > 0) {
                console.log(data.results.length.toString() + " Operational layers with tag: '" + tag + "' found.");
                return data.results;
            }
            else {
                console.log("0 Operational layers with tag: '" + tag + "' found.");
            }
            console.log("Done searching operational layers");
        }, function (error) {
            console.log("Error occurred on portal query: " + error.message);
        });

        return deferred;
    }
    catch (err) {
        dojo.style("loader", "display", "none");
        console.log("Error finding operational layer");
        console.log(err.message);
    }
}
	
	
