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

.controller('collaboration-page', ['$scope', '$cookies', 'Cookie', 'socket', 'getProjectInfo', 'getProjectUsers', '$uibModal', 'Project', '$location', '$rootScope', function($scope, $cookies, Cookie, socket, getProjectInfo, getProjectUsers, $uibModal, Project, $location, $rootScope) {

  var projectInfos = getProjectInfo.project;
  $scope.projectInfos = projectInfos;
  //store old project info for database lookup
  var oldProjectInfo = projectInfos
  console.log('project Info ', $scope.projectInfos);
  
  var projectUsers = getProjectUsers;
  $scope.projectUsers = projectUsers.users;

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.username = cookieObj.username;
  $scope.currentRoom = $scope.projectInfos.projectId;
  $scope.avatar = cookieObj.avatar;
  $scope.messages = [];
  $scope.currentTime;
  $scope.displayName;
  $scope.actualName;
  
  var getOwnName = function() {
    for(var i = 0; i < $scope.projectUsers.length; i++) {
      if($scope.projectUsers[i].username === $scope.username) {
        $scope.actualName = $scope.projectUsers[i].name;
        return $scope.actualName + '(' + $scope.username + ')';
      }
    }
  }

  $scope.displayName = getOwnName();

  // $scope.projectInfo = {
  //   name: 'GitConnect',
  //   description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  //   tech: ['HTML5', 'JavaScript', 'Firebase', 'MySql'],
  //   github_url: 'https://github.com/deltathesis/gitconnect'
  //   }

  // $scope.resources = {
  //   project_repo: 'https://github.com/deltathesis/gitconnect',
  //   scrum_board: 'https://trello.com/b/QNvGVucJ/gameplan',
  //   website: "",
  //   storage: "",
  //   database: "",
  //   code_library: ""
  // }


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

  $scope.deleteProject = function(){
    //projectInfos.projectId
    Project.deleteProject($scope.projectInfos.projectId);
  }

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

    modalInstance.result.then(function(obj){
      Project.updateProject(obj.updatedProjectInfo, oldProjectInfo, obj.techs, $scope.projectUsers[0].username, $scope.projectUsers[1].username);     
      $scope.projectInfos = obj.updatedProjectInfo;
      $rootScope.$broadcast('projectPublished')
      $location.path('/projects')
    })
  }

  /*******************MODAL to edit resources******************************/
  $scope.editResources = function(size){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'view/collaboration-page/resources.html',
      controller: 'editResources',
      size: size,
      resolve: {
        project: function(){
          return $scope.projectInfos
        }
      }
    });
    modalInstance.result.then(function(updatedResources){
      Project.updateProject(updatedResources, oldProjectInfo);
      $scope.projectInfos = updatedResources;
    })
  }

}])

.controller('publish', ['$scope', '$uibModal', 'techList', '$uibModalInstance', 'project', '$rootScope', function($scope, $uibModal, techList, $uibModalInstance, project, $rootScope){
  
  $scope.projectInfo = project
  $scope.techList = techList.getTechList();
  $scope.yourTechList = [];
  $scope.addTech = function(tech, index){
    if ($scope.yourTechList.indexOf(tech) !== -1) {
      $scope.techList.splice(index, 1);

      //remove the default null language if it exists
    } else if ($scope.yourTechList.indexOf('null') !== -1){
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
    // pass change published property to true, add published date and pass in list of languages used to previous controller to relate project node to those technologies
    var date = new Date();
    $scope.projectInfo.published = 'true';
    $scope.projectInfo.publishDate = date.getTime();



    var obj = {}
    obj.updatedProjectInfo = $scope.projectInfo;
    obj.techs = [];

    for(var i = 0; i < $scope.yourTechList.length; i++){
      obj.techs.push({name: $scope.yourTechList[i]});
    }

    $uibModalInstance.close(obj);

  }

  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  }
}])

.controller('editResources', ['$scope', '$uibModal', '$uibModalInstance', 'project', function($scope, $uibModal, $uibModalInstance, project){

  $scope.projectInfo = project;

  $scope.ok = function(){
    $uibModalInstance.close($scope.projectInfo);
  }

  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  }
}])

