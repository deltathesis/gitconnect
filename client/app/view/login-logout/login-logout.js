'use strict';

angular.module('myApp.login-logout', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'view/login-logout/login-logout.html',
    //controller: 'loginLogout',
  });
}])

.controller('loginLogout', ['$scope', function($scope) {

}]);