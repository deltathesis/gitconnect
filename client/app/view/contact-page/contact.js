angular.module('myApp.contact', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contact', {
  	authenticate: false,
    templateUrl: 'view/contact-page/contact.html',
    controller: 'contactCtrl'
  });
}])

.controller('contactCtrl', ['$scope', function($scope) {

  // Set default min height regarding screen height
  $('.page').css({
    'min-height': window.innerHeight - 40
  });

}]);