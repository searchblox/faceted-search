/**
 * Created by cselvaraj on 4/29/14.
 */

//SERVICE
angular.module('searchblox.service', [])
    .service('searchbloxService', ['$rootScope', function ($rootScope) {

        var noffilters;
        this.facetFieldsMap = new Object();
        //this.sortBtns = new Object();
        //this.collectionArray = new Array();

        function isBlank(strValue) {
            return (!strValue || /^\s*$/.test(strValue));
        }

        /**
         * Function for reading facet.json file
         * */
        this.getFacetFields = function (facets) {
            var fields = "";
            var values = new Object();
            var urlParam = "";
            for (var i in facets) {

                fields = fields + '&facet.field=' + facets[i].field;
                if (facets[i].size !== undefined && facets[i].size !== null) {
                    fields = fields + '&f.' + facets[i].field + '.size=' + facets[i].size;
                }
                
                values[facets[i].field] = {};
                values[facets[i].field]["display"] = facets[i].display;
                
                if (facets[i].slider) {
                    values[facets[i].field]["slider"] = facets[i].slider;
                }
                
                if (facets[i].range !== undefined && facets[i].range !== null) {
                    for (var r in facets[i].range) {
                        urlParam = urlParam + '&f.' + facets[i].field + '.range=[' + facets[i].range[r]["from"] + 'TO' + facets[i].range[r]["to"] + ']';
                    }
                    values[facets[i].field]["range"] = facets[i].range;
                }

                if (facets[i].dateRange !== undefined && facets[i].dateRange !== null) {

                    for (r in facets[i].dateRange) {
                        urlParam = urlParam + '&f.' + facets[i].field + '.range=[' + moment().subtract(facets[i].dateRange[r]["calendar"], facets[i].dateRange[r]["value"]).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
                    }
                    values[facets[i].field]["dateRange"] = facets[i].dateRange;
                }

            }

            fields = fields + urlParam;
            this.facetFieldsMap = values;
            return fields;
        }

        /**
         * Function for reading sort buttons from facet.json
         **/
        this.getSortBtns = function (sortBtns) {
            //var field = "";
            var values = new Object();
            for (var i in sortBtns) {
                //if(field == "") field = sortBtns[i].field;
                values[sortBtns[i].field] = new Object();
                values[sortBtns[i].field]["display"] = sortBtns[i].display;
                values[sortBtns[i].field]["sortVal"] = sortBtns[i].field;
            }
            return values;
            //this.sortBtns = values;
            // return field;
        }

        /**
         * Function for reading collection values from facet.json
         **/
        this.getCollectionValues = function (collection) {
            //var values = new Array();
            var collectionString = "";
            for (var i in collection) {
                console.log(i);
                //  values.push(collection[i]);
                collectionString = collectionString + '&col=' + collection[i];
            }
            //  this.collectionArray = values;
            return collectionString;
        }

        /**
         * Function to check if the sort value is valid
         */
        this.sortBtnExists = function (sortVal) {
            for (var i in this.sortBtns) {
                if (sortVal == i) return true;
            }
            return false;
        }

        // function for generating url
        this.getUrlParams = function (url, query, rangeFilter, filterFields, page, dataMap) {
            var urlParam = url;

            if (typeof(query) !== "undefined" && query !== null) {
                if (dataMap['matchAny'].toUpperCase() === "ON") {
                    urlParam = urlParam + "?q_low=" + queryStringForMatchAny(query) + "&st=adv&q_all=&q_phr=&q_not=&oc=all";
                } else {
                    urlParam = urlParam + "?&query=" + encodeURIComponent(query);
                }
            }

            if (typeof(dataMap['facet']) !== "undefined" && dataMap['facet'] !== null) {
                urlParam = urlParam + "&facet=" + dataMap['facet'];
            }

            if (typeof(dataMap['xsl']) !== "undefined" && dataMap['xsl'] !== null) {
                urlParam = urlParam + "&xsl=" + dataMap['xsl'];
            }

            if (typeof( dataMap['facetFields']) !== "undefined" && dataMap['facetFields'] !== null) {
                urlParam = urlParam + dataMap['facetFields'];
            }

            if (typeof(dataMap['sortDir']) !== "undefined" && dataMap['sortDir'] !== null && (dataMap['sortDir'] == "asc" || dataMap['sortDir'] == "desc")) {
                urlParam = urlParam + "&sortdir=" + dataMap['sortDir'];
            } else {
                urlParam = urlParam + "&sortdir=desc";
            }

            if (typeof(dataMap['sortVal']) !== "undefined" && dataMap['sortVal'] !== null && !isBlank(dataMap['sortVal'])) {
                urlParam = urlParam + "&sort=" + dataMap['sortVal'];
            }

            if (typeof(page) !== "undefined" && page !== null && !isNaN(page)) {
                urlParam = urlParam + "&page=" + page;
            }

            if (typeof(dataMap['pageSize']) !== "undefined" && dataMap['pageSize'] !== null && !isNaN(dataMap['pageSize'])) {
                urlParam = urlParam + "&pagesize=" + dataMap['pageSize'];
            }

            if (typeof( rangeFilter) !== "undefined" && rangeFilter !== null && !isBlank(rangeFilter)) {
                urlParam = urlParam + rangeFilter;
            }

            if (typeof( filterFields) !== "undefined" && filterFields !== null && !isBlank(filterFields)) {
                urlParam = urlParam + filterFields;
            }

            if (typeof( dataMap['collectionString']) !== "undefined" && dataMap['collectionString'] !== null && !isBlank(dataMap['collectionString'])) {
                urlParam = urlParam + dataMap['collectionString'];
            }

            if (typeof( dataMap['filter']) !== "undefined" && dataMap['filter'] !== null && !isBlank(dataMap['filter'])) {
                urlParam = urlParam + "&filter=" + dataMap['filter'];
            }

            if (typeof( dataMap['startDate']) !== "undefined" && dataMap['startDate'] !== null && !isBlank(dataMap['startDate'])) {
                urlParam = urlParam + "&startdate=" + dataMap['startDate'];
            }

            if (typeof( dataMap['endDate']) !== "undefined" && dataMap['endDate'] !== null && !isBlank(dataMap['endDate'])) {
                urlParam = urlParam + "&enddate=" + dataMap['endDate'];
            }
            return urlParam;
        }

        function queryStringForMatchAny(queryString) {
            queryString = queryString.replace(/^\s+|\s+$/g, '').split(/[ ]+/).join('+');
            return queryString;
        }

        // retrieves the auto suggestions
        this.parseAutoSuggestion = function (dataobj) {
            var suggestions = [];
            for (var i in dataobj[0]) {
                var value = dataobj[0][i];
                suggestions.push(value);
            }
            return suggestions;
        }

        function getParam(paramName, urlString) {
            paramName = paramName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + paramName + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(urlString);
            if (results == null) {
                return "";
            }
            else {
                return results[1];
            }
        }

        this.parseLinks = function (dataobj, facetFieldsMap) {
            var resultobj = new Object();
            // resultobj["npages"] = new Array();
            resultobj["pages"] = new Array();
            resultobj["sort"] = new Array();
            if (typeof(dataobj.links) !== "undefined" && typeof(dataobj.links.link) !== "undefined") {
                for (var item in dataobj.links.link) {
                    if (dataobj.links.link[item] !== "undefined" && dataobj.links.link[item] != null
                        && (dataobj.links.link[item]["@page"] === "date"
                        || dataobj.links.link[item]["@page"] === "alpha"
                        || dataobj.links.link[item]["@page"] === "relevance")) {
                        resultobj["sort"].push(dataobj.links.link[item]);
                    } else {
                        var linkobj = new Object();
                        linkobj['pageName'] = dataobj.links.link[item]["@page"];
                        linkobj['pageNo'] = getParam('page', dataobj.links.link[item]["@url"]);
                        linkobj['url'] = dataobj.links.link[item]["@url"]
                        resultobj["pages"].push(linkobj);
                        //resultobj["pages"].push(dataobj.links.link[item]);
                    }

                }
            }
            return resultobj;
        }

        // return array of advertisements
        function getAds(adsObj){
            if (!angular.isArray( adsObj)){
                if(adsObj.ad !== null && typeof(adsObj.ad)!== "undefined"){
                    return [adsObj.ad];
                }
                return [adsObj];
            }
            else
                return  adsObj;
        }

        // return array of Collections
        function getCollectionList(colObj){
            if (!angular.isArray( colObj)){
                if(colObj.ad !== null && typeof(colObj.collection)!== "undefined"){
                    return [colObj.collection];
                }
                return [colObj];
            }
            else
                return  colObj;
        }

        /**
         * Check if id's listed in collectionForAds are in the CollectionList
         * **/
        function showAds(colObj, colAds){
            var colList = new Array();
            colList =  getCollectionList(colObj);
            if(colAds !== null && colAds.length ==0){
                return true;
            }
            for (var col in colList) {
                for(var ad in colAds ){
                    if (colList[col]['@id'] == colAds[ad] && colList[col]['@checked'] == "true"){
                        return true;
                    }
                }
            }
            return false;
        }

        function computeResult(result) {
            var computedResult = new Object();
            computedResult = angular.copy(result);
            var recstr = JSON.stringify(result.url);
            var colid = result.col;
            recstr = recstr.substring(1, recstr.length - 1);
            var recstrf = recstr.substring(1, recstr.length);
            var t = recstr.substring(recstr.lastIndexOf('.') + 1).toLowerCase();
            var isImage = false;
            var isVideo = false;

            if (recstr.startsWith('http') || recstr.startsWith('https')) {
                if (t == "jpg" || t == "jpeg" || t == "png" || t == "gif" || t == "bmp") {
                    isImage = true;
                } else if (t == "mpeg" || t == "mp4" || t == "flv" || t == "mpg") {
                    isVideo = true;
                }
                computedResult.contentUrl = recstr;
            } else if (recstr.startsWith('/') || recstrf.startsWith(':')) {
                if (t == "jpg" || t == "jpeg" || t == "png" || t == "gif" || t == "bmp") {
                    var isImage = true;

                } else if (t == "mpeg" || t == "mp4" || t == "flv" || t == "mpg") {
                    isVideo = true;
                }
                computedResult.contentUrl = '../servlet/FileServlet?url=' + recstr + '&col=' + colid;
                if (result.url.lastIndexOf('http', 0) === 0) {
                    computedResult.contentUrl = result.url;
                }
            }
            else if (result.url.lastIndexOf('db', 0) === 0) {
                computedResult.contentUrl = '../servlet/DBServlet?col=' + result.col + '&id=' + result.uid;
            }
            else if (result.url.split(':')[0] == 'eml') {
                computedResult.contentUrl = '../servlet/EmailViewer?url=' + result.uid + '&col=' + result.col;
            }
            else {
                computedResult.contentUrl = result.url;
            }

            if (isImage) {
                computedResult.contentNature = "image";
            }
            else if (isVideo) {
                computedResult.contentNature = "video";
            } else {
                computedResult.contentNature = "href";
            }
            return computedResult;
        }

        function computeAdsResult(result) {
            var computedResult = new Object();
            computedResult = angular.copy(result);
            var recstr = JSON.stringify(result['@url']);

            var colid = result.col;
            recstr = recstr.substring(1, recstr.length - 1);
            var t = recstr.substring(recstr.lastIndexOf('.') + 1).toLowerCase();
            var isImage = false;

            var tempurl = result['@url'];
            var t = tempurl.substring(tempurl.lastIndexOf('.') + 1).toLowerCase();
            if (t == "jpg" || t == "jpeg" || t == "png" || t == "gif" || t == "bmp") {
                isImage = true;
            }
            computedResult.contentUrl = result['@url'];
            computedResult.isImage = isImage;
            return computedResult;
        }

        // Moved this functions from old code to here to perform search
        // read the result object and return useful vals depending on if ES or SOLR
        // returns an object that contains things like ["data"] and ["facets"]
        this.parseResults = function (dataobj, facetFieldsMap, dataMap) {
            var resultobj = new Object();
            resultobj["records"] = new Array();
            resultobj["start"] = "";
            resultobj["found"] = "0";
            resultobj["showAds"] = false;
            if (typeof(dataobj.results) !== "undefined" && typeof(dataobj.results.result) !== "undefined") {
                for (var item in dataobj.results.result) {
                    if (item == "@no") {
                        resultobj["records"].push(computeResult(dataobj.results.result));
                        resultobj["found"] = dataobj.results['@hits'];
                        break;
                    }
                    resultobj["records"].push(computeResult(dataobj.results.result[item]));
                    resultobj["found"] = dataobj.results['@hits'];
                }
            }
            if ( dataobj.ads !== null && typeof(dataobj.ads)!== "undefined"){
                resultobj["ads"] = new Array();
                var adsArray = new Array();
                adsArray = getAds(dataobj.ads);
                for (var item in adsArray) {
                    resultobj["ads"].push(computeAdsResult(adsArray[item]));// = getAds(dataobj.ads);
                }
            }
            if (typeof( dataMap['collectionForAds']) !== "undefined" && dataMap['collectionForAds'] !== null){
                resultobj["showAds"] = showAds(dataobj.searchform.collections,dataMap['collectionForAds']);
            }

            if (typeof(dataobj.facets) !== "undefined") {
                if (dataobj.facets) {
                    resultobj["facets"] = new Object();
                    if (dataobj.facets.facet) {
                        var fname = "";
                        var count = "";
                        var facetsobj = new Object();
                        for (var item in dataobj.facets.facet) {
                            var values = new Object();
                            if (item == "@name")
                                fname = dataobj.facets.facet[item];
                            else if (item == "@count")
                                count = dataobj.facets.facet[item];
                            else if (item == "int") {
                                for (var thing in dataobj.facets.facet[item]) {
                                    values[thing] = dataobj.facets.facet[item][thing];
                                }
                                facetsobj[fname] = new Object();
                                facetsobj['name'] = fname;
                                facetsobj[fname] = [count, values];
                            }
                        }
                        resultobj["facets"][0] = facetsobj;
                        this.noffilters = 1;
                    }
                    else {
                        var n = 0;
                        for (n in dataobj.facets) {
                            var fname = "";
                            var count = "";
                            var facetsobj = new Object();
                            for (var item in dataobj.facets[n]) {
                                var values = new Object();
                                if (item == "@name") {
                                    fname = dataobj.facets[n][item];

                                    if (fname === "lastmodified")//|| fname==="size"
                                    {
                                        facetsobj[fname] = new Object();
                                        //alert(JSON.stringify(dataobj.facets[n]['int']));
                                        for (var t1 in dataobj.facets[n]['int']) {
                                            var data = new Array();
                                            data[0] = dataobj.facets[n]['int'][t1]['@from'];
                                            data[1] = dataobj.facets[n]['int'][t1]['@to'];
                                            data[2] = dataobj.facets[n]['int'][t1]['#text'];
                                            facetsobj[fname][t1] = data;
                                        }
                                        //alert(JSON.stringify(facetsobj[fname]));
                                    }
                                }
                                else if (item == "@count")
                                    count = dataobj.facets[n][item];
                                else if (item == "int") {
                                    for (var thing in dataobj.facets[n][item]) {
                                        if (thing == '@name') {
                                            values['0'] = dataobj.facets[n]['int'];
                                            break;
                                        }

                                        var filterRange = facetFieldsMap[fname]["range"];
                                        var filterDateRange = facetFieldsMap[fname]["dateRange"];
                                        // Handle  range logic
                                        if (filterRange !== null && filterRange !== undefined) {
                                            var valueObject = dataobj.facets[n][item][thing];
                                            // check if this fname is a range field
                                            // handle range field
                                            for (var r in filterRange) {
                                                if (filterRange[r]["from"] === valueObject["@from"] && filterRange[r]["to"] === valueObject["@to"]) {
                                                    valueObject["@name"] = filterRange[r]["name"];
                                                    break;
                                                }
                                            }
                                            values[thing] = valueObject;
                                        }
                                        // Handle date range logic
                                        else if (filterDateRange !== null && filterDateRange !== undefined) {
                                            var valueObject = dataobj.facets[n][item][thing];
                                            // check if this fname is a range field
                                            // handle range field
                                            for (r in filterDateRange) {
                                                var dateValue = moment().subtract(filterDateRange[r]["calendar"], filterDateRange[r]["value"]).format("YYYY-MM-DD")
                                                if (valueObject["@from"].startsWith(dateValue))// if (startsWith(valueObject["@from"], dateValue))
                                                {
                                                    valueObject["@name"] = filterDateRange[r]["name"];
                                                    valueObject["@calendar"] = filterDateRange[r]["calendar"];
                                                    valueObject["@value"] = filterDateRange[r]["value"];
                                                    break;
                                                }
                                            }
                                            values[thing] = valueObject;
                                        }
                                        else {
                                            values[thing] = dataobj.facets[n][item][thing];
                                        }
                                    }
                                    facetsobj[fname] = new Object();
                                    facetsobj['name'] = fname;
                                    facetsobj[fname] = [count, values];
                                }
                            }
                            resultobj["facets"][n] = facetsobj;
                        }
                        this.noffilters = n;
                    }
                }
            }
            return resultobj;
        }
    }]);
