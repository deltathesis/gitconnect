angular.module('myApp.legal', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/legal', {
  	authenticate: false,
    templateUrl: 'view/legal-page/legal.html',
    controller: 'legalCtrl'
  });
}])

.controller('legalCtrl', ['$scope', function($scope) {

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

}]);