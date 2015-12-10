// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngCookies',
  'myApp.header',
  'myApp.headerDirective',
  'myApp.footer',
  'myApp.footerDirective',
  'myApp.welcome',
  'myApp.homepage',
  'myApp.profilepage',
  'myApp.projectslist',
  'myApp.projectpage',
  'myApp.connect',
  'myApp.version',
  'myApp.auth',
  'myApp.services',
  'myApp.privateChat',
  'myApp.signup',
  'btford.socket-io',
  'myApp.collaboration-page',
  'myApp.requests',
  'myApp.subscription',
  'myApp.profileUpdate',
  'myApp.contact',
  'myApp.team',
  'myApp.legal',
  'myApp.techlistService',
  'myApp.requestsServices',
  'myApp.myProjectsList',
  'myApp.myConnections',
  'myApp.howToUse',
  'ui.bootstrap'
])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({
		redirectTo: '/'
	});
}])

.run(['$rootScope', '$location', 'Auth', '$window', function($rootScope, $location, Auth, $window) {

  $rootScope.location = $location;

  $rootScope.$on("$routeChangeStart", function(event, next, curr) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      console.log('Please login before visiting ' + next.$$route.originalPath);
      $location.path('/welcome');
    }
  });

  // Update analytics data
  $rootScope.$on('$routeChangeSuccess',function(event){
    if (!$window.ga) {
      return;
    }
    $window.ga('send', 'pageview', { page: $location.path() });
  });

}])

