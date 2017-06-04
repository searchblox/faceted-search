angular.module('searchblox.date', [])
.directive('datePicker', function(){
  return{
    restrict: "E",
    scope: {
      doSearchByFilter: '&'
    },
    template: '<label>From :</label>'+
              '<div class="input-group padding-5">'+
              '   <span class="input-group-addon"><i class="fa fa-calendar" aria-hidden="true"></i></span>'+
              '   <input type="text" class="form-control datepicker" ng-model="customstart" id="custom_start" ng-value="{{customstart}}"/>'+
              '</div>'+
              '<label>To :</label>'+
              '<div class="input-group padding-5">'+
              '  <span class="input-group-addon"><i class="fa fa-calendar" aria-hidden="true"></i></span>'+
              '  <input type="text" class="form-control datepicker" ng-model="customend" id="custom_end"/>'+
              '</div>'+
              '<button class="btn btn-primary margin-5" ng-click="customfilter()">GO</button>',
    link: function(scope, element, attrs, modelCtrl){
      scope.customstart = moment().subtract('days', 1).format("YYYY-MM-DD");
      scope.customend = moment().format("YYYY-MM-DD");
      jQuery(".datepicker").datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function() {
          if(this.id == 'custom_start'){
            scope.customstart = this.value;
          }
          if(this.id == 'custom_end'){
            scope.customend = this.value;
          }
        }
      });

      scope.customfilter = function(){
        if(scope.customstart > scope.customend){
          alert("From Date must be less than To Date");
          return;
        }
        var filtervalue = {
          '@calender': 'days',
          '@from': moment(scope.customstart).format('YYYY-MM-DDThh:mm:ss'),
          '@to': moment(scope.customend).format('YYYY-MM-DDThh:mm:ss'),
          '@name': 'custom',
          'slider': false
        }
        scope.doSearchByFilter({filter: filtervalue, field: 'lastmodified'});
      }
    }
  }
});
