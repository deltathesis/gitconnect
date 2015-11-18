angular.module('myApp.projectpage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/project', {
    authenticate: true,
    templateUrl: 'view/project-page/project-page.html',
    controller: 'projectPage',
  });
}])

.controller('projectPage', ['$scope', function($scope) {

  var project = {
    thumbnail: 'assets/pictures/projects-thumbnails/koti.jpg',
    github: 'http://www.github.com',
    name: 'Koti',
    publishDate: 1447797324755,
    commentCount: 25,
    upVote: 48,
    downVote: 12,
    shortDesc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    teams: [
      {name:'Royce', id:'123', picture:'assets/pictures/users/royce.jpg'},
      {name:'Renan', id:'987', picture:'assets/pictures/users/renan.jpg'},
      {name:'Chris', id:'567', picture:'assets/pictures/users/chris.jpg'},
      {name:'Jake', id:'0987', picture:'assets/pictures/users/jake.jpg'}
    ],
    picture: 'assets/pictures/projects/koti.jpg',
    languages: ['Javascript', 'Angular', 'Sass', 'CSS', 'HTML5', 'Firebase'],
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
  };

  $scope.project = project;

  $scope.increment = function(project, index){
    project.upVote += 1;
  }

  $scope.decrement = function(project, index){
    project.downVote += 1;
  }

  var comments = [
    {
      thumbnail: 'assets/pictures/users/chris.jpg',
      user: 'chris',
      publishDate: 1447797324755,
      message: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      thumbnail: 'assets/pictures/users/royce.jpg',
      user: 'royce',
      publishDate: 1447737324755,
      message: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      thumbnail: 'assets/pictures/users/yumo.jpg',
      user: 'yumo',
      publishDate: 1447297324755,
      message: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
  ]

  $scope.comments = comments;

}]);