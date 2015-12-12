angular.module('myApp.profileUpdate', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/profile-update/:name', {
    authenticate: true,
    templateUrl: 'view/profile-update/profile-update.html',
    controller: 'profileUpdatePage',
    resolve: {
      getProfile: ['$route', 'User', function($route, User) {
        return User.getProfileAndRelations($route.current.params.name);
      }]
    }
  });
}])

.controller('profileUpdatePage', [
  '$scope', '$location', 'Cookie', '$cookies', 'UserForm', 'getProfile', '$window', 'userOwnTech', 'techList',
  function($scope, $location, Cookie, $cookies, UserForm, getProfile, $window, userOwnTech, techList) {

  $scope.user = getProfile;

  // Get global tech/languages list
  $scope.techList = [];
  var techs = techList.getTechList();
  techs.forEach(function(element) {
    $scope.techList.push(element);
  })

  // Check if page of the user
  $scope.ownership = false;
  $scope.statusCheck = function() {
    // Check cookies and if current user own the profile page
    var cookie = $cookies.get('gitConnectDeltaKS');
    if(cookie){
      var cookieObj = Cookie.parseCookie(cookie);
      console.log(cookieObj.username,$scope.user.username);
      if (cookieObj.username === $scope.user.username) {
        $scope.ownership = true;
      }
    }
  }

  $scope.user.languages = []

  //Conditional to make sure that user has languages relationships
  if($scope.user.relationships.KNOWS){
    $scope.user.relationships.KNOWS.forEach(function(tech){
      $scope.user.languages.push(tech.name);
    });
  }

  $scope.userEmail = $scope.user.email;
  $scope.userBio = $scope.user.bio;
  $scope.userFullName = $scope.user.name;
  $scope.cityId;
  $scope.cityName;

  $scope.error = false;


  // Remove user existing tech
  $scope.initialTech = function() {
    setTimeout(function () { 
      $scope.user.languages.forEach(function(element) {
        var index = $scope.techList.indexOf(element);
         $scope.techList.splice(index, 1); 
         $scope.$apply();
      }) 
    }, 100);
  };

  $scope.addTech = function(tech, index) {
    if ($scope.user.languages.indexOf(tech) !== -1) {
      $scope.techList.splice(index, 1); 
    } else {
      $scope.user.languages.push(tech); 
      $scope.techList.splice(index, 1);
      $scope.searchText = '';
    }
  };

  $scope.removeTech = function(tech, index) {
    $scope.techList.push(tech); 
    $scope.user.languages.splice(index, 1);  
  };

  $scope.formChecking = function() {
    if ($scope.cityId === undefined || $scope.userEmail === undefined || $scope.userBio === undefined || $scope.userFullName === undefined) {
      $scope.error = true;
    } else {
      $scope.error = false;
    }
  }

  $scope.formSubmit = function() {
    if ($scope.ownership && !$scope.error) {
      var userSelectedTech = $scope.user.languages;
      var userEmail = $scope.userEmail;
      var userBio = $scope.userBio;
      var userFullName = $scope.userFullName;
      

      // Location user update form submission
      var resultsLocation = {
        username: $scope.user.username,
        cityId: $scope.cityId,
        cityName: $scope.cityName
      }

      // Get User techs list
      var resultsTech = userSelectedTech;

      // Prepare email and Bio data
      var userInfos = {
        username: $scope.user.username,
        email: userEmail,
        bio: userBio,
        name: userFullName,
        location: $scope.cityId
      }

      // Prepare data to be posted
      var postData = {
        resultsLocation : resultsLocation,
        resultsTech: resultsTech,
        userInfos: userInfos,
        formType: 'update'
      }

      // Posting data
      UserForm.postForm(postData)

      // Set tech into Usertech Service
      userOwnTech.setTech(resultsTech);
      userOwnTech.setAddress($scope.cityName);
      userOwnTech.setBio(userBio);
      userOwnTech.setFullName(userFullName);

      // Redirection to the home page
      $location.path('/user/' + $scope.user.username);
    }
  };

  $scope.googleMapInit = function() {
    // google.maps.event.addDomListener(window, 'load', addressInitialize);
    addressInitialize();
  };

  function addressInitialize() {
    var input = document.getElementById('user-location');
    var autocomplete = new google.maps.places.Autocomplete(input, {types: ['(cities)']});
    autocomplete.addListener('place_changed', function() {
      // Get city name only
      var place = autocomplete.getPlace();
      console.log(place.name, place.place_id);

      $scope.cityId = place.place_id;
      $scope.cityName = place.name;
    });
  }

}]);