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
  'myApp.groupChat',
  'myApp.version',
  'myApp.auth',
  'myApp.services',
  'myApp.privateChat',
  'myApp.signup',
  'btford.socket-io',
  'myApp.collaboration-page',
  'myApp.requests',
  'myApp.subscription',
  'myApp.contact',
  'myApp.team',
  'myApp.legal',
])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({
		redirectTo: '/'
	});
}])

.run(['$rootScope', '$location', 'Auth', function($rootScope, $location, Auth) {

  $rootScope.$on("$routeChangeStart", function(event, next, curr) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      console.log('Please login before visiting ' + next.$$route.originalPath);
      $location.path('/welcome');
    }
  });

}])

