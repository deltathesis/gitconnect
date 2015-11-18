angular.module('myApp.projectslist', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/projects', {
    authenticate: true,
    templateUrl: 'view/projects-list/projects-list.html',
    controller: 'projectsPage',
  });
}])

.controller('projectsPage', ['$scope', function($scope) {

  var projects = [
    {
      thumbnail: 'assets/pictures/projects-thumbnails/koti.jpg',
      name: 'Koti',
      publishDate: 1447797324755,
      commentCount: 25,
      upVote: 328,
      downVote: 12,
      shortDesc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      teams: [
        {name:'Royce', id:'123', picture:'assets/pictures/users/royce.jpg'},
        {name:'Renan', id:'987', picture:'assets/pictures/users/renan.jpg'},
        {name:'Chris', id:'567', picture:'assets/pictures/users/chris.jpg'},
        {name:'Jake', id:'0987', picture:'assets/pictures/users/jake.jpg'}
      ],
      picture: 'assets/pictures/projects/koti.jpg',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
      thumbnail: 'assets/pictures/projects-thumbnails/fetch.jpg',
      name: 'Fetch',
      publishDate: 1447797324755,
      commentCount: 3,
      upVote: 28,
      downVote: 2,
      shortDesc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      teams: [
        {name:'Yumo', id:'123', picture:'assets/pictures/users/yumo.jpg'},
        {name:'Renan', id:'987', picture:'assets/pictures/users/renan.jpg'},
        {name:'Chris', id:'567', picture:'assets/pictures/users/chris.jpg'}
      ],
      picture: 'assets/pictures/projects/fetch.jpg',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    }
  ];

  $scope.projects = projects;

}]);