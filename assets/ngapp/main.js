var such = angular.module('such', ['ui.bootstrap',
                                    'ngResource',
                                    'ngRoute',
                                    'ui.codemirror']);

such.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'explain.html',
    controller: 'ExplainCtrl'
  }).when('/exp/:eId', {
    templateUrl: 'explain.html',
    controller: 'ExplainCtrl'
  }).when('/exp', {
    redirectTo: "/"
  }).when('/about', {
    templateUrl: 'views/about.html'
  }).when('/register', {
    templateUrl: 'views/create_account.html',
    controller: 'RegisterCtrl'
  }).when('/u/:username', {
    templateUrl: 'views/user_profile.html',
    controller: 'ShowUserCtrl'
  }).when('/translate', {
    templateUrl: 'views/phrase_list.html',
    controller: 'PhraseListCtrl'
  }).when('/translate/new', {
    templateUrl: 'views/phrase_create.html',
    controller: 'NewPhraseCtrl'
  }).when('/translate/:pId', {
    templateUrl: 'views/phrase_create.html',
    controller: 'NewPhraseCtrl'
  }).otherwise({
    controller: 'NotFoundCtrl',
    templateUrl: 'notFound.html'
  });
});

such.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field]);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});


// LANGS JSON FILE FROM META
var languageMetaData = {
  "spoken": {
    "en": {
      "code": "en",
      "en": "English"
    },
    "fr": {
      "code": "fr",
      "en": "French"
    }, 
    "de": {
      "code": "de",
      "en": "German"
    }, 
    "it": {
      "code": "it",
      "en": "Italian"
    }
  },
  "programming": {
    "ruby": {
      "name": "ruby",
      "fullName": "Ruby",
      "uastGenRepo": "https://github.com/EntoLogic/ruby_uast_gen"
    },
    "java": {
      "fullName": "Java",
      "name": "java"
    }
  }
};

// Just loading all for the moment
// Check out code mirror addon/mode/loadmode.js
// var loadedCMModes = ["ruby"];

// // Load codemirror modes
// var getCMLanguage = function(lang) {
//   var langObj = langs.programming[lang];
//   var modeName = langObj.cmMode || langObj.name;
//   if (loadedCMModes.indexOf(modeName) === -1) {
//     return;
//   };
//   (function(d, t) {
//       var g = d.createElement(t), // create a script tag
//           s = d.getElementsByTagName(t)[0]; // find the first script tag in the document
//       g.src = '/cm_modes/' +  + '.js'; // set the source of the script to your script
//       s.parentNode.insertBefore(g, s); // append the script to the DOM
//   }(document, 'script'));
// };