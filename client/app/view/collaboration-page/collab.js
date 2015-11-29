angular.module('myApp.collaboration-page', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collaboration-page/:id', {
    authenticate: true,
    templateUrl: 'view/collaboration-page/collab.html',
    controller: 'collaboration-page',
    resolve: {
      getProjectInfo: ['$route', 'Project', function($route, Project) {
          return Project.getInfos($route.current.params.id);
      }],
      getProjectUsers: ['$route', 'Project', function($route, Project) {
          return Project.getUsers($route.current.params.id);
      }]
    }
  });
}])

.controller('collaboration-page', ['$scope', '$cookies', 'Cookie', 'socket', 'getProjectInfo', 'getProjectUsers', function($scope, $cookies, Cookie, socket, getProjectInfo, getProjectUsers) {

  var projectInfos = getProjectInfo.project;
  $scope.projectInfos = projectInfos;
  
  var projectUsers = getProjectUsers;
  $scope.projectUsers = projectUsers.users;
  console.log('project', projectInfos)
  console.log('users', projectUsers);

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.username = cookieObj.username;
  console.log($scope.username);

  $scope.projectInfo = {
    name: 'GitConnect',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    tech: ['HTML5', 'JavaScript', 'Firebase', 'MySql'],
    github_url: 'https://github.com/deltathesis/gitconnect'
    }

  $scope.resources = {
    project_repo: 'https://github.com/deltathesis/gitconnect',
    scrum_board: 'https://trello.com/b/QNvGVucJ/gameplan',
    website: "",
    storage: "",
    database: "",
    code_library: ""
  }

  $scope.messages = [];

  $scope.currentTime;

  /** Socket Listeners **/

  socket.emit('initCollab', $scope.username);

  // listen to initializer
  socket.on('initCollab', function(data) {
    if(data) {
      $scope.messages = data.testRoom;
    }
  })

  //listens to sent message
  socket.on('send:collabMessage' , function(data) {
    $scope.messages.push(data);
  })

  $scope.messageSubmit = function(){
    if($scope.text){
    var currentTime = new Date();
      socket.emit('send:collabMessage', {
        message: $scope.text,
        date: currentTime
      })

      $scope.messages.push({
        username: $scope.username,
        message: $scope.text,
        date: currentTime
      });

      socket.emit('store:collabData', angular.copy({
        testRoom: $scope.messages
      }));

      $scope.text = "";
    }
  };

  // // Remove modal backdrop bug display
  // $scope.removeModal = function() {
  //   $('.modal-backdrop').remove();
  // }

}]);
