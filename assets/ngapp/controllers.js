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

such.controller("HomeCtrl", function($scope) {

});

such.controller("NotFoundCtrl", function($scope, Notifications) {
  Notifications.add({
    bsType: "danger",
    msg: "Page not found!"
  });
});



