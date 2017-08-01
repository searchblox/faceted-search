/**
 * Created by cselvaraj on 7/10/14.
 * Directive for Advertisements
 */
angular.module('searchblox.adsItem', []).
    directive('adsItem', ['$compile', '$http', '$templateCache', '$sce', function ($compile, $http, $templateCache, $sce) {
        var getTemplate = function () {
            var templateLoader,
                baseUrl = 'views/component-templates/';

            var templateUrl = baseUrl + 'ads-top.html';//templateMap[contentType];
            templateLoader = $http.get(templateUrl, {cache: $templateCache});

            return templateLoader;
        }

        var linker = function (scope, element, attrs) {
            scope.$watch(function () {
                scope.url = scope.adv.contentUrl;
                scope.isImage = scope.adv.isImage;
            });

            var loader = getTemplate();

            var promise = loader.success(function (html) {
                element.html(html);
            }).then(function (response) {
                    element.replaceWith($compile(element.html())(scope));
                });
        }

        return {
            restrict: 'E',
            scope: {
                adv: '=',
                removeAds: '='
            },
            link: linker,
            controller: function ($scope) {
            }
        };
    }]);
