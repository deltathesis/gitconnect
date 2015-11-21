angular.module('myApp.profilepage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/user/:name', {
    authenticate: true,
    templateUrl: 'view/profile-page/profile-page.html',
    controller: 'profilePage',
    resolve: {
      getProfile: ['$route', 'User', function($route, User) {
        return User.getProfile($route.current.params.name);
      }]
    }
  });
}])

.controller('profilePage', ['$scope', 'getProfile', function($scope, getProfile) {

  // var user = {
  //   picture: 'assets/pictures/users/royce.jpg',
  //   name: 'Royce Leung',
  //   memberDate: 1447797324755,
  //   ratings: Math.round(4.2),
  //   bio: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  //   projects: [
  //     {name:'Ballr', id:'123'},
  //     {name:'GitConnect', id:'987'},
  //     {name:'Foodly', id:'567'},
  //     {name:'InstaCutz', id:'0987'},
  //     {name:'Humus', id:'12883'}
  //   ],
  //   languages: ['JavaScript', 'AngularJS', 'Sass', 'CSS', 'HTML', 'Firebase']
  // }

  $scope.user = getProfile;
  $scope.user.ratings = Math.round(4.2); //dummy data

  $scope.ratings = function() {
    // Ratings Module
    $ratings = $('.stars');
    for (var pos = 0; pos < 5; pos++) {
      $ratings.append("<i class='fa fa-star-o position-" + pos + "'></i>");
    }
    for (var i = 0; i < $scope.user.ratings; i++) {
      $('.position-' + i).removeClass('fa-star-o').addClass('fa-star');
    }
  }

}]);