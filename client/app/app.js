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
  'myApp.login-logout'
])

// .config(['$routeProvider', function($routeProvider) {
//   $routeProvider.otherwise({redirectTo: '/'});
// }])

;

