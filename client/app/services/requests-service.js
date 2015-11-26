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
      return res;
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
      return res;
    });
  };

  return {
    getDemands: getDemands,
    getRequests: getRequests
  };

}])

;