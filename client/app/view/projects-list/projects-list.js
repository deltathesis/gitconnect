angular.module('myApp.projectslist', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/projects', {
    authenticate: true,
    templateUrl: 'view/projects-list/projects-list.html',
    controller: 'projectsPage',
    resolve: {
      projects: ['ProjectList', function(ProjectList) {
        return ProjectList.getProjects();
      }]
    }
  });
}])

.controller('projectsPage', ['$scope', '$location', 'projects', 'ProjectList', '$cookies', 'Cookie', function($scope, $location, projects, ProjectList, $cookies, Cookie) {

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

  $scope.tab = 'newest';

  $scope.projects = projects;
  console.log($scope.projects);

  var id = Cookie.parseCookie($cookies.get('gitConnectDeltaKS')).id;

  $scope.increment = function(project, index){
    console.log('increment')
    ProjectList.vote($scope.projects[index].id, id, true)
      .then(function(data) {
        if (data.success) {
          project.upVote += 1;
        }
      });
  };

  $scope.projectPageRedirect = function(projectId){
    $location.path('/project/' + projectId)
  }

  $scope.decrement = function(project, index){
    ProjectList.vote($scope.projects[index].id, id, false)
      .then(function(data) {
        if (data.success) {
          project.downVote += 1;
        }
      });
  };

  $scope.orderByFn = function() {
    return $scope.tab === 'newest' ? '-publishDate' : '-upVote';
  };

}])

.filter('weeklyFilter', function() {
  return function(input, weekly) {
    return input.filter(function(node) {
      if (!weekly) return true;
      return new Date().getTime() - node.publishDate <= 604800000;
    });
  };
});