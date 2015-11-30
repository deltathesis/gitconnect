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

.controller('collaboration-page', ['$scope', '$cookies', 'Cookie', 'socket', 'getProjectInfo', 'getProjectUsers', '$uibModal', 'Project', function($scope, $cookies, Cookie, socket, getProjectInfo, getProjectUsers, $uibModal, Project) {

  var projectInfos = getProjectInfo.project;
  $scope.projectInfos = projectInfos;
  var oldProjectInfo = projectInfos
  
  var projectUsers = getProjectUsers;
  $scope.projectUsers = projectUsers.users;
  console.log('project: ', projectInfos)
  console.log('users: ', projectUsers);

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.username = cookieObj.username;
  $scope.currentRoom = $scope.projectInfos.projectId;
  $scope.actualName = cookieObj.displayName;
  $scope.displayName = cookieObj.displayName + '(' + $scope.username + ')';
  $scope.avatar = cookieObj.avatar;
  $scope.messages = [];

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

  socket.emit('initCollab', {
    name: $scope.username,
    collabRoom: $scope.projectInfos.projectId
  });

  // listen to initializer
  socket.on('initCollab', function(data) {
    if(data[$scope.currentRoom]) {
      $scope.messages = data[$scope.currentRoom];
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
        room: $scope.currentRoom,
        message: $scope.text,
        date: currentTime,
        name: $scope.displayName,
        avatar: $scope.avatar
      })

      $scope.messages.push({
        avatar: $scope.avatar,
        username: $scope.displayName,
        message: $scope.text,
        date: currentTime
      });

      var roomObj = {};
      roomObj[$scope.currentRoom] = $scope.messages;
      socket.emit('store:collabData', angular.copy(roomObj));

      $scope.text = "";
    }
  };

  // // Remove modal backdrop bug display
  // $scope.removeModal = function() {
  //   $('.modal-backdrop').remove();
  // }

  /***********************MODALS to publish your project ***************************/

  $scope.publish = function(size){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'view/collaboration-page/projectForm.html',
      controller: 'publish',
      resolve: {
        project: function(){
          return $scope.projectInfos
        }
      },
      size: size
    });

    modalInstance.result.then(function(projectInformation){
      console.log('project info: ', projectInformation);
      Project.updateProject(projectInformation, oldProjectInfo);
    })
  }

}])

.controller('publish', ['$scope', '$uibModal', 'techList', '$uibModalInstance', 'project', function($scope, $uibModal, techList, $uibModalInstance, project){
  
  $scope.projectInfo = project
  $scope.techList = techList.getTechList();
  $scope.yourTechList = $scope.projectInfo.codeLibrary.split(',');
  $scope.addTech = function(tech, index){
    if ($scope.yourTechList.indexOf(tech) !== -1) {
      $scope.techList.splice(index, 1);
    } else if ($scope.yourTechList.indexOf('null') !== -1){
      //remove the default null language if it exists
      $scope.yourTechList.splice($scope.yourTechList.indexOf('null'), 1) 
    } else {
      $scope.yourTechList.push(tech);
      $scope.techList.splice(index, 1);
      $scope.searchText = '';
    }
  };
  $scope.removeTech = function(tech, index) {
    $scope.techList.push(tech); 
    $scope.yourTechList.splice(index, 1);  
  };


  $scope.ok = function(){
    $scope.projectInfo.codeLibrary = $scope.yourTechList.toString();
    $scope.projectInfo.published = 'true';
    $scope.projectInfo.publishDate = new Date();
    $uibModalInstance.close($scope.projectInfo);
  }
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  }
}]);

