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

.controller('profilePage', [
  '$scope', '$compile', 'getProfile', 'Cookie', '$cookies', 'availabilityToggle', '$window', 'userOwnTech', '$http', '$rootScope', 'socket', '$location', 'User',
  function($scope, $compile, getProfile, Cookie, $cookies, availabilityToggle, $window, userOwnTech, $http, $rootScope, socket, $location, User) {

  // var user = {
  //   ratings: Math.round(4.2),
  //   projects: [
  //     {name:'Ballr', id:'123'},
  //     {name:'GitConnect', id:'987'},
  //     {name:'Foodly', id:'567'},
  //     {name:'InstaCutz', id:'0987'},
  //     {name:'Humus', id:'12883'}
  //   ],
  // }
  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.ratingBool = 0;
  User.getProfileAndRelations(cookieObj.username).then(function(data) {
    $scope.cookieUser = data;
  })

  $scope.init = function() {  
      $scope.user = getProfile;
      // var rating = Math.ceil($scope.user.ratingTotal / $scope.user.ratings);
      // var ratingArray = [];
      // for(var i = 0; i < rating; i++) ratingArray.push(i);
      // $scope.user.ratings = ratingArray;
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
      $scope.user.projects = $scope.user.relationships.WORKED;
      $scope.hasProjects = ($scope.user.projects === undefined) ? false:true;
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
  }

  $scope.deleteProfile = function() {
    if ($scope.ownership) {
      console.log("inside");
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
    // Ratings Module
    $ratings = $('.stars');
    for (var pos = 1; pos <= 5; pos++) {
      var html = angular.element("<i ng-click='rate(" + pos + ")' class='fa fa-star-o position-" + (pos - 1) + "'></i>");
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
        console.log('it worked');
        socket.emit('notify:potentialFriend', {
          target: angular.copy($scope.user.username), currentUser: angular.copy($scope.cookieUser.username)
        })
    }, function errorCallback(response) {
      console.log('error: ', response);
    });
  };

  $scope.rate = function(index) {
    $scope.averageRatings = Math.round(($scope.user.ratingTotal + index) / ($scope.user.ratings + 1) * 10) / 10;
    User.postRating($scope.user, index)
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
    $scope.message = '';
  }
  socket.on('send:foundRoom', function(data) {
    socket.emit('send:privateMessage', {
      message: {
        text: $scope.message,
        user: cookieObj.username
      },
      room: data.room
    });
  })

  /** End of Socket **/
}]);