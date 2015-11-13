'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.header',
  'myApp.headerDirective',
  'myApp.footer',
  'myApp.footerDirective',
  'myApp.homepage',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'myApp.auth',
  'myApp.services'
])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'view/auth/login.html',
		controller: 'AuthController'
	})
	.otherwise({
		redirectTo: '/'
	});
}]);

