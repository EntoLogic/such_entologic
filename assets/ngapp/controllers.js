// =====================
// GLOBALish Controllers
// =====================

such.controller("MainController", function($scope, $window, $location, $route, $modal, $timeout, User, Session, Notifications) {
  // If mobile and going to root, redirect to about
  $timeout(function() {
    if ($window.innerWidth < 768 && $location.path() == "/") {
      $location.path("/about");
    }
  }, 100);

  $scope.u = 0; //Loading user data
  var modalInstance;

  $scope.navCollapsed = true;

  // Programming language
  $scope.modes = languageMetaData.programming;
  // Spoken Language
  $scope.spokens = languageMetaData.spoken;

  $scope.notifications = [];
  Notifications.setNotificationArray($scope.notifications);

  $scope.changingPage = false;
  var changePageTimeout;
  $scope.$on('$locationChangeStart', function (event, newLoc, oldLoc){
    $scope.changingPage = true;
  });

  $scope.$on('$locationChangeSuccess', function (event, newLoc, oldLoc){
    if (modalInstance) {
      modalInstance.close();
      modalInstance = null;
    }
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
    var userResource = User.me(function(user) {
      $scope.u = user;
      if (user.admin === 1) {
        $scope.modes.default = { name: "default", fullName: "Default" };
      }
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
        $route.reload();
      });
    }).error(function(resErr) {
      $scope.u = null;
    });
  };

  //💎 RUBY 💎

  $scope.signout = function() {
    Session.signout().success(function(res) {
      $scope.u = null;
      // Todo: go somewhere
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

such.controller("NotificationsCtrl", function($scope) {
  $scope.closeAlert = function(index) {
    $scope.notifications.splice(index, 1);
  };
});

// =======================
//    Modal Controllers
// =======================

such.controller("LoginCtrl", function($scope, $modalInstance, Session, triedAction) {
  $scope.loginForm = {};
  if (triedAction) {
    $scope.actionMessage = "You must have an account to " + triedAction + ".";
  }
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


// ======================
//   Explain Controllers
// ======================

such.controller("ExplainCtrl", function($scope, $interval, $timeout, $location, $routeParams, Explanation, User, Notifications, Highlight) {
  // $scope.exp = {};
  // $scope.creationUser = {};
  var explanationChecker;
  $scope.$on("$destroy", function(){
    $interval.cancel(explanationChecker);
  });
  $scope.percentageDone = 0;

  $scope.setupNewExp = function(s) {
    $scope.exp = new Explanation({
      plainCodeInput: s || "# New explanation - type code here",
      pLang: "ruby",
      nLang: "en",
      translatorMessages: []
    });
  };
  var providedId = $routeParams.eId;
  var persistedExp = {};

  $scope.highlightLocation = Highlight;

  var getAndSetExp = function(expId, noErrors) {
    // var noErrors = Boolean(failureMsg);
    Explanation.get({eId: expId, empty: noErrors}, function(savedExp) {
      angular.copy(savedExp, persistedExp); // store for later comparison i.e 'Closing this will remove saved changes'
      $scope.exp = savedExp;
      $scope.percentageDone = 0;
    }, function(errorResponse) {
      if (!noErrors) { // Check if there is a failure message string because that means it's coming from the poller.
        $scope.setupNewExp(); // (also stops removing the exp to allow retry.)
      }
      // $scope.exp.translatorMessages.push({msg: "Could not find explanation!", msgType: "error"});
    });
  };

  if (typeof providedId === 'string') {
    if (providedId.length === 24) {
      getAndSetExp(providedId);
    } else {
      $scope.setupNewExp();
      if (providedId !== "new") {
        Notifications.add({
          bsType: "danger",
          msg: "Invalid explanation id '" + providedId + "'",
          timeout: 12
        });
      }
    }
  } else {
    // Initial code content...
    var sampleSource = 'def hello\n  x = 2 + 2\nend';
    $scope.setupNewExp(sampleSource);
  }

  // $scope.$watch("exp.updateAt", function() {
  // Every time source code changes or codemirror is blured it's undefined and then back: Quick fix
  var currentSource = $scope.exp || '';
  $scope.$watch("exp", function() {
    $scope.showOutputPane = $scope.exp && (($scope.exp.translatorMessages && $scope.exp.translatorMessages.length) || $scope.exp.outputTree);
    if ($scope.exp && $scope.exp.saved) $scope.exp.saved = $scope.exp.saved.toString();
  }, true);

  $scope.$watch("exp.outputTree", function() {
    // Crappy timing fix for weird output
    if ($scope.exp && (typeof $scope.exp.outputTree === 'string')) {
      $scope.outputTreeObject = null;
      $timeout(function(){
        $scope.outputTreeObject = JSON.parse($scope.exp.outputTree);
      }, 100);
    }
  });

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

  $scope.pollForOutput = function(expId, waitSeconds) {
    $scope.percentageDone = 5;
    var secondsPassed = 0;
    explanationChecker = $interval(function() {
      secondsPassed += 1;
      $scope.percentageDone = (secondsPassed / waitSeconds)  * 100;
      if (secondsPassed >= waitSeconds) {
        getAndSetExp(expId, true);
        $interval.cancel(explanationChecker);
      }
    }, 1000);
  };

  $scope.explainNow = function() {
    $scope.exp.saved = undefined; // Set saved to undefined as explaining should not change it
    $scope.exp.saving = true; // Show loading on save button. Will be removed by mongoose anyway.
    $scope.exp.$save({explain: "yes"}, function(savedExp) {
      angular.copy(savedExp, persistedExp); // store for later comparison i.e 'Closing this will remove saved changes'
      $scope.exp = savedExp;
      $scope.pollForOutput(savedExp._id, (savedExp.minExplainSeconds || 5) + 1);
      // }
    }, function(errorResponse) {
      $scope.exp.saving = undefined;
      // Notification errors should be enough
    });
  };

  $scope.saveForLater = function() {
    $scope.exp.saving = true; // Show loading on save button. Will be removed by mongoose anyway.
    $scope.exp.saved = $scope.exp.saved || 1; // Set to public unless already specified
    $scope.exp.$save(function(savedExp) {
      if ((providedId !== savedExp._id)) {
        goExplanationLocaction($scope.exp._id);
      } else {
        angular.copy(savedExp, persistedExp); // store for later comparison i.e 'Closing this will remove saved changes'
        $scope.exp = savedExp;
      }
    }, function(errorResponse) {
      $scope.exp.saving = undefined;
      // Notification errors should be enough
    });
  };

  var goExplanationLocaction = function(id) {
    $location.path("/exp/" + id);
  };

  $scope.getCreationUser = function() {
    if ($scope.exp.user) {
      $scope.creationUser = User.get({userId: $scope.exp.user});
    }
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
    readOnly: true, // Start with read only, changes later below
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
      $scope.$watch("exp", function(newVal, oldVal) {
        // editable if: there is an exp and it's annonymous  OR the exp has a user and that user is you.
        var editable = Boolean($scope.exp && (!$scope.exp.user || ($scope.u && $scope.exp.user === $scope.u._id)));
        _cm.setOption("readOnly", !editable);
      });
      $scope.themeChanged = function() {
        _cm.setOption("theme", $scope.currentTheme);
      };
      var highlightInstance;
      $scope.$watch("highlightLocation", function(newHighlight) {
        if (highlightInstance) {
          highlightInstance.clear();
        }
        // var highlightObject
        if (newHighlight.start && newHighlight.end) {
          highlightInstance = _cm.doc.markText(
            {line: newHighlight.start[0], ch: newHighlight.start[1]},
            {line: newHighlight.end[0], ch: newHighlight.end[1]}
          );
        } else if (newHighlight.start) {
          highlightInstance = _cm.doc.markText(
            {line: newHighlight.start[0], ch: newHighlight.start[1]},
            {line: newHighlight.start[0], ch: newHighlight.start[1] + 1},
            {className: "highlighted"}
          );
        }
      }, true);
      // var codeUpdateTimeout;
      // // Not (ng-model not working for some reason on 1.2.3+): Obsolete: Update scope on code change
      // _cm.on("change", function() {
      //   $timeout.cancel(codeUpdateTimeout);
      //   codeUpdateTimeout = $timeout(function() {
      //     $scope.exp.plainCodeInput = _cm.getValue();
      //   }, 500);
      // });
    }
  };
});

// such.controller('OutputExplanationCtrl', function($scope) {

// });

// ====================
//  Random Controllers
// ====================

such.controller("NotFoundCtrl", function($scope, Notifications) {
  Notifications.add({
    bsType: "danger",
    msg: "Page not found!"
  });
});

// ==================
//  User Controllers
// ==================

such.controller("RegisterCtrl", function($scope, $location, User, Notifications) {
  if ($scope.u) {
    $location.path("/");
    Notifications.add({
      bsType: "warning",
      msg: "You are already signed in!",
      timeout: 14,
      keepOnPageChange: true
    });
    return;
  }

  $scope.newUser = new User();

  $scope.registerUser = function() {
    if ($scope.registerform.$invalid) {
      Notifications.add({
        bsType: "danger",
        msg: "Form Invalid",
        timeout: 9
      });
      return; // Cancel the request
    }
    $scope.newUser.$save(function() {
      $location.path("/");
      Notifications.add({
        bsType: "info",
        msg: "You may now sign in!",
        timeout: 9,
        keepOnPageChange: true
      });
    }, function() {
      // Response interceptor shows errors
    });
  };
});

such.controller("ShowUserCtrl", function($scope, $routeParams, User, Explanation) {
  var providedId = $routeParams.username;
  $scope.user = {};
  $scope.isCurrentUser = $scope.u && providedId === $scope.u.username;

  $scope.explanations = null;
  var getUserExplanations = function(uId) {
    $scope.explanations = Explanation.query({forUser: uId});
  };

  if ($scope.isCurrentUser) {
    $scope.user = $scope.u;
    getUserExplanations($scope.user._id);
  } else {
    User.byUsername({userId: providedId}, function(user){
      $scope.user = user;
      getUserExplanations(user._id);
    }, function() {
      $scope.userError = "Could not find username " + providedId;
    });    
  }
});

// ====================
//  Phrase Controllers
// ====================

such.controller("PhraseListCtrl", function($scope, Phrase, User) {
  Phrase.query(function(phrases) {
    $scope.phrases = phrases;
  });
  $scope.setInUse = function(phrase) {
    console.log(phrase);
    Phrase.setInUse({_id: phrase._id}, function(p) {
      // Notifications should be enough here
    }, function() {
      // Same here
    });
  };
});

such.controller("NewPhraseCtrl", function($scope, $routeParams, $http, $location, Phrase, User, Notifications) {
  $http({method: 'GET', url: "/phrase_type_list.json"}).success(function(res) {
    $scope.phraseTypes = res;
  }).error(function() {
    Notifications.add({
      bsType: "danger",
      msg: "Error getting phrase types, try reloading the page..."
    });
  });

  var setupNewPhrase = function() {
    $scope.phrase = new Phrase();
    $scope.phrase.nLang = $routeParams.nl || "en";
    $scope.phrase.pLang = $routeParams.pl || "ruby";
    if (!$scope.phrase.clauses) $scope.phrase.clauses = [];
  };

  $scope.setPhraseType = function(p) {
    var phraseTypeFound = getPhraseType(p);
    if (phraseTypeFound) {
      $scope.phrase.phraseName = p;
      $scope.currentPhraseObject = phraseTypeFound;
    } else {
      Notifications.add({
        bsType: "warning",
        msg: "Phrase type not available",
        timeout: 7
      });
    }
  };

  var suppliedPhraseId = $routeParams.pId;

  if (typeof suppliedPhraseId === 'string') {
    if (suppliedPhraseId.length === 24) {
      Phrase.get({pId: suppliedPhraseId}, function(res) {
        $scope.phrase = res;
        $scope.setPhraseType(res.phraseName);
      }, function(resErr) {
        setupNewPhrase();
        // Notifications will handle it
      });      
    } else {
      Notifications.add({
        bsType: "danger",
        msg: "Invalid phrase id '" + suppliedPhraseId + "'",
        timeout: 12
      });
    }
  } else {
    setupNewPhrase();
  }


  $scope.submitPhrase = function() {
    $scope.phrase.$save(function() {
      $location.path("/translate");
      Notifications.add({
        bsType: "success",
        msg: "Phrase submitted and will be in review by an admin.",
        timeout: 12
      });
    }, function() {
      // Notifications should be sufficient
    });
  };

  $scope.saveChanges = function() {
    $scope.phrase.$save(function() {
      $location.path("/translate");
      Notifications.add({
        bsType: "success",
        msg: "Changes saved to phrase",
        timeout: 12
      });
    }, function() {
      // Notifications should be sufficient
    });
  };

  $scope.setSpoken = function(s) {
    if ($scope.spokens[s]) {
      $scope.phrase.nLang = s;
    } else {
      Notifications.add({
        bsType: "warning",
        msg: "Spoken language not available",
        timeout: 7
      });
    }
  };

  $scope.setMode = function(m) {
    if ($scope.modes[m]) {
      $scope.phrase.pLang = m;
    } else {
      Notifications.add({
        bsType: "warning",
        msg: "Programming language not available",
        timeout: 7
      });
    }
  };

  var getPhraseType = function(p) {
    var phraseFound;
    for (var i = $scope.phraseTypes.length - 1; i >= 0; i--) {
      if ($scope.phraseTypes[i].phrase_type === p) {
        phraseFound = $scope.phraseTypes[i];
      }
    }
    return phraseFound || false;
  };

  $scope.addClause = function() {
    if (!($scope.phrase.clauses.length || $scope.phrase.phraseName)) {
      Notifications.add({
        bsType: "warning",
        msg: "Please select all options!",
        timeout: 7
      });
      return;
    }
    $scope.phrase.clauses.push({words: [""]});
  };

  $scope.deleteClause = function(i) {
    $scope.phrase.clauses.splice(i, 1);
  };

  $scope.moveClause = function(i, d) {
    // i => index, d => down (defaults to up)
    var clausesLength = $scope.phrase.clauses.length;
    var moving;
    if (d && i < (clausesLength - 1)) {
      moving = $scope.phrase.clauses[i];
      $scope.phrase.clauses[i] = $scope.phrase.clauses[i + 1];
      $scope.phrase.clauses[i + 1] = moving;
    } else if (!d && i > 0) {
      moving = $scope.phrase.clauses[i];
      $scope.phrase.clauses[i] = $scope.phrase.clauses[i - 1];
      $scope.phrase.clauses[i - 1] = moving;
    }
  };

  $scope.addWords = function(i, w) {
    $scope.phrase.clauses[i].words.push(w || "");
  };

  $scope.conditionTypeNullCheck = function(clauseIndex) {
    if ($scope.phrase.clauses[clauseIndex].condition.conditionType === null) {
      $scope.phrase.clauses[clauseIndex].condition = null;
    }
  };
});

