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

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

  $scope.init = function() {

    // Fix users display for mobile devices
    var documentWidth = $(document).width();
    // Check for mobile only
    if ( documentWidth < 768 ) {
      var listWidth = $('.developers-list').width();
      var devWidth = $('.developer').width();
      var devByRow = Math.floor(listWidth / 80);
      var elementMargin = (listWidth - ((devByRow) * 80)) / (devByRow - 1);
      // the the margin to the elements in the line
      $('.developers-list li').css('margin-right', elementMargin + 'px' );
      // Remove the right border on the last element in the line
      $('.developers-list li:nth-child('+devByRow+'n)').css('margin-right', '0px' );
   }

  }

  var user = getNewsFeed;
  $scope.news = user.news;

  $scope.hasDevAround = false;
  $scope.hasNewProjects = false;

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
