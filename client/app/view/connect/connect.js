angular.module('myApp.connect', ['ngRoute', 'ui.bootstrap'])

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
        // return User.getProfile(cookieObj.username);
        return User.getProfileAndRelations(cookieObj.username);

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

.controller('connectCtrl', ['$scope', 'matches', 'getProfile', '$http', 'availabilityToggle', '$window', 'Cookie', '$cookies', 'socket', 'techList', '$rootScope', function($scope, matches, getProfile, $http, availabilityToggle, $window, Cookie, $cookies, socket, techList, $rootScope) {

  // get user information, disable if availabbility is false
  $scope.user = getProfile;
  console.log(getProfile);

  $scope.users = matches;
  console.log($scope.users);

  $scope.skills = ["JavaScript", "CSS", "Python", "Rails", "Django", "Firebase"]

  $scope.selections = [];

  // Set default user address to the form
  if ($scope.user.relationships.Lives) {
    $('#city-input').val($scope.user.relationships.Lives[0].city)
  }

  // Check availability status on page render
  $scope.statusCheck = function() {
    $scope.availability = JSON.parse($scope.user.user.availability);
  }

  $scope.techList = [];
  var techs = techList.getTechList();
  techs.forEach(function(element) {
    $scope.techList.push(element);
  })

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

  $scope.connectionRequest = function(){
    $('.swiper-slide-active').addClass('requested');
    return $http({
      method: 'POST',
      url: '/api/user/connection-request',
      data: { currentUser: $scope.user.user, 
              selectedUser: $scope.selectedUser
            }
    }).then(function successCallback(response) {
        socket.emit('notify:potentialFriend', {
          target: angular.copy($scope.selectedUser.username), currentUser: angular.copy($scope.user.user.username)
        });
        console.log('success')
    }, function errorCallback(response) {
      console.log('error: ', reponse);
    });
  };

  $scope.addFilter = function(tech, index) {
    $scope.selections.push(tech); 
    $scope.techList.splice(index, 1);
    $scope.searchText = '';
  }

  $scope.removeFilter = function(tech, index) {
    $scope.techList.push(tech); 
    $scope.selections.splice(index, 1);  
  }

  $scope.availabilityOn = function(val) {
    var cookie = $cookies.get('gitConnectDeltaKS');
    var cookieObj = Cookie.parseCookie(cookie);
    $scope.dataAvailability = {
      username: cookieObj.username,
      availability: "true"
    }

    // check if user is already into project
    $rootScope.$broadcast('hasProjectCheck');
  }
  
  // Get project status result and set availability 
  $rootScope.$on('hasProjectCheckReturn', function(event, hasProject) {

    if (hasProject) {
      $('#availabilityInfo').modal('show');
    } else {
      var cookie = $cookies.get('gitConnectDeltaKS');
      var cookieObj = Cookie.parseCookie(cookie);
      availabilityToggle.changeAvailability($scope.dataAvailability);
      // Update cooking value
      cookieObj.availability = "true";
      $cookies.put('gitConnectDeltaKS', JSON.stringify(cookieObj));
      //refresh to apply cookie to the view
      $window.location.reload();
    }
  });

  $scope.availabilityOff = function() {
    var cookie = $cookies.get('gitConnectDeltaKS');
    var cookieObj = Cookie.parseCookie(cookie);
    var data = {
      username: cookieObj.username,
      availability: "false"
    }
    availabilityToggle.changeAvailability(data);

    // Update cooking value
    cookieObj.availability = "false";
    $cookies.put('gitConnectDeltaKS', JSON.stringify(cookieObj));
    //refresh to apply cookie to the view
    $window.location.reload();
  };

  $scope.googleMapInit = function() {
    // google.maps.event.addDomListener(window, 'load', addressInitialize);
    addressInitialize();
  };

  $scope.applyFilters = function(){
    $('#filters').modal('show');
  }

  $scope.submitFilters = function(){
    $('#filters').modal('hide');
    return $http({
      method: 'POST',
      url: '/api/user/:name/matches',
      data: {
        filters: $scope.selections,
        username: $scope.user.user.username
      }
    }).then(function successCallback(response) {
      $scope.users = response.data.matches;
    }, function errorCallback(response) {
      console.log('error: ', response);
    });
  }

  function addressInitialize() {
    var input = document.getElementById('city-input');
    var autocomplete = new google.maps.places.Autocomplete(input, {types: ['(cities)']});
    autocomplete.addListener('place_changed', function() {
      // Get city name only
      var place = autocomplete.getPlace();
      console.log(place.name, place.place_id);

      cityId = place.place_id;
      cityName = place.name;
      // $('#user-location').val(place.name);
    });
  }

}]);
