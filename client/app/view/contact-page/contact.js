angular.module('myApp.contact', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contact', {
  	authenticate: false,
    templateUrl: 'view/contact-page/contact.html',
    controller: 'contactCtrl',
  });
}])

.controller('contactCtrl', ['$scope', '$http', function($scope, $http) {

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

  $scope.msgSent = false;

  $scope.messageSending = function() {
    $scope.msgSent = true;
    var messageData =  {
      email: $scope.email,
      subject: $scope.subject,
      message: $scope.message
    }
    return $http({
      method: 'POST',
      url: '/api/contactmessage',
      data: messageData
    }).then(function successCallback(response) {
        // console.log('message sent');
    }, function errorCallback(response) {
      console.log('error: ', response);
    });
  };

}]);