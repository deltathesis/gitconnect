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
      url: '/api/connect/mutualConnection',
      data: { data: object }
    }).then(function successCallback(response) {
        console.log('success')
        return;
    }, function errorCallback(response) {
      console.log('error project creation', response);
    });
  };

  var deleteRequest = function(object) {
    return $http({
      cache: false,
      method: 'POST',
      url: '/api/request/delete',
      data: { data: object }
    }).then(function successCallback(response) {
        console.log('deleted request', response)
        // var project = response.data;
        // return response.data;
    }, function errorCallback(response) {
      console.log('error deleted request', response);
    });
  };

  var deleteDemand = function(object) {
    return $http({
      cache: false,
      method: 'POST',
      url: '/api/demand/delete',
      data: { data: object }
    }).then(function successCallback(response) {
        console.log('deleted demand', response)
        // var project = response.data;
        // return response.data;
    }, function errorCallback(response) {
      console.log('error deleted demand', response);
    });
  };

  return {
    createConnection: createConnection,
    deleteRequest: deleteRequest,
    deleteDemand: deleteDemand
  };
}])

;