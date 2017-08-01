/**
 * Created by cselvaraj on 4/29/14.
 */

'use strict';

var KEYS = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    up: 38,
    down: 40,
    comma: 188
};

angular.module('searchbloxModule', [
    'facetModule',
    'searchblox.controller',
    'searchblox.custominput',
    'searchblox.autocomplete',
    'searchblox.date',
    'searchblox.factory',
    'searchblox.trust',
    'searchblox.service',
    'ui.bootstrap',
    'ngRoute',
    'ngSanitize',
    'searchblox.contentItem',
    'searchblox.adsItem',
    'rw.ui-slider',
])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        title: 'SearchBlox Faceted Search',
        templateUrl: 'views/main.html',
        controller: 'searchbloxController'
    })
    .otherwise({
        redirecTo: '/'
    });

    $locationProvider.html5Mode(false);
}])
.run(['$rootScope', '$route', function($rootScope, $route) {
    $rootScope.ddate = new Date().getFullYear();

    $rootScope.$on('$routeChangeSuccess', function(oVal, nVal) {
        if (oVal !== nVal) {
            document.title = $route.current.title;
        }
    });
}]);
