angular.module('myApp.connect', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/connect', {
  	authenticate: true,
    templateUrl: 'view/connect/connect.html',
    controller: 'connectCtrl',
    resolve: {
      //The view will not load until this promise is resolved.
      matches: ['User', function(User) {
        return User.getMatches();
      }],
      getProfile: ['$route', 'User', 'Cookie', '$cookies', function($route, User, Cookie, $cookies) {
        var cookie = $cookies.get('gitConnectDeltaKS');
        var cookieObj = Cookie.parseCookie(cookie);
        return User.getProfile(cookieObj.username);
      }]
    }
  });
}])

.directive('onFinishRender', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
}])

.controller('connectCtrl', ['$scope', 'matches', 'getProfile', '$http', function($scope, matches, getProfile, $http) {

  // get user information, disable if availabbility is false
  $scope.user = getProfile;
  console.log(getProfile);

  $scope.users = matches;
  console.log($scope.users)

  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
      $scope.swiper = new Swiper('.swiper-container', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflow: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows : true
        },
        // Navigation arrows
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        keyboardControl: true,
        // CallBack functions
        // Might define onInit if necessary
        onTransitionStart: function() {
          $('.developer-connect-details').fadeOut(200);
        },
        onTransitionEnd: function() {
          $('.developer-connect-details').fadeIn(300);
          var selectedUser = $('.swiper-slide-active').data('dev-id');
          var users = $scope.users;
          for (var i = 0; i < users.length; i++) {
            if (users[i].id === selectedUser) {
              $scope.selectedUser = users[i];
            }
          }
          $scope.$apply();
        },
      }); 
  });
  
  $scope.connectionRequest = function(index){
    $('.swiper-slide-active').addClass('requested');
    return $http({
      method: 'POST',
      url: '/api/user/connection-request',
      data: { currentUser: $scope.user, 
              selectedUser: $scope.selectedUser
            }
    }).then(function successCallback(response) {
        console.log('success')
    }, function errorCallback(response) {
      console.log('error: ', reponse);
    });
  }

}]);
