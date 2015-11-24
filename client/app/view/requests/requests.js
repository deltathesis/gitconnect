angular.module('myApp.requests', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/requests', {
    authenticate: true,
    templateUrl: 'view/requests/requests.html',
    controller: 'requestsPage',
    resolve: {
      getUserDemands: ['userRequests', function(userRequests) {
          return userRequests.getDemands();
      }],
      getUserRequests: ['userRequests', function(userRequests) {
          return userRequests.getRequests();
      }]
    }
  });
}])

.controller('requestsPage', ['$scope', 'getUserDemands', 'getUserRequests', 'socket', function($scope, getUserDemands, getUserRequests, socket) {

  var userDemands = getUserDemands;
  // console.log('demands: ',userDemands);
  var usersRequest = getUserRequests;
  // console.log('requests: ',usersRequest);

  $scope.usersRequest = usersRequest;
  $scope.userDemands = userDemands;



  $scope.ratings = function(ratings, index, type) {
    // Ratings Module
    index++;
    $ratings = $('.user-details.' + type + ':nth-child(' + index + ') .stars');
    for (var pos = 0; pos < 5; pos++) {
      $ratings.append("<i class='fa fa-star-o position-" + pos + "'></i>");
    }
    for (var i = 0; i < ratings; i++) {
      $('.user-details.' + type + ':nth-child(' + index + ') .position-' + i).removeClass('fa-star-o').addClass('fa-star');
    }
  }

}]);