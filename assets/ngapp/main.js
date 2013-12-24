var such = angular.module('such', ['ui.bootstrap', 'ngResource', 'ngRoute']);

such.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'homepage.html',
    controller: 'HomeCtrl'
  }).when('/about', {
    templateUrl: 'views/about.html'
  }).when('/contribute', {
    templateUrl: 'views/contribute.html'
  }).otherwise({
    redirectTo: '/'
  });
});
