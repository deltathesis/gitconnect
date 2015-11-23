angular.module('myApp.legal', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/legal', {
  	authenticate: false,
    templateUrl: 'view/legal-page/legal.html',
    controller: 'legalCtrl'
  });
}])

.controller('legalCtrl', ['$scope', function($scope) {

}]);