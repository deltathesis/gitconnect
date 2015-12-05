angular.module('myApp.homepage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    authenticate: true,
    templateUrl: 'view/home/home.html',
    controller: 'homepage',
    resolve: {
      // Get user profile
      getNewsFeed: ['$route', 'newsfeed', 'Cookie', '$cookies', function($route, newsfeed, Cookie, $cookies) {
        var cookie = $cookies.get('gitConnectDeltaKS');
        var cookieObj = Cookie.parseCookie(cookie);
        return newsfeed.getNewsFeed(cookieObj.username);
      }]
    }
  });
}])

.controller('homepage', ['$scope', 'getNewsFeed', function($scope, getNewsFeed) {

  var user = getNewsFeed;
  $scope.news = user.news;

  $scope.hasDevAround = false;
  $scope.hasNewProjects = false;

  console.log($scope.news);

  if ($scope.news.people.length > 0) {
    $scope.hasDevAround = true;
    $scope.devAroundCount = $scope.news.people.length;
    $scope.devAround = $scope.news.people;
  }

  if ($scope.news.projects.length > 0) {
    var projectsFiltered = $scope.news.projects.slice();
    $scope.hasNewProjects = true;
    // Store Project ids
    var ids = [];

    for (var i = $scope.news.projects.length - 1; i >= 0; i--) {
      if (ids.indexOf($scope.news.projects[i].y.projectId) === -1) {
        ids.push($scope.news.projects[i].y.projectId);
      } else {
        projectsFiltered.splice(i, 1);
      }
    }
    $scope.newProjects = projectsFiltered;
  }


}]);