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
  '$scope', 'getProfile', 'Cookie', '$cookies', 'availabilityToggle', '$window', 'userOwnTech', '$http', '$rootScope',
  function($scope, getProfile, Cookie, $cookies, availabilityToggle, $window, userOwnTech, $http, $rootScope) {

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

  $scope.init = function() {  
      $scope.user = getProfile;
      // console.log(getProfile);

      // TODO get from DB
      $scope.user.ratings = Math.round(4.2); //dummy data

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
        $scope.user.relationships.KNOWS.forEach(function(tech) {
          $scope.user.languages.push({
            name:tech.name,
            nameEncoded: encodeURIComponent(tech.name)
          });
        });
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
        $scope.user.bio = $scope.user.user.bio;
      }

      // Updated User Full Name
      var userFullName = userOwnTech.getFullName();
      if (userFullName !== '') {
        $scope.user.user.name = userFullName;
      } else {
        $scope.user.user.name = $scope.user.user.name;
      }

  }

  
  


  // Check if page of the user
  $scope.ownership = false;

  $scope.statusCheck = function() {
    // Check cookies and if current user own the profile page
    var cookie = $cookies.get('gitConnectDeltaKS');
    if(cookie){
      var cookieObj = Cookie.parseCookie(cookie);
      if (cookieObj.username === $scope.user.user.username) {
        $scope.availability = JSON.parse($scope.user.user.availability);
        $scope.ownership = true;
        $scope.availabilityStatus = ($scope.user.user.availability === "true") ? 'available' : 'unavailable';
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
        url: '/api/user/delete/' + $scope.user.user.username
      }).then(function(res) {
        $window.location.reload();
        return console.log("Your profile has been deleted");
      });
    }
  };

  $scope.ratings = function() {
    // Ratings Module
    $ratings = $('.stars');
    for (var pos = 0; pos < 5; pos++) {
      $ratings.append("<i class='fa fa-star-o position-" + pos + "'></i>");
    }
    for (var i = 0; i < $scope.user.ratings; i++) {
      $('.position-' + i).removeClass('fa-star-o').addClass('fa-star');
    }
  }

}]);