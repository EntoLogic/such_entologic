// =====================
// GLOBALish Controllers
// =====================

such.controller("MainController", function($scope,
                                            $http,
                                            $modal,
                                            $timeout,
                                            User,
                                            Session,
                                            Notifications) {
  $scope.u = 0; //Loading user data
  var modalInstance;

  $scope.navCollapsed = false;

  $scope.notifications = [];
  Notifications.setNotificationArray($scope.notifications);

  $scope.changingPage = false;
  var changePageTimeout;
  $scope.$on('$locationChangeStart', function (event, newLoc, oldLoc){
    $scope.changingPage = true;
  });

  $scope.$on('$locationChangeSuccess', function (event, newLoc, oldLoc){
    Notifications.pageChange();
    $timeout.cancel(changePageTimeout);
    changePageTimeout = $timeout(function() {
      $scope.changingPage = false;
    }, 300);
  });

  $scope.openLoginModal = function () {
    modalInstance = $modal.open({
      templateUrl: 'loginModal.html',
      controller: "LoginCtrl",
      scope: $scope
    });

    // modalInstance.result.then(function (selectedItem) {
    //   $scope.selected = selectedItem;
    // }, function () {
    //   $log.info('Modal dismissed at: ' + new Date());
    // });
  };

  $scope.getUserDetails = function(cb) {
    var userResource = User.me();
    userResource.$promise.then(function(user) {
      $scope.u = user;
      if (cb) cb();
    }, function(err) {
      $scope.u = null;
    });
  };


  $scope.loginUser = function(loginObj) {
    Session.signin(loginObj.login, loginObj.password).success(function(res) {
      $scope.getUserDetails(function() {
        if(modalInstance) {
          modalInstance.close();
          modalInstance = null;
        }
      });

    }).error(function(resErr) {
      $scope.u = null;
    });
  };

  //💎 RUBY 💎

  $scope.signout = function() {
    Session.signout().success(function(res) {
      $scope.u = null;
    }).error(function(res) {

    });
  };

  $scope.hardReload = function() {
    location.reload();
  };

  $scope.getUserDetails();
});

such.controller("UserCornerController", function($scope) {
});

such.controller("LoginCtrl", function($scope, $modalInstance, Session) {
  $scope.loginForm = {};

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

such.controller("NotificationsCtrl", function($scope, $interval) {
  $scope.closeAlert = function(index) {
    $scope.notifications.splice(index, 1);
  };
});

// =====================
// Page Controllers
// =====================

such.controller("ExplainCtrl", function($scope) {
  // Initial code content...
  $scope.sourceCode = 'class Person\n  attr_reader :name, :age\n  def initialize(name, age)\n    @name, @age = name, age\n  end\n  def to_s\n    "#{name} (#{age})"\n  end\nend\n \ngroup = [\n  Person.new("Bob", 33),\n  Person.new("Chris", 16),\n  Person.new("Ash", 23)\n]\n \nputs group.sort.reverse';

  // Programming language
  $scope.modes = languageMetaData.programming;
  $scope.currentMode = $scope.modes.ruby;
  $scope.setMode = function(m) {
    if (!$scope.modes[m]) {
      $scope.currentMode = $scope.modes.ruby;
      return;
    }
    $scope.currentMode = $scope.modes[m];
    $scope.modeChanged();
  };

  // Spoken Language
  $scope.spokens = languageMetaData.spoken;
  $scope.currentSpoken = $scope.spokens.en;
  $scope.setSpoken = function(s) {
    if (!$scope.spokens[s]) {
      $scope.currentSpoken = $scope.spokens.en;
      return;
    }
    $scope.currentSpoken = $scope.spokens[s];
  };
});

such.controller('EditorCtrl', ['$scope', function($scope) {
  $scope.hideEditorSettings = true;
  $scope.themes = [
    "default",
    "ambiance",
    "3024-day",
    "3024-night",
    "blackboard",
    "monokai",
    "neat",
    "solarized dark",
    "solarized light",
    "midnight",
    "cobalt"
  ];
  $scope.currentTheme = "default";
  $scope.setTheme = function(t) {
    if ($scope.themes.indexOf(t) === -1) {
      $scope.currentTheme = "default";
      return;
    }
    $scope.currentTheme = t;
    $scope.themeChanged();
  };

  // The ui-codemirror option
  $scope.editorOptions = {
    // theme: $scope.currentTheme,
    lineNumbers: true,
    indentUnit: 2,
    tabMode: "indent",
    matchBrackets: true,
    viewportMargin: Infinity,
    mode: 'text/x-' + $scope.currentMode.name,
    onLoad: function(_cm){
      // HACK to have the codemirror instance in the scope...
      $scope.modeChanged = function() {
        _cm.setOption("mode", 'text/x-' + $scope.currentMode.name);
      };
      $scope.themeChanged = function() {
        _cm.setOption("theme", $scope.currentTheme);
      };
    }
  };
 
}]);

such.controller("NotFoundCtrl", function($scope, Notifications) {
  Notifications.add({
    bsType: "danger",
    msg: "Page not found!"
  });
});



