angular.module('myApp.requests', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/requests', {
    authenticate: true,
    templateUrl: 'view/requests/requests.html',
    controller: 'requestsPage',
  });
}])

.controller('requestsPage', ['$scope', function($scope) {

  var usersRequest = [
    {
      picture: 'assets/pictures/users/royce.jpg',
      name: 'Royce Leung',
      requestedDate: 1447797324755,
      ratings: Math.round(4.2),
      languages: ['Javascript', 'Angular', 'Sass', 'CSS', 'HTML5', 'Firebase']
    },
    {
      picture: 'assets/pictures/users/renan.jpg',
      name: 'Renan Deswarte',
      requestedDate: 1447897324755,
      ratings: Math.round(3.2),
      languages: ['Javascript', 'Backbone', 'Stylus', 'MongoDB', 'HTML5', 'Socket.io']
    },
    {
      picture: 'assets/pictures/users/yumo.jpg',
      name: 'Yusuf Modan',
      requestedDate: 1442797324755,
      ratings: Math.round(4.8),
      languages: ['Javascript', 'React', 'React Native', 'Jasmine', 'Neo4J', 'Firebase', 'Grunt']
    },
    {
      picture: 'assets/pictures/users/chris.jpg',
      name: 'Chris Nixon',
      requestedDate: 1427797324755,
      ratings: Math.round(4.1),
      languages: ['Javascript', 'Angular', 'Neo4J', 'CSS', 'Protractor']
    },
    {
      picture: 'assets/pictures/users/jake.jpg',
      name: 'Jake Garelick',
      requestedDate: 1447197324755,
      ratings: Math.round(4.9),
      languages: ['Javascript', 'Angular', 'Backbone', 'Gulp', 'Less', 'CSS', 'HTML5', 'Postgres']
    }
  ];

  var usersDemand = [
    {
      picture: 'assets/pictures/users/renan.jpg',
      name: 'Renan Deswarte',
      requestedDate: 1447897324755,
      ratings: Math.round(3.2),
      languages: ['Javascript', 'Backbone', 'Stylus', 'MongoDB', 'HTML5', 'Socket.io']
    },
    {
      picture: 'assets/pictures/users/yumo.jpg',
      name: 'Yusuf Modan',
      requestedDate: 1442797324755,
      ratings: Math.round(4.8),
      languages: ['Javascript', 'React', 'React Native', 'Jasmine', 'Neo4J', 'Firebase', 'Grunt']
    },
    {
      picture: 'assets/pictures/users/jake.jpg',
      name: 'Jake Garelick',
      requestedDate: 1447197324755,
      ratings: Math.round(4.9),
      languages: ['Javascript', 'Angular', 'Backbone', 'Gulp', 'Less', 'CSS', 'HTML5', 'Postgres']
    },
    {
      picture: 'assets/pictures/users/royce.jpg',
      name: 'Royce Leung',
      requestedDate: 1447797324755,
      ratings: Math.round(4.2),
      languages: ['Javascript', 'Angular', 'Sass', 'CSS', 'HTML5', 'Firebase']
    },
    {
      picture: 'assets/pictures/users/chris.jpg',
      name: 'Chris Nixon',
      requestedDate: 1427797324755,
      ratings: Math.round(4.1),
      languages: ['Javascript', 'Angular', 'Neo4J', 'CSS', 'Protractor']
    }
  ]

  $scope.usersRequest = usersRequest;
  $scope.usersDemand = usersDemand;

}]);