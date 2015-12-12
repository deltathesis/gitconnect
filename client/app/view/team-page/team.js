angular.module('myApp.team', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/team', {
  	authenticate: false,
    templateUrl: 'view/team-page/team.html',
    controller: 'teamCtrl'
  });
}])

.controller('teamCtrl', ['$scope', function($scope) {

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

  $scope.team = [
    {
      name: 'Renan Deswarte',
      role: 'Product Owner & Frontend Engineer',
      picture: 'https://avatars2.githubusercontent.com/u/10079250',
      github: 'https://github.com/renandeswarte'
    },
    {
      name: 'Royce Leung',
      role: 'Scrum Master & Software Engineer',
      picture: 'https://avatars3.githubusercontent.com/u/7980073',
      github: 'https://github.com/xrkl2x'
    },
    {
      name: 'Chris Nixon',
      role: 'Software Engineer',
      picture: 'https://avatars3.githubusercontent.com/u/12958606',
      github: 'https://github.com/ccnixon'
    },
    {
      name: 'Jake Garelick',
      role: 'Software Engineer',
      picture: 'https://avatars3.githubusercontent.com/u/13770733',
      github: 'https://github.com/jakegarelick'
    },
    {
      name: 'Yusuf Modan',
      role: 'Software Engineer',
      picture: 'https://avatars3.githubusercontent.com/u/13246305',
      github: 'https://github.com/yusufmodan'
    }
  ];

}]);