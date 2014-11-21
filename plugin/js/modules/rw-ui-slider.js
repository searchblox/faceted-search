/**
 * Created by Rw
 * Angular ui-slider based on jquery-ui slider
 * Dependency jquery, jquery-ui
 */

(function(angular) {
    'use strict';

    var app = angular.module('rw.ui-slider', []);

    app.directive('rwSlider', ['$compile', function($compile) {
        var s = {};

        s.require = '?ngModel';
        s.restrict = 'E';
        s.scope = {
            animate: '=?',
            distance: '=?',
            max: '=?',
            min: '=?',
            orientation: '=?',
            range: '=?',
            step: '=?',
            value: '=?',
            values: '=?',
            searchName: '=?',
            searchData: '=?',

            // callbacks
            change: '&?',
            slide: '&?',
            start: '&?',
            stop: '&?'
        };
        s.replace = true;
        s.template = '<div id="rw-slider"><div id="rw-slider-container"></div></div>'
        s.link = function(scope, elem, attrs, ng_model) {
            var options = {},
                defaults = {
                    animate: false,
                    distance: 0,
                    max: 100,
                    min: 0,
                    orientation: "horizontal",
                    range: false,
                    step: 1,
                    value: 0,
                    values: null
                };

            if (scope.range && scope.range.toString() === "true") {
                options.range = true;
            }

            if (scope.max && +scope.max) {
                options.max = scope.max;
            }

            if (scope.min && +scope.min) {
                options.min = +scope.min;
            }

            if (scope.searchData) {
                var propertyKeys = Object.keys(scope.searchData);
                var length = propertyKeys.length;
                var min = 0, max = 0;

                if (propertyKeys['from']) {
                    min = propertyKeys['from'];
                    max = propertyKeys['to'];
                } else {
                    min = scope.searchData[0]['from'];
                    max = scope.searchData[(length - 1)]['to'];
                    if (max === '*') {
                        max = scope.searchData[(length - 1)]['from'];
                    }
                }

                if (min === '*') {
                    min = 0;
                }

                if (String(max / 1024).indexOf('.') < 0) {
                    // max = max / 1024;
                }

                scope.min = bytesToSize(min, true);
                scope.max = bytesToSize(max, true);
                options.max = max;
            }

            if (scope.step && +scope.step) {
                options.step = +scope.step;
            }

            if (scope.values && angular.isArray(scope.values)) {
                options.values = scope.values;
                scope.kbValues = angular.copy(options.values);
            }

            angular.extend(defaults, options);

            options.slide = function(e, ui) {
                scope.$apply(function () {
                    scope.fromToTo = ui.values;
                    scope.kbValues = angular.copy(ui.values);
                    scope.kbValues[0] = bytesToSize(scope.kbValues[0], true);
                    scope.kbValues[1] = bytesToSize(scope.kbValues[1], true);
                });
            };

            options.stop = function() {
                if (scope.searchName) {
                    var obj = {};
                    obj['@from'] = scope.fromToTo[0];

                    if (obj['@from'] === 0) {
                        obj['@from'] = '*'
                    }

                    obj['@to'] = scope.fromToTo[1];

                    obj['@name'] = scope.kbValues.join(' to ');
                    scope.$parent.doSearchByFilter(obj, scope.searchName, true);
                }

                if (typeof scope.stop === 'function') {
                    scope.stop();
                }
            };

            var container = $(elem).find('#rw-slider-container');

            $(container).slider(options);
            var labelTmpl =
                '<div class="bottom5">' +
                    '<small>' +
                        '<span class="rw-from" ng-bind="kbValues[0]"></span>' +
                        ' - ' +
                        '<span class="rw-to" ng-bind="kbValues[1]"></span>' +
                    '</small>' +
                '</div>';
            $(elem).prepend($compile(labelTmpl)(scope));

            var toFromTmpl =
                '<div class="clearfix">' +
                    '<small>' +
                        '<span class="pull-left" ng-bind="min + \'KB\'"></span>' +
                        '<span class="pull-right" ng-bind="max"></span>' +
                    '</small>' +
                '</div>';
            $(elem).append($compile(toFromTmpl)(scope));
        };

        return s;
    }]);

    app.filter('firstCaseUpper', [function() {
        return function(input) {
                if (input) {
                    return input.charAt(0).toUpperCase() + input.slice(1);
                } else {
                    return '';
                }
            };
        }
    ]);

})(angular);
