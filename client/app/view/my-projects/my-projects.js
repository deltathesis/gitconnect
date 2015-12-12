angular.module('myApp.myProjectsList', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/my-projects', {
    authenticate: true,
    templateUrl: 'view/my-projects/my-projects.html',
    controller: 'myProjectsList',
    resolve: {
      getProfile: ['$route', 'User', 'Cookie', '$cookies', function($route, User, Cookie, $cookies) {
        var cookie = $cookies.get('gitConnectDeltaKS');
        var cookieObj = Cookie.parseCookie(cookie);
        // return User.getProfile(cookieObj.username);
        return User.getProfileAndRelations(cookieObj.username);
      }]
    }
  });
}])

.controller('myProjectsList', [
  '$scope','getProfile', 'socket', 'Cookie', '$cookies', 'UserConnection', '$window', '$rootScope', '$location', '$timeout', 'Project',
  function($scope, getProfile, socket, Cookie, $cookies, UserConnection, $window, $rootScope, $location, $timeout, Project) {

  var userInfos = getProfile;
  $scope.publishedProjects = [];
  $scope.inProgressProjects = [];

  if (userInfos.relationships.WORKED) {
    userInfos.relationships.WORKED.forEach(function(project){
      if(project.published === 'true'){
        $scope.publishedProjects.push(project)
      } else {
        $scope.inProgressProjects.push(project);
      }
    });
  }

  // Get User username
  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  var userUsername = cookieObj.username;

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

  $scope.deleteProject = function(projectId) {
    Project.deleteProject(projectId)
      .then(function() {
        $('.demands.' + projectId).slideUp();
      });
  };

}]);