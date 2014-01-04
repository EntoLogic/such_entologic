such.directive("loadingIndicatorHeader", function($timeout) {
  return {
    restrict: 'A',
    replace: false,
    transclude: true,
    templateUrl: "loadingBalls.html"
  };
});

such.directive("mustBeUser", function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        if (scope.u) {
          scope.$eval(attrs.userCan);  // calls action() on the scope
        } else {
          scope.openLoginModal(attrs.mustBeUser);
        }
      });
    }
  };
});

such.directive("loadingWhen", function() {
  return {
    restrict: 'A',
    scope: { loadingWhen: '=' },
    link: function(scope, element, attrs) {
      var intialHtml = element.html();
      var loadingHtml = attrs.loadingHtml;
      scope.$watch("loadingWhen", function(newVal, oldVal) {
        if (newVal) {
          element.html(loadingHtml);
          element.attr("disabled", "disabled");
        } else {
          element.html(intialHtml);
          element.attr("disabled", null);
        }
      });
    }
  };
});

such.directive("oPhrase", function($timeout, Highlight) {
  return {
    restrict: 'E',
    // replace: true,
    scope: {pObj: '='},
    template: "<o-clause ng-repeat='c in pObj.clauses track by $index' clause='c' ng-mouseenter='setHighlight(pObj.location)'></o-clause> ",
    link: function(scope, element, attrs) {
      scope.setHighlight = function(highlightObject) {
        Highlight.start = highlightObject.start;
        Highlight.end = highlightObject.end;
      };
    }
  };
});

such.directive("oClause", function($compile) {
  var phraseListTemplate = "<br><ul><li ng-repeat='p in clause track by $index'><o-phrase p-obj='p'></o-phrase></li></ul><br>";
  var singlePhraseTemplate = "<o-phrase p-obj='clause'></o-phrase>";
  return {
    restrict: 'E',
    // replace: true,
    scope: {clause: '='},
    link: function(scope, element, attrs) {
      // console.log("clause:", scope.clause);
      if (angular.isString(scope.clause)) {
        element.html(scope.clause); // If string: set the output to the text itself
      } else if (angular.isArray(scope.clause)) {
        element.replaceWith($compile(phraseListTemplate)(scope)); // If array: Use the phraseListTemplate
      } else if (angular.isObject(scope.clause)) {
        element.replaceWith($compile(singlePhraseTemplate)(scope)); // If just another nested phrase: use that template
      }
    }
  };
});
