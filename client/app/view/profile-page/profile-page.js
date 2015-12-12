angular.module('myApp.profilepage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/user/:name', {
    authenticate: true,
    templateUrl: 'view/profile-page/profile-page.html',
    controller: 'profilePage',
    resolve: {
      getProfile: ['$route', 'User', function($route, User) {
        return User.getProfileAndRelations($route.current.params.name);
      }]
    }
  });
}])

.directive('ratingMouseover', function() {
  return {
    link: function(scope, el, attrs) {
      el.on('mouseenter', function() {
        if (scope.rated) return;
        for (var i = 0; i < 5; i++) {
          $('.position-' + i).removeClass('fa-star').addClass('fa-star-o');
        }
        for(var j = 0; j <= attrs.idx; j++) {
          $('.position-' + j).removeClass('fa-star-o').addClass('fa-star');
        }
      });
      el.on('mouseleave', function() {
        if (scope.rated) return;
        for (var l = 0; l < 5; l++) {
          $('.position-' + l).removeClass('fa-star').addClass('fa-star-o');
        }
        for (var k = 0; k < scope.averageRatings; k++) {
          $('.position-' + k).removeClass('fa-star-o').addClass('fa-star');
        }
      });  
    }
  };
})

.controller('profilePage', [
  '$scope', '$compile', 'getProfile', 'Cookie', '$cookies', 'availabilityToggle', '$window', 'userOwnTech', '$http', '$rootScope', 'socket', '$location', 'User',
  function($scope, $compile, getProfile, Cookie, $cookies, availabilityToggle, $window, userOwnTech, $http, $rootScope, socket, $location, User) {

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.ratingBool = 0;

  User.getProfileAndRelations(cookieObj.username).then(function(data) {
    $scope.cookieUser = data;
  })

  $scope.init = function() {  
      $scope.user = getProfile;

      $scope.averageRatings =$scope.user.ratingTotal / $scope.user.ratings;
      $scope.averageRatings = Math.round($scope.averageRatings * 10) / 10;

      // Updated User Tech list display
      var techList = userOwnTech.getTech();
      if (techList.length !== 0) {
        $scope.user.languages = [];
        techList.forEach(function(tech) {
          $scope.user.languages.push({
            name:tech,
            nameEncoded: encodeURIComponent(tech)
          });
        });
      } else {
        $scope.user.languages = [];
        if($scope.user.relationships.KNOWS){
          $scope.user.relationships.KNOWS.forEach(function(tech) {
            $scope.user.languages.push({
              name:tech.name,
              nameEncoded: encodeURIComponent(tech.name)
            });
          });
        }
      }

      // Updated User Location display
      var userLocation = userOwnTech.getAddress();
      if (userLocation !== '') {
        $scope.user.location = userLocation;
      } else {
        $scope.user.location = $scope.user.relationships.Lives[0].city;
      }

      // Updated User Bio display
      var userBio = userOwnTech.getBio();
      if (userBio !== '') {
        $scope.user.bio = userBio;
      } else {
        $scope.user.bio = $scope.user.bio;
      }

      // Updated User Full Name
      var userFullName = userOwnTech.getFullName();
      if (userFullName !== '') {
        $scope.user.name = userFullName;
      } else {
        $scope.user.name = $scope.user.name;
      }

      // Get user projects
      $scope.user.projects = []
      if ($scope.user.relationships.WORKED) {
        $scope.user.relationships.WORKED.forEach(function(project){
          if(project.published === 'true'){
            $scope.user.projects.push(project);
          }
        });
      }
  }

  
  $scope.redirect = function(id) {
    $location.path('/project/' + id);
  }

  // Check if page of the user
  $scope.ownership = false;

  $scope.statusCheck = function() {
    // Check cookies and if current user own the profile page
    var cookie = $cookies.get('gitConnectDeltaKS');
    if(cookie){
      var cookieObj = Cookie.parseCookie(cookie);
      if (cookieObj.username === $scope.user.username) {
        $scope.availability = JSON.parse($scope.user.availability);
        $scope.ownership = true;
        $scope.availabilityStatus = ($scope.user.availability === "true") ? 'available' : 'unavailable';
      }
    }
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
    var cookie = $cookies.get('gitConnectDeltaKS');
    var cookieObj = Cookie.parseCookie(cookie);
    availabilityToggle.changeAvailability($scope.dataAvailability);
    // Update cooking value
    cookieObj.availability = "true";
    $cookies.put('gitConnectDeltaKS', JSON.stringify(cookieObj));
    //refresh to apply cookie to the view
    $window.location.reload();

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
  }

  $scope.deleteProfile = function() {
    if ($scope.ownership) {
      return $http({
        method: 'GET',
        url: '/api/user/delete/' + $scope.user.username
      }).then(function(res) {
        $window.location.reload();
        return console.log("Your profile has been deleted");
      });
    }
  };

  $scope.ratings = function() {
    $scope.averageRatings = Math.round($scope.averageRatings);
    // Ratings Module
    $ratings = $('.stars');
    for (var pos = 1; pos <= 5; pos++) {
      var ownPage = $scope.user.username === cookieObj.username;
      var html = angular.element("<i " + (ownPage  ? "": "ng-click='rate(" + pos + ")' rating-mouseover") + " idx="+(pos - 1)+" class='fa fa-star-o position-" + (pos - 1) + "'></i>");
      $compile(html)($scope);
      $ratings.append(html);
    }
    for (var i = 0; i < $scope.averageRatings; i++) {
      $('.position-' + i).removeClass('fa-star-o').addClass('fa-star');
    }
  }

  $scope.toggleRate = function() {
    $scope.ratingBool = 1 - $scope.ratingBool;
  }

  $scope.sendConnectionRequests = function() {
    return $http({
      method: 'POST',
      url: '/api/user/connection-request',
      data: { currentUser: $scope.cookieUser, 
              selectedUser: $scope.user
            }
    }).then(function successCallback(response) {
        socket.emit('notify:potentialFriend', {
          target: angular.copy($scope.user.username), currentUser: angular.copy($scope.cookieUser.username)
        })
    }, function errorCallback(response) {
      console.log('error: ', response);
    });
  };

  $scope.rated = false;
  $scope.rate = function(index) {
    if ($scope.rated) return;
    $scope.averageRatings = Math.round(($scope.user.ratingTotal + index) / ($scope.user.ratings + 1) * 10) / 10;
    User.postRating($scope.user, index)
      .then(function() {
        $('.stars').append('<p class="rate-success" style="size:5">\tRating sent!</p>');
        $scope.rated = true;
      })
      .catch(function(err) {
        console.log(err);
      });
  };

  /** Socket Message Sending **/

  $scope.sendMessage = function(targetUser) {
    socket.emit('store:firstMessageData', {
      message: {
        text: $scope.message,
        user: cookieObj.username
      },
      user: cookieObj.username,
      target: $scope.user.username,
      room: cookieObj.username + $scope.user.username
    });
  }
  socket.on('send:foundRoom', function(data) {
    socket.emit('send:privateMessage', {
      message: {
        text: $scope.message,
        user: cookieObj.username
      },
      room: data.room
    });
    $scope.message = '';
  })

  /** End of Socket **/
}]);