angular.module('myApp.homepage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    authenticate: true,
    templateUrl: 'view/home/home.html',
    controller: 'homepage',
  });
}])

.controller('homepage', ['$scope', function($scope) {

}]);