angular.module('myApp.subscription', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/subscription/:name', {
    authenticate: true,
    templateUrl: 'view/subscription/subscription.html',
    controller: 'subscriptionPage',
    resolve: {
      getProfile: ['$route', 'User', function($route, User) {
        return User.getProfileAndRelations($route.current.params.name);
      }]
    }
  });
}])

.controller('subscriptionPage', ['$scope', '$location', 'Cookie', '$cookies', 'UserForm', 'getProfile', function($scope, $location, Cookie, $cookies, UserForm, getProfile) {

  $scope.user = getProfile;
  console.log(getProfile);

  // Check if page of the user
  $scope.ownership = false;
  $scope.statusCheck = function() {
    // Check cookies and if current user own the profile page
    var cookie = $cookies.get('gitConnectDeltaKS');
    if(cookie){
      var cookieObj = Cookie.parseCookie(cookie);
      console.log(cookieObj.username,$scope.user.user.username);
      if (cookieObj.username === $scope.user.user.username) {
        $scope.ownership = true;
      }
    }
  }

  $scope.user.languages = [];
  $scope.user.relationships.KNOWS.forEach(function(tech) {
    $scope.user.languages.push(tech.name);
  })

  $scope.techList = [
    'JavaScript', 'AngularJS', 'Sass', 'CSS', 'HTML', 'Firebase',
    'Ruby', 'Less', 'Scala', 'Python', 'C++', 'Swift', 'Objective-C',
    'mongoDB', 'Neo4j', 'MySQL', 'SQLite', 'Shell', 'Redis', 'Meteor',
    'jQuery', 'Java', 'Rails', 'React', 'PHP', 'PostgreSQL', 'Node.js',
    'Express', 'Stylus', 'Symfony', 'Wordpress', 'Zend', 'socket.io',
    'Backbone', 'Boostrap', 'Foundation', 'CoffeeScript', 'Bower', 'Django',
    'ActionScript', 'Ember', 'Go', 'Gulp', 'Grunt', 'Laravel', 'Docker'
  ];

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
  }

  $scope.removeTech = function(tech, index) {
    $scope.techList.push(tech); 
    $scope.user.languages.splice(index, 1);  
  }

  $scope.formSubmit = function() {
    if ($scope.ownership) {
      // var userCity = $('#user-location').val();
      var userSelectedTech = $scope.user.languages;
      var userEmail = $scope.userEmail;
      var userBio = $scope.userBio;

      // Location user update form submission
      var resultsLocation = {
        username: $scope.user.user.username,
        cityId: cityId,
        cityName: cityName
      }
      console.log(resultsLocation);
      // Get User techs list
      var resultsTech = userSelectedTech;

      // Prepare email and Bio data
      var userInfos = {
        username: $scope.user.user.username,
        email: userEmail,
        bio: userBio
      }

      // Prepare data to be posted
      var postData = {
        resultsLocation : resultsLocation,
        resultsTech: resultsTech,
        userInfos: userInfos
      }

      // Posting data
      UserForm.postForm(postData)

      // Set tech into Usertech Service
      userOwnTech.setTech(resultsTech);
      userOwnTech.setAddress(cityName);

      // Redirection to the home page
      $location.path('/');
    }
  }

  $scope.googleMapInit = function() {
    // google.maps.event.addDomListener(window, 'load', addressInitialize);
    addressInitialize();
  }

  function addressInitialize() {
    var input = document.getElementById('user-location');
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