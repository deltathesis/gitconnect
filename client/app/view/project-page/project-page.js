angular.module('myApp.projectpage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/project/:id', {
    authenticate: true,
    templateUrl: 'view/project-page/project-page.html',
    controller: 'projectPage',
    resolve: {
      getProject: ['$route', 'Project', function($route, Project) {
        return Project.getInfos($route.current.params.id);
      }],
      getUsers: ['$route', 'Project', function($route, Project) {
        return Project.getUsers($route.current.params.id);
      }],
      getLanguages: ['$route', 'Project', function($route, Project) {
        return Project.getLanguages($route.current.params.id);
      }]
    }
  });
}])

.controller('projectPage', ['$scope', '$location', '$cookies', 'Cookie', 'socket', 'Project', '$rootScope', 'getProject', 'getUsers', 'getLanguages', 'ProjectList', function($scope, $location, $cookies, Cookie, socket, Project, $rootScope, getProject, getUsers, getLanguages, ProjectList) {

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  var id = cookieObj.id;

  $scope.username = cookieObj.username;
  $scope.avatar = cookieObj.avatar;
  $scope.currentTime;
  $scope.messages = [];
  $scope.collaborator = false;

  $scope.init = function() {
    $scope.projectInfo = getProject.project;
    $scope.myproject = getProject.project;
    console.log($scope.myproject);
    $scope.myproject.teams = getUsers.users;

    //Check to see if current user is collaborator
    $scope.myproject.teams.forEach(function(user){
      if(user.username === $scope.username){
        $scope.collaborator = true
      }
    })

    var techList = getLanguages.languages;

    socket.emit('initProject', {
      name: $scope.username,
      projectRoom: $scope.myproject.projectId
    });

    $scope.displayName = getOwnName();
    $scope.myproject.languages = [];

    techList.forEach(function(tech) {
      $scope.myproject.languages.push({
        name:tech.name,
        nameEncoded: encodeURIComponent(tech.name)
      });
    });
  }

  var getOwnName = function() {
    for(var i = 0; i < $scope.myproject.teams.length; i++) {
      if($scope.myproject.teams[i].username === $scope.username) {
        $scope.actualName = $scope.myproject.teams[i].name;
        return $scope.actualName + '(' + $scope.username + ')';
      }
    }
  }
  

  $scope.increment = function(project){
    ProjectList.vote(project.id, id, true)
      .then(function(data) {
        if (data.success) {
          project.upVote += 1;
        }
      });
  };

  $scope.decrement = function(project){
    ProjectList.vote(project.id, id, false)
      .then(function(data) {
        if (data.success) {
          project.downVote += 1;
        }
      });
  };

  /** Socket Listeners **/

  // listen to initializer
  socket.on('initProject', function(data) {
    if(data[$scope.myproject.projectId]) {
      $scope.messages = data[$scope.myproject.projectId];
    }
  })

  //listens to sent message
  socket.on('send:projectMessage' , function(data) {
    $scope.messages.push(data);
  })

  $scope.deleteProject = function(){
    $('#deleteProjectModal').modal('hide');
    Project.deleteProject(getProject.project.projectId).then(function(){
      $location.path('/my-projects')
    })
  }

  $scope.messageSubmit = function(){
    if($scope.text){
    var currentTime = new Date();
      socket.emit('send:projectMessage', {
        room: $scope.myproject.projectId,
        message: $scope.text,
        date: currentTime,
        name: $scope.displayName,
        avatar: $scope.avatar
      })

      $scope.messages.push({
        username: $scope.username,
        message: $scope.text,
        date: currentTime,
        avatar: $scope.avatar
      });
      
      var roomObj = {};
      roomObj[$scope.myproject.projectId] = $scope.messages;
      socket.emit('store:projectData', angular.copy(roomObj));

      $scope.text = "";
    }
  };

  $scope.displayPicture = function() {
    $('#picture-modal').modal('show');
  }

}]);