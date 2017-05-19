/**
 * Created by cselvaraj on 4/29/14.
 */
'use strict';
//var rootUrl = "http://185.73.37.206:8080";
//var rootUrl = "http://92.222.88.95:8080";
var rootUrl = "http://localhost:8080";
// CONTROLLER
angular.module('searchblox.controller', [])
    .controller('searchbloxController', ['$rootScope', '$scope', '$http', '$location', 'searchbloxService', 'searchbloxFactory', 'facetFactory', '$q', '$timeout', '$sce',
        function ($rootScope, $scope, $http, $location, searchbloxService, searchbloxFactory, facetFactory, $q, $timeout, $sce) {// 'autoCompleteFactory',

            var searchUrl = rootUrl+'/searchblox/servlet/SearchServlet';
            var autoSuggestUrl = rootUrl+'/searchblox/servlet/AutoSuggest';
            var reportServletUrl = rootUrl+'/searchblox/servlet/ReportServlet';

            // Hard coded these values. This needs to be dynamic
            //var facet = 'on';
            //var xsl = "json";
            $scope.facetFields = "";
            // var dateFacet = "";

            $scope.rangeFilter = "";
            $scope.filterFields = "";
            $scope.selectedItems = [];
            //$scope.sortDir = "desc";
            // $scope.sortVal = "";
            $scope.from = 0;
            $scope.page = 1;
            $scope.currentPage = 1; //I: To track current page
            $scope.prevPage = 1;
            //$scope.pageSize = 10;
            $scope.noOfSuggests = 5;
            //$scope.showAutoSuggest = true;

            $scope.paginationHtml = "";
            $scope.tagHtml = "";
            $scope.topHtml = "";
            $scope.startedSearch = false;
            $scope.initAds = 1;
            $scope.maxAdsLimit = 2;
            $scope.dataMap = new Object();
            $scope.inputClass = {};
            $scope.inputClass.name = "ngCustomInput col-sm-12 col-md-8 col-md-offset-2";

            $scope.removeAds = false; //TO HIDE ADS IF TRUE
            $scope.showUptoColFilterCountFlag = false; //COUNT TO SHOW THE NUMBER OF COLLECTION FILTERS

            // load autosuggest items
            $scope.loadItems = function (term) {
                var autoSuggestData = $q.defer();
                searchbloxFactory.getResponseData(autoSuggestUrl + '?limit=' + $scope.noOfSuggests + '&q=' + term).then(function (suggestionResults) {
                    var suggtns = searchbloxService.parseAutoSuggestion(suggestionResults.data);
                    $scope.timer = $timeout(function () {
                        $rootScope.$apply(autoSuggestData.resolve(suggtns));
                    }, 10);
                });
                return autoSuggestData.promise;

            };

            // Reads json data file and initializes the scope variables
            $scope.init = function () {
                facetFactory.get().$promise.then(function (data) {
                    if (data !== null) {
                        $scope.startedSearch = true;
                        if (typeof($scope.dataMap['facetFields']) == "undefined" || $scope.dataMap['facetFields'] == null || $scope.dataMap['facetFields'] == "") {
                            $scope.dataMap['facetFields'] = searchbloxService.getFacetFields(data.facets);
                            $scope.facetMap = searchbloxService.facetFieldsMap;
                        }

                        if (typeof($scope.dataMap['sortVal']) == "undefined" || $scope.dataMap['sortVal'] == null || $scope.dataMap['sortVal'].trim() == "" || !searchbloxService.sortBtnExists($scope.dataMap['sortVal'].trim())) {
                            $scope.sortBtns = searchbloxService.getSortBtns(data.sortBtns);
                        }

                        if (typeof($scope.dataMap['collectionString']) == "undefined" || $scope.dataMap['collectionString'] == null || $scope.dataMap['collectionString'] === "") {
                            $scope.dataMap['collectionString'] = searchbloxService.getCollectionValues(data.collection);
                        }

                        if (typeof($scope.dataMap['collectionForAds']) == "undefined" || $scope.dataMap['collectionForAds'] == null || $scope.dataMap['collectionForAds'] === "") {
                            $scope.dataMap['collectionForAds'] = data.collectionForAds;
                        }

                        if (typeof($scope.dataMap['matchAny']) == "undefined" || $scope.dataMap['matchAny'] == null) {
                            $scope.dataMap['matchAny'] = data.matchAny;
                        }

                        if (typeof($scope.dataMap['sortDir']) == "undefined" || $scope.dataMap['sortDir'] == null) {
                            $scope.dataMap['sortDir'] = data.sortDir;
                        }

                        if (typeof($scope.dataMap['pageSize']) == "undefined" || $scope.dataMap['pageSize'] == null) {
                            $scope.dataMap['pageSize'] = data.pageSize;
                        }

                        if (typeof($scope.dataMap['filter']) == "undefined" || $scope.dataMap['filter'] == null) {
                            $scope.dataMap['filter'] = data.filter;
                        }

                        if (typeof($scope.dataMap['startDate']) == "undefined" || $scope.dataMap['startDate'] == null) {
                            if ((data.startDate !== undefined) && data.startDate !== null) {
                                $scope.dataMap['startDate'] = moment(data.startDate, 'MM-DD-YYYY').format("YYYYMMDDHHmmss");
                            }
                        }

                        if (typeof($scope.dataMap['endDate']) == "undefined" || $scope.dataMap['endDate'] == null) {
                            if ((data.endDate !== undefined) && data.endDate !== null) {
                                $scope.dataMap['endDate'] = moment(data.endDate, 'MM-DD-YYYY').format("YYYYMMDDHHmmss");
                            }
                        }

                        if (typeof($scope.showAutoSuggest) == "undefined" || $scope.showAutoSuggest == null) {
                            $scope.showAutoSuggest = data.showAutoSuggest;
                        }


                        $scope.dataMap['facet'] = 'on';
                        $scope.dataMap['xsl'] = "json";
                    }
                });
            }



            $scope.startSearch = function(){
                $scope.from = 0;
                $scope.page = 1;
                $scope.prevPage = 1;
                $scope.doSearch();
            }
            // Search function
            $scope.doSearch = function () {
                $scope.currentPage = $scope.page;
                var urlParams = searchbloxService.getUrlParams(searchUrl, $scope.query,
                    $scope.rangeFilter, $scope.filterFields, $scope.page, $scope.dataMap);
                searchbloxFactory.getResponseData(urlParams).then(function (searchResults) {
                    $scope.parsedSearchResults = searchbloxService.parseResults(searchResults.data, $scope.facetMap, $scope.dataMap);
                    $scope.parsedLinks = searchbloxService.parseLinks(searchResults.data, $scope.facetMap);
                    // $scope.getTopClicked();
                    //$scope.getTagCloud();
                    $scope.startedSearch = true;
                    $scope.inputClass.name = "ngCustomInput col-sm-12 col-md-8 col-md-offset-2";
                    $scope.displayPageNo();
                });
            }

            // Sort function
            $scope.doSort = function (sortVal) {
                $scope.dataMap['sortVal'] = sortVal;
                $scope.doSearch();
            }

            // Sort function
            $scope.doDirector = function (direction) {
                $scope.dataMap['sortDir'] = direction;
                $scope.doSearch();
            }

            // get tagcloud
            $scope.getTagCloud = function () {
                var taghtml = "<h3>Most Used Tags</h3></br><div id='facettagcloud'>";
                if ($scope.parsedSearchResults.facets != undefined && $scope.parsedSearchResults.facets != null && $scope.parsedSearchResults.facets[2].keywords != undefined && $scope.parsedSearchResults.facets[2].keywords != null)
                    for (var a in $scope.parsedSearchResults.facets[2].keywords[1]) {
                        var value = $scope.parsedSearchResults.facets[2].keywords[1][a];
                        taghtml += "<a href='index.html?query=" + value['@name'] + "' tagrel='" + value['#text'] + "'>" + value['@name'] + " </a>";
                    }
                taghtml += "</div>";
                $scope.tagHtml = $sce.trustAsHtml(taghtml);
                var list = document.getElementById("facettagcloud");
                if (list != undefined && list.childNodes.length > 0) {
                    shuffleNodes(list);
                    $.fn.tagcloud.defaults = {
                        size: {start: 14, end: 18, unit: 'pt'},
                        color: {start: '#cde', end: '#f52'}
                    };
                    $(function () {
                        $('#facettagcloud a').tagcloud();
                    });
                }
            }

            // get top clicked function
            $scope.getTopClicked = function () {
                searchbloxFactory.getResponseData(reportServletUrl + '?&gettopclicks=yes&nodocs=5&query=' + $scope.query).then(function (topClickedResults) {
                    topClickedResults = topClickedResults.data;
                    var temphtml = "<h3>Most Viewed</h3></br>";
                    if (topClickedResults != "nodocs" && topClickedResults != "queryerror" && topClickedResults != "")
                        for (var x in topClickedResults)
                            for (var y in topClickedResults[x])
                                temphtml += topClickedResults[x][y];
                    if (topClickedResults != "nodocs" && topClickedResults != "queryerror" && topClickedResults != "")
                        $scope.topHtml = $sce.trustAsHtml(temphtml);
                });
            }

            // adjust how many results are shown
            $scope.howmany = function () {
                var newhowmany = prompt('Currently displaying ' + $scope.dataMap['pageSize'] + ' results per page. How many would you like instead?');
                if (newhowmany > 0) {
                    $scope.dataMap['pageSize'] = parseInt(newhowmany);
                    $scope.from = 0;
                    $scope.doSearch();
                }
            }

            // adjust how many suggestions are shown
            $scope.howmanynofsuggest = function () {
                var newhowmany = prompt('Currently displaying ' + $scope.noOfSuggests + ' suggestions per page. How many would you like instead?');
                if (newhowmany > 0) {
                    $scope.noOfSuggests = parseInt(newhowmany);
                    $scope.from = 0;
                    $scope.doSearch();
                }
            };

            //TO CHANGE THE NUMBER OF VALUES TO BE DISPLAYED FOR COLLECTION FILTERS
            $scope.colFilterCountChange = function(coltype){
              var oldhowmany = $scope.facetMap[coltype].size;
              var newhowmany = prompt('Currently displaying ' + $scope.facetMap[coltype].size + '. How many would you like instead?');
              if (newhowmany > 0) {
                $scope.facetMap[coltype].size = parseInt(newhowmany);
                $scope.dataMap['facetFields'] = $scope.dataMap['facetFields'].replace("f."+coltype+".size="+oldhowmany, "f."+coltype+".size="+newhowmany);
                $scope.doSearch();
              }
            }
            // Function for search by filter.
            $scope.doSearchByFilter = function (filter, facetName, rSlider) {
                $scope.page = 1;

                var filters = "",
                    filterName = filter['@name'],
                    filterRangeFrom = filter['@from'],
                    filterRangeTo = filter['@to'],
                    filterRangeCalendar = filter['@calendar'],
                    filterRangeValue = filter['@value'],
                    slider = filter['slider'] = (rSlider || false),
                    searchReplacment = false,
                    filter_index = -1,
                    hasFilter = false;

                for (var i = 0, l = $scope.selectedItems.length; i < l; i++) {
                    var obj = $scope.selectedItems[i];

                    if (obj['filterRangeFrom'] !== undefined && obj['filterRangeTo'] !== undefined) {
                        if (obj['facetName'] === facetName) {
                            if ((facetName === 'size' && obj['slider'] === slider) || facetName === 'lastmodified') {
                                searchReplacment = true;
                                filter_index = i;
                            }
                        }

                        if ((obj['filterName'] === filterName) && (obj['facetName'] === facetName)
                            && obj['filterRangeFrom'] === filterRangeFrom
                            && obj['filterRangeTo'] === filterRangeTo
                        ) {
                            hasFilter = true;
                        } else {
                            filters = filters + '&f.' + obj['facetName'] + '.filter=[' + obj['filterRangeFrom'] + 'TO' + obj['filterRangeTo'] + ']';
                        }
                    } else if (obj['filterRangeCalendar'] !== undefined && obj['filterRangeValue'] !== undefined) {
                        if ((obj['filterName'] === filterName) && (obj['facetName'] === facetName)
                            && obj['filterRangeCalendar'] === filterRangeCalendar
                            && obj['filterRangeValue'] === filterRangeValue
                        ) {
                            hasFilter = true;
                        } else {
                            filters = filters + '&f.' + obj['facetName'] + '.filter=[' + moment().subtract(obj['filterRangeCalendar'], obj['filterRangeValue']).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
                        }
                    } else {
                        if ((obj['filterName'] === filterName) && (obj['facetName'] === facetName)) {
                            hasFilter = true;
                        } else {
                            filters = filters + "&f." + obj['facetName'] + ".filter=" + obj['filterName'];
                        }
                    }
                }

                var newFilter = {};
                newFilter["id"] = $scope.selectedItems.size;
                newFilter['filterName'] = filterName;
                newFilter['facetName'] = facetName;
                newFilter['filterRangeFrom'] = filterRangeFrom;
                newFilter['filterRangeTo'] = filterRangeTo;
                newFilter['filterRangeCalendar'] = filterRangeCalendar;
                newFilter['filterRangeValue'] = filterRangeValue;
                newFilter['slider'] = slider;
                newFilter['pageNo'] = $scope.prevPage;
                $scope.prevPage = $scope.page;

                $scope.prepareFilters = function() {
                    if (!hasFilter || searchReplacment === true) {
                        if (filterRangeFrom !== undefined && filterRangeTo !== undefined) {
                            var rangeFilter = '';

                            if (searchReplacment) {
                                rangeFilter = '&f.' + facetName + '.filter=[' + filterRangeFrom + 'TO' + filterRangeTo + ']';
                            } else {
                                rangeFilter = filters + '&f.' + facetName + '.filter=[' + filterRangeFrom + 'TO' + filterRangeTo + ']';
                            }

                            $scope.filterFields = rangeFilter;
                        } else if (filterRangeCalendar !== undefined && filterRangeValue !== undefined) {
                            $scope.filterFields = filters + '&f.' + facetName + '.filter=[' + moment().subtract(filterRangeCalendar, filterRangeValue).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
                        } else {
                            $scope.filterFields = filters + "&f." + facetName + ".filter=" + filterName;
                        }

                        $scope.showInput = true;
                        if (searchReplacment === true && filter_index > -1) {
                            $scope.selectedItems[filter_index] = newFilter;
                        } else {
                            $scope.selectedItems.push(newFilter);
                        }
                    }
                };

                $scope.prepareFilters();
                $scope.doSearch();
            }

            // Function for removing filter
            $scope.removeItem = function (index) {
                var selected_object = $scope.selectedItems[index];
                $scope.page = selected_object['pageNo']
                $scope.selectedItems.splice(index, 1);
                var filters = "";
                for (var i = 0, l = $scope.selectedItems.length; i < l; i++) { // for(var obj in $scope.selectedItems){
                    var obj = $scope.selectedItems[i];
                    if (obj['filterRangeFrom'] !== undefined && obj['filterRangeTo'] !== undefined) {
                        filters = filters + '&f.' + obj['facetName'] + '.filter=[' + obj['filterRangeFrom'] + 'TO' + obj['filterRangeTo'] + ']';
                    }
                    else if (obj['filterRangeCalendar'] !== undefined && obj['filterRangeValue'] !== undefined) {
                        filters = filters + '&f.' + obj['facetName'] + '.filter=[' + moment().subtract(obj['filterRangeCalendar'], obj['filterRangeValue']).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
                    }
                    else {
                        filters = filters + "&f." + obj['facetName'] + ".filter=" + obj['filterName'];
                    }
                    // console.log("Remove Item In loop " + obj['filterName'] + " -- " + obj['facetName']);
                }
                $scope.filterFields = filters;
                $scope.doSearch();
            }

            /* CLEAR ALL FILTERS APPLIED */
            $scope.clearAllFilters = function(){
              $scope.selectedItems = [];
              $scope.filterFields = undefined;
              $scope.doSearch();
            }

            // Function for fetch page results. on clicking pagination button
            $scope.fetchPage = function (pageNo) {
                $scope.page = pageNo;
                $scope.prevPage = pageNo;
                $scope.doSearch();
            }

            $scope.displayPageNo = function(){
              var noOfPages = Math.ceil($scope.parsedSearchResults.found / $scope.dataMap['pageSize']);
              $scope.displayPageNoObj = {
                              	pageNoDisplay : 1,
                              	prev : 1,
                              	next : 6,
                                noOfPages : noOfPages
                              }
              var pageSet = Math.ceil(($scope.currentPage)/5);
              $scope.displayPageNoObj.pageNoDisplay = ((pageSet - 1)*5 + 1);
              if(pageSet == 1){
                $scope.displayPageNoObj.prev = 1;
              }
              else{
                $scope.displayPageNoObj.prev = ((pageSet - 2)*5 + 1);
              }
              if(pageSet == Math.ceil(noOfPages / 5)){
                $scope.displayPageNoObj.next = noOfPages;
              }
              else{
                $scope.displayPageNoObj.next = (pageSet*5 + 1);
              }

            }

            // check if there is atleast one filter in the facet
            $scope.hasFacets = function () {

                if ($scope.parsedSearchResults !== undefined && $scope.parsedSearchResults !== null
                    && $scope.parsedSearchResults.facets !== null) {

                    for (var i in $scope.parsedSearchResults.facets) {
                        //for (var i = 0, l = $scope.parsedSearchResults.facets.length; i < l; i++) {
                        var facet = $scope.parsedSearchResults.facets[i];
                        if (facet[facet['name']] !== undefined && facet[facet['name']] !== null
                            && facet[facet['name']][1] !== undefined && facet[facet['name']][1] !== null
                            && facet[facet['name']][1][0] !== undefined && facet[facet['name']][1][0] !== null) {
                            return true;
                        }
                    }
                }
                return false;
            }

            // check if there is atleast one filter in the facet
            $scope.hasInitAds = function () {
                if ($scope.parsedSearchResults !== undefined && $scope.parsedSearchResults !== null
                    && $scope.parsedSearchResults.showAds) {
                    if ($scope.parsedSearchResults.ads !== null && typeof($scope.parsedSearchResults.ads)!== "undefined" &&
                        $scope.parsedSearchResults.ads.length >= $scope.initAds){
                        return true;
                    }
                }
                return false;
            }

            $scope.hasMoreAds = function () {
                if ($scope.parsedSearchResults !== undefined && $scope.parsedSearchResults !== null
                    && $scope.parsedSearchResults.showAds) {
                    if ($scope.parsedSearchResults.ads !== null && typeof($scope.parsedSearchResults.ads)!== "undefined" &&
                        $scope.parsedSearchResults.ads.length > $scope.maxAdsLimit){
                        return true;
                    }
                }
                return false;
            }
}]);
