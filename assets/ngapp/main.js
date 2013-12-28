var such = angular.module('such', ['ui.bootstrap',
                                    'ngResource',
                                    'ngRoute',
                                    'ui.codemirror']);

such.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'explain.html',
    controller: 'ExplainCtrl'
  }).when('/about', {
    templateUrl: 'views/about.html'
  }).when('/contribute', {
    templateUrl: 'views/contribute.html'
  }).otherwise({
    controller: 'NotFoundCtrl',
    templateUrl: 'notFound.html'
  });
});

// LANGS JSON FILE FROM META
var languageMetaData = {
  "spoken": {
    "en": {
      "en": "English"
    },
    "fr": {
      "en": "French"
    }, 
    "de": {
      "en": "German"
    }, 
    "it": {
      "en": "Italian"
    }
  },
  "programming": {
    "ruby": {
      "name": "ruby",
      "fullName": "Ruby",
      "uastGenRepo": "https://github.com/EntoLogic/ruby_uast_gen"
    },
    "python": {
      "fullName": "Python",
      "name": "python"
    },
    "java": {
      "fullName": "Java",
      "name": "java",
      "cmMode": "clike"
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