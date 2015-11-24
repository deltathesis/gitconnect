angular.module('myApp.projectpage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/project', {
    authenticate: true,
    templateUrl: 'view/project-page/project-page.html',
    controller: 'projectPage',
  });
}])

.controller('projectPage', ['$scope', '$cookies', 'Cookie', 'socket', function($scope, $cookies, Cookie, socket) {

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.username = cookieObj.username;
  $scope.currentTime;
  $scope.messages = [];

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
    languages: ['JavaScript', 'AngularJS', 'Sass', 'CSS', 'HTML', 'Firebase'],
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
  };

  $scope.project = project;

  $scope.increment = function(project, index){
    project.upVote += 1;
  }

  $scope.decrement = function(project, index){
    project.downVote += 1;
  }

  /** Socket Listeners **/

  socket.emit('initProject', $scope.username);

  // listen to initializer
  socket.on('initProject', function(data) {
    if(data) {
      $scope.messages = data.testRoom;
    }
  })

  //listens to sent message
  socket.on('send:projectMessage' , function(data) {
    $scope.messages.push(data);
  })

  $scope.messageSubmit = function(){
    if($scope.text){
    var currentTime = new Date();
      socket.emit('send:projectMessage', {
        message: $scope.text,
        date: currentTime
      })

   
      $scope.messages.push({
        username: $scope.username,
        message: $scope.text,
        date: currentTime
      });

      socket.emit('store:projectData', angular.copy({
        testRoom: $scope.messages
      }));

      $scope.text = "";
    }
  }

}]);