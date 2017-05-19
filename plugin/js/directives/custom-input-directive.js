/**
 * Created by cselvaraj on 4/29/14.
 */
/**
 * @ngdoc directive
 * @name customInput.directive:customInput
 *
 * @description
 * ngCustomInput is an Angular directive that renders an input box with autosuggestions
 * Used mbenford's example taken from JSFiddle. Also moved the functions from old code to here
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {boolean=true} addOnEnter Flag performs a search on pressing the ENTER key.
 *
 */
angular.module('searchblox.custominput',[])
    .directive('custominput', ["$interpolate", function ($interpolate) {
    function loadOptions(scope, attrs) {
        function getStr(name, defaultValue) {
            return attrs[name] ? $interpolate(attrs[name])(scope.$parent) : defaultValue;
        }

        function getBool(name, defaultValue) {
            var value = getStr(name, null);
            return value ? value === 'true' : defaultValue;
        }

        scope.options = {
            addOnEnter: getBool('addOnEnter', true)
        };
    }


    return {
        restrict: 'A,E',
        scope: { searchParam: '=ngModel', onsearch: '=', inputstyle:"=inputstyle", howmany: "&",howmanynofsuggest: "&", showAutoSuggest: "="},
        replace: false,
        transclude: true,
        template: '<div class="{{inputstyle.name}}"> <br>' +
            '         <div class="input-group input-group-lg">' +
            '            <input type="text" class="form-control border-radius-0 input-search" placeholder="Search Term" ng-model="searchParam" ng-change="newTagChange()" autofocus/>' +
            '             <div class="input-group-addon settings-image"> <span>' +
            '               <a data-toggle="dropdown" class="dropdown-toggle" href="#"> <img ng-src="images/settings.png"/>' +
              '               <ul class="dropdown-menu settings-dropdown">' +
              '                 <li><a href data-ng-click="partialMatch()" >partial match</a></li>' +
              '                 <li><a href data-ng-click="exactMatch()">exact match</a></li>' +
              '                 <li><a href data-ng-click="fuzzyMatch()">fuzzy match</a></li>' +
              '                 <li><a href data-ng-click="matchAll()">match all</a></li>' +
              '                 <li style="border-bottom:1px solid rgba(0, 0, 0, 0.2)"></li>' +
              '                 <li><a href data-ng-click="showAutoSuggest = !showAutoSuggest"><i class="fa fa-check" aria-hidden="true" ng-show="showAutoSuggest"></i>Autosuggest</a></li>' +
              '                 <li style="border-bottom:1px solid rgba(0, 0, 0, 0.2)"></li>' +
              '                 <li><a href="https://www.searchblox.com" target="_blank">Learn more</a></li>' +
              '                 <li style="border-bottom:1px solid rgba(0, 0, 0, 0.2)"></li>' +
              '                 <li><a href data-ng-click="howmany()">Results per page</a></li>' +
              '                 <li><a href data-ng-click="howmanynofsuggest()">Suggestions per page</a></li>' +
              '               </ul>' +
            '               </a>' +
            '              </span> </div>' +
            '            <div class="input-group-btn"> '+
            '               <button type="button" class="btn btn-primary border-radius-0"><i class="fa fa-search"></i></button>' +
            '            </div>' +
            '         </div>' +
            '<div ng-transclude></div>' +
            '</div>',
        controller: ["$scope", "$attrs", "$element", function ($scope, $attrs, $element) {
            loadOptions($scope, $attrs);
            // do search options
            $scope.partialMatch = function () {
                var newvals = $scope.searchParam.replace(/"/gi, '').replace(/\*/gi, '').replace(/\~/gi, '').split(' ');
                var newstring = "";
                for (var item in newvals) {
                    if (newvals[item].length > 0 && newvals[item] != ' ') {
                        if (newvals[item] == 'OR' || newvals[item] == 'AND') {
                            newstring += newvals[item] + ' ';
                        } else {
                            newstring += '*' + newvals[item] + '* ';
                        }
                    }
                }
                $scope.searchParam = newstring;
                $scope.onsearch();

            }

            $scope.fuzzyMatch = function () {
                var newvals = $scope.searchParam.replace(/"/gi, '').replace(/\*/gi, '').replace(/\~/gi, '').split(' ');
                var newstring = "";
                for (var item in newvals) {
                    if (newvals[item].length > 0 && newvals[item] != ' ') {
                        if (newvals[item] == 'OR' || newvals[item] == 'AND') {
                            newstring += newvals[item] + ' ';
                        } else {
                            newstring += newvals[item] + '~ ';
                        }
                    }
                }
                $scope.searchParam = newstring;
                $scope.onsearch();

            }
            $scope.exactMatch = function () {
                var newvals = $scope.searchParam.replace(/"/gi, '').replace(/\*/gi, '').replace(/\~/gi, '').split(' ');
                var newstring = "";
                for (var item in newvals) {
                    if (newvals[item].length > 0 && newvals[item] != ' ') {
                        if (newvals[item] == 'OR' || newvals[item] == 'AND') {
                            newstring += newvals[item] + ' ';
                        } else {
                            newstring += '' + newvals[item] + ' ';
                        }
                    }
                }
                $.trim(newstring, ' ');
                $scope.searchParam = "\"" + newstring + "\"";
                $scope.onsearch();


            }
            $scope.matchAll = function () {
                $scope.searchParam = $.trim($scope.searchParam.replace(/ OR /gi, ' '));
                $scope.searchParam = ($scope.searchParam.replace(/ /gi, ' AND '));
                $scope.onsearch();

            }
            $scope.matchAny = function () {
                $scope.searchParam = $.trim($scope.searchParam.replace(/ AND /gi, ' '));
                $scope.searchParam = $scope.searchParam.replace(/ /gi, ' OR ');
                $scope.searchParam.focus().trigger('keyup');
                $scope.onsearch();

            }

            $scope.newTagChange = angular.noop;

            this.getNewTagInput = function () {
                var input = $element.find('input');
                input.changeValue = function (value) {
                    $scope.searchParam = value;
                };

                input.change = function (handler) {
                    $scope.newTagChange = function () {
                        handler($scope.searchParam);
                    };
                };

                return input;
            };

        }],

        link: function (scope, element) {
            var hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace];
            var input = element.find('input');

            input.bind('keydown', function (e) {
                var key;

                if (hotkeys.indexOf(e.keyCode) === -1) {
                    return;
                }

                key = e.keyCode;
                if (key === KEYS.enter && scope.options.addOnEnter) {
                    scope.onsearch();


                }
            });
            element.find('div').bind('click', function () {
                input[0].focus();
            });



        }
    };
}]);
