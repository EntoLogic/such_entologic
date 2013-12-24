such.directive("loadingIndicatorHeader", function($timeout) {
  return {
    restrict: 'A',
    replace: false,
    transclude: true,
    templateUrl: "loadingBalls.html",
    link: function(scope, element, attrs) {
      scope.loading = false;
      var removeLoaderTimeout;
      scope.$on('$locationChangeStart', function (event, newLoc, oldLoc){
        scope.loading = true;
      });

      scope.$on('$locationChangeSuccess', function (event, newLoc, oldLoc){
        $timeout.cancel(removeLoaderTimeout);
        removeLoaderTimeout = $timeout(function() {
          scope.loading = false;
        }, 300);
      });
    }
  };
});