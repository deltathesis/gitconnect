angular.module('myApp.welcome', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/welcome', {
  	authenticate: false,
    templateUrl: 'view/welcome/welcome.html',
    controller: 'welcomeCtrl'
  });
}])

.controller('welcomeCtrl', ['$scope', function($scope) {
  // Initiate WOW effect for the Welcome page
  new WOW().init();
}]);