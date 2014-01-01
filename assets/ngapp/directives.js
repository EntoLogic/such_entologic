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