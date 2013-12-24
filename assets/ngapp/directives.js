such.directive("loadingIndicatorHeader", function($timeout) {
  return {
    restrict: 'A',
    replace: false,
    transclude: true,
    templateUrl: "loadingBalls.html"
  };
});