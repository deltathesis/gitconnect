angular.module('myApp.contact', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contact', {
  	authenticate: false,
    templateUrl: 'view/contact-page/contact.html',
    controller: 'contactCtrl'
  });
}])

.controller('contactCtrl', ['$scope', function($scope) {

}]);