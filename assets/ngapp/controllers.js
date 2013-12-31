// =====================
// GLOBALish Controllers
// =====================

such.controller("MainController", function($scope, $http, $modal, $timeout, $window, User, Session, Notifications) {
  $scope.u = 0; //Loading user data
  var modalInstance;

  $scope.navCollapsed = true;

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

  $scope.openLoginModal = function(action) {
    modalInstance = $modal.open({
      templateUrl: 'loginModal.html',
      controller: "LoginCtrl",
      scope: $scope,
      resolve: {
        triedAction: function() {return action;}
      }
    });
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
      Notifications.add({
        bsType: "danger",
        msg: "Error logging out!",
        timeout: 12
      });
    });
  };

  $scope.hardReload = function() {
    location.reload();
  };

  $scope.getUserDetails();
});

such.controller("UserCornerController", function($scope) {
});

such.controller("LoginCtrl", function($scope, $modalInstance, Session, triedAction) {
  $scope.loginForm = {};
  if (triedAction) {
    $scope.actionMessage = "You must have an account to " + triedAction + ".";
  }
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

such.controller("NotificationsCtrl", function($scope, $interval) {
  $scope.closeAlert = function(index) {
    $scope.notifications.splice(index, 1);
  };
});

// ======================
//    Page Controllers
// ======================

such.controller("ExplainCtrl", function($scope, $interval, $location, $routeParams, Explanation, Notifications) {
  // Programming language
  $scope.modes = languageMetaData.programming;
  // Spoken Language
  $scope.spokens = languageMetaData.spoken;

  var providedId = $routeParams.eId;
  $scope.setupNewExp = function(s) {
    $scope.exp = new Explanation({
      plainCodeInput: s || "# Type code here",
      pLang: "ruby",
      nLang: "en",
      translatorMessages: []
    });
  };

  var persistedExp = {};

  if (typeof providedId === 'string') {
    if (providedId.length === 24) {
      Explanation.get({eId: providedId}, function(savedExp) {
        angular.copy(savedExp, persistedExp); // store for later comparison i.e 'Closing this will remove saved changes'
        $scope.exp = savedExp;
      }, function(errorResponse) {
        $scope.setupNewExp();
        // $scope.exp.translatorMessages.push({msg: "Could not find explanation!", msgType: "error"});
      });
    } else {
      $scope.setupNewExp();
      if (providedId !== "new") {
        Notifications.add({
          bsType: "danger",
          msg: "Invalid explanation id '" + providedId + "'",
          timeout: 30
        });
      }
    }
  } else {
    // Initial code content...
    var sampleSource = 'class Person\n  attr_reader :name, :age\n  def initialize(name, age)\n    @name, @age = name, age\n  end\n  def to_s\n    "#{name} (#{age})"\n  end\nend\n \ngroup = [\n  Person.new("Bob", 33),\n  Person.new("Chris", 16),\n  Person.new("Ash", 23)\n]\n \nputs group.sort.reverse';
    $scope.setupNewExp(sampleSource);
  }

  // $scope.$watch("exp.updateAt", function() {
  // Every time source code changes or codemirror is blured it's undefined and then back: Quick fix
  var currentSource = $scope.exp || '';
  $scope.$watch("exp", function() {
    $scope.showOutputPane = $scope.exp && (($scope.exp.translatorMessages && $scope.exp.translatorMessages.length) || $scope.exp.outputTree);
  }, true);

  $scope.setSpoken = function(s) {
    if (!$scope.spokens[s]) {
      $scope.exp.nLang = "en";
      return;
    }
    $scope.exp.nLang = s;
  };
  $scope.setMode = function(m) {
    if (!$scope.modes[m]) {
      $scope.exp.pLang = "ruby";
      return;
    }
    $scope.exp.pLang = m;
  };

  $scope.explainNow = function() {
    // TODO Set readonly on codemirror
    //      Show progress bar + disable options at the top

    // $scope.exp.lastTranslated = null; // Make sure that the translator is to translate it. CAN'T do this anymore
    $scope.exp.saved = undefined; // Set saved to undefined as explaining should not change it
    $scope.exp.saving = true; // Show loading on save button. Will be removed by mongoose anyway.
    // $scope.exp = $scope.exp.$save();
    $scope.exp.$save({explain: "yes"}, function(savedExp) {
      angular.copy(savedExp, persistedExp); // store for later comparison i.e 'Closing this will remove saved changes'
      $scope.exp = savedExp;
    }, function(errorResponse) {
      $scope.exp.saving = undefined;
      // Notification errors should be enough
    });
  };

  $scope.saveForLater = function() {
    $scope.exp.saving = true; // Show loading on save button. Will be removed by mongoose anyway.
    $scope.exp.saved = $scope.exp.saved || 1; // Set to public unless already specified
    $scope.exp.$save(function(savedExp) {
      angular.copy(savedExp, persistedExp); // store for later comparison i.e 'Closing this will remove saved changes'
      $scope.exp = savedExp;
    }, function(errorResponse) {
      $scope.exp.saving = undefined;
      // Notification errors should be enough
    });
  };
});

such.controller('EditorCtrl', function($scope, $timeout) {
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
    theme: $scope.currentTheme,
    lineNumbers: true,
    indentUnit: 2,
    tabMode: "indent",
    matchBrackets: true,
    autoCloseBrackets: true,
    viewportMargin: Infinity,
    tabindex: 1,
    autofocus: true,
    mode: 'text/x-' + ($scope.exp ? $scope.exp.pLang : ""), // this one should be fine as opposed to the below
    // mode: 'text/x-' + $scope.modes[$scope.exp.pLang].name,
    onLoad: function(_cm){
      $scope.$watch("exp.pLang", function(newVal, oldVal) {
        _cm.setOption("mode", 'text/x-' + newVal);
      });
      $scope.themeChanged = function() {
        _cm.setOption("theme", $scope.currentTheme);
      };
      // var codeUpdateTimeout;
      // // Not (ng-model not working for some reason): Obsolete: Update scope on code change
      // _cm.on("change", function() {
      //   $timeout.cancel(codeUpdateTimeout);
      //   codeUpdateTimeout = $timeout(function() {
      //     $scope.exp.plainCodeInput = _cm.getValue();
      //   }, 500);
      // });
    }
  };
 
});

such.controller("NotFoundCtrl", function($scope, Notifications) {
  Notifications.add({
    bsType: "danger",
    msg: "Page not found!"
  });
});



