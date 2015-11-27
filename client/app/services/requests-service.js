angular.module('myApp.requestsServices', [])

.factory('userRequests', ['$http', '$cookies', 'Cookie', function($http, $cookies, Cookie) {

  var getDemands = function() {
    var cookie = $cookies.get('gitConnectDeltaKS');
    var user = Cookie.parseCookie(cookie);
    return $http({
      cache: false,
      method: 'GET',
      url: '/api/connectionslistDemands/' + user.username
    }).then(function(res) {
      return res.data.users;
    });
  };

  var getRequests = function() {
    var cookie = $cookies.get('gitConnectDeltaKS');
    var user = Cookie.parseCookie(cookie);
    return $http({
      cache: false,
      method: 'GET',
      url: '/api/connectionslistRequests/' + user.username
    }).then(function(res) {
      return res.data.users;
    });
  };

  return {
    getDemands: getDemands,
    getRequests: getRequests
  };

}])

.factory('UserConnection', ['$http', function($http) {
  var createConnection = function(object) {
    return $http({
      cache: false,
      method: 'POST',
      url: '/api/project/creation',
      data: { data: object }
    }).then(function successCallback(response) {
        console.log('success project creation')
    }, function errorCallback(response) {
      console.log('error project creation', reponse);
    });
  };

  return {
    createConnection: createConnection
  };
}])

;