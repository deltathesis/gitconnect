angular.module('myApp.subscription', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/subscription', {
    authenticate: true,
    templateUrl: 'view/subscription/subscription.html',
    controller: 'subscriptionPage'
  });
}])

.controller('subscriptionPage', ['$scope', '$location', 'Cookie', '$cookies', 'UserForm', function($scope, $location, Cookie, $cookies, UserForm) {

  var cookie = $cookies.get('github');
  var cookieObj = Cookie.parseCookie(cookie);

  var user = {
    name: cookieObj.username,
    githubId: cookieObj.id,
    picture: cookieObj.avatar,
    languages: ['JavaScript', 'AngularJS', 'Sass', 'CSS', 'HTML', 'Firebase']
  };

  $scope.user = user;

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
      user.languages.forEach(function(element) {
        var index = $scope.techList.indexOf(element);
         $scope.techList.splice(index, 1); 
         $scope.$apply();
      }) 
    }, 100);
  };

  $scope.addTech = function(tech, index) {
    if (user.languages.indexOf(tech) !== -1) {
      $scope.techList.splice(index, 1); 
    } else {
      user.languages.push(tech); 
      $scope.techList.splice(index, 1);
      $scope.searchText = '';
    }
  }

  $scope.removeTech = function(tech, index) {
    $scope.techList.push(tech); 
    user.languages.splice(index, 1);  
  }

  $scope.formSubmit = function() {
    var userCity = $('#user-location').val();
    var userSelectedTech = user.languages;
    var userEmail = $scope.userEmail;
    var userBio = $scope.userBio;
    var results = {
      username: user.name,
      cityName: userCity,
      cityId: cityId,
      email: userEmail,
      tech : userSelectedTech,
      bio: userBio
    }
    // Here is the results from the submited form
    console.log(results);

    // Location user update form submission
    var resultsLocation = {
      username: results.username,
      cityId: results.cityId,
      cityName: results.cityName
    }
    // Get User techs list
    var resultsTech = results.tech;

    // Prepare data to be posted
    var postData = {
      resultsLocation : resultsLocation,
      resultsTech: resultsTech
    }
    // Posting data
    UserForm.postForm(postData)

    // Redirection to the home page
    $location.path('/');
  }

  $scope.googleMapInit = function() {
    google.maps.event.addDomListener(window, 'load', addressInitialize);
  }

  // Set Google city unique Id
  var cityId;

  function addressInitialize() {
    var input = document.getElementById('user-location');
    var autocomplete = new google.maps.places.Autocomplete(input, {types: ['(cities)']});
    autocomplete.addListener('place_changed', function() {
      // Get city name only
      var place = autocomplete.getPlace();
      console.log(place.name, place.place_id);

      cityId = place.place_id;
      $('#user-location').val(place.name);
    });
  }

}]);