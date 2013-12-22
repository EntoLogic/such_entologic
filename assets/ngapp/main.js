var such = angular.module('such', ['ui.bootstrap', 'ngResource', 'ngRoute']);

such.factory("User", function($resource) {
  return $resource('/u/:username', {
    email: '@email',
    username: '@username',
    realName: '@realName',
    provider: '@provider'
  }, {
    me: {method: 'GET', params: {username: 'me'}, isArray: false}
  });
});

such.factory("Session", function($http) {
  return {
    signin: function(l, p) {
      return $http({ method: 'POST', url: "/u/in", data: {login: l, password: p} });
    },
    signout: function() {
      return $http({ method: 'POST', url: "/u/out" });
    }
  };
});