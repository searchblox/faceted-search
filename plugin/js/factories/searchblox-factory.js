/**
 * Created by cselvaraj on 4/29/14.
 */

// FACTORY
angular.module('searchblox.factory',[]).factory('searchbloxFactory', ['$rootScope', '$http', function ($rootScope, $http) {
    var searchFactory = new Object();
    searchFactory.getResponseData = function (urlParams) {
        var promise = $http.get(urlParams).success(function (data, status) {
            return data;
        }).error(function (data, status) {
                return status;
            });
        return promise;

    };
    return searchFactory;
}]);
