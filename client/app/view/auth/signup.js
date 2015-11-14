angular.module('myApp.signup', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/signup', {
  	authenticate: true,
    templateUrl: 'view/auth/signup.html',
    controller: 'SignupController',
  });
}])

.controller('SignupController', ['$scope', function($scope) {

}]);