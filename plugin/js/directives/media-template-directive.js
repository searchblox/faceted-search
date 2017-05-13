/**
 * Created by cselvaraj on 5/7/14.
 */

angular.module('searchblox.contentItem', []).
    directive('contentItem', ['$compile', '$http', '$templateCache','$sce', function($compile, $http, $templateCache, $sce) {

        var getTemplate = function(contentType) {
            var templateLoader,
                baseUrl = 'views/component-templates/',
                templateMap = {
                    image: 'image.html',
                    video: 'video.html',
                    href: 'href.html'
                };

            var templateUrl = baseUrl + templateMap[contentType];
            templateLoader = $http.get(templateUrl, {cache: $templateCache});

            return templateLoader;

        }

        var linker = function(scope, element, attrs) {
            scope.$watch(function () {
                if (scope.content.contentUrl && scope.content.contentNature == "video") {
                    scope.url = $sce.trustAsResourceUrl(scope.content.contentUrl);
                }
                else {
                    scope.url = scope.content.contentUrl;
                }
            });

            var loader = getTemplate(scope.content.contentNature);

            var promise = loader.success(function(html) {
                element.html(html);
            }).then(function (response) {
                    element.replaceWith($compile(element.html())(scope));
                });
        }

        return {
            restrict: 'E',
            scope: {
                content:'='
            },
            link: linker,
            controller: function ($scope) {

                $scope.getLastModified = function (lastmodified) {
                    return moment(lastmodified).format("MMM DD, YYYY");
                }

                $scope.formatData = function (obj) {
                    if (!angular.isArray(obj))
                        return [obj];
                    else
                        return obj;
                }
            }
        };
    }]);
