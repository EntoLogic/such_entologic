such.factory("User", function($resource) {
  return $resource('/u/:username', {
    email: '@email',
    username: '@username',
    realName: '@realName',
    provider: '@provider'
  }, {
    me: {method: 'GET', params: {username: 'me'}, isArray: false}
  });
});

such.factory("Session", function($http) {
  return {
    signin: function(l, p) {
      return $http({ method: 'POST', url: "/u/in", data: {login: l, password: p} });
    },
    signout: function() {
      return $http({ method: 'POST', url: "/u/out" });
    }
  };
});

such.factory("Notifications", function($interval) {
  // Notification Object
  // {
  //   bsType: "success|info|warning|danger",
  //   title: "Important" optional
  // TODO display notification title!
  //   msg: "Wow it did/didn't work",
  //   keepOnPageChange: true,
  //   old: false,
  //   timeout: 10
  // }
  var notifications;
  $interval(function() {
    for (var i = notifications.length - 1; i >= 0; i--) {
      if (notifications[i].timeout) { notifications[i].timeout -= 1; }
      if (notifications[i].timeout === 0) {
        notifications.splice(i, 1);
      }
    }
  }, 1000);
  var facObj = {
    setNotificationArray: function(arrayFromScope) {
      notifications = arrayFromScope;
    },
    add: function(notificationObj) {
      for (var i = notifications.length - 1; i >= 0; i--) {
        if (notifications[i].msg === notificationObj.msg) {
          notifications.splice(i, 1);
        }
      }
      notifications.unshift(notificationObj);
    },
    addList: function(list) {
      for (var i = notifications.length - 1; i >= 0; i--) {
        notifications[i].old = true;
      }
      angular.forEach(list, function(n){
        facObj.add(n);
      });
    },
    addFromApiResponse: function(res) {
      var notificationsToAdd = [];
      var bsTypeMap = {errors: "danger", alerts: "info", yays: "success"};
      angular.forEach(bsTypeMap, function(bsType, apiName){
        if(res.hasOwnProperty(apiName)) {
          angular.forEach(res[apiName], function(msg){
            notificationsToAdd.unshift({
              bsType: bsType,
              // title: "Error",
              msg: msg,
              timeout: 15,
              keepOnPageChange: false,
              old: false
            });
          });
        } 
      });
      if (notificationsToAdd.length > 0) this.addList(notificationsToAdd);
      return notificationsToAdd;
    },
    pageChange: function() {
      for (var i = notifications.length - 1; i >= 0; i--) {
        if (!notifications[i].keepOnPageChange) {
          notifications.splice(i, 1);
        }
      }
    }
  };
  return facObj;
});

such.factory("mainInterceptor", function($q, Notifications) {
  return {
   //  'request': function(config) {
   //    return config || $q.when(config);
   //  },
 
   // 'requestError': function(rejection) {
   //    if (canRecover(rejection)) {
   //      return responseOrNewPromise
   //    }
   //    return $q.reject(rejection);
   //  },
    response: function(response) {
      if (response.config.url == "/u/me" && (response.data.auth === 0)) {
        return $q.reject(response);
      }
      Notifications.addFromApiResponse(response.data);
      return response;
    },
 
    responseError: function(rejection) {
      // do something on error
      // if (canRecover(rejection)) {
      //   return responseOrNewPromise
      // }
      Notifications.addFromApiResponse(rejection.data);
      return $q.reject(rejection);
    }
  };
});

such.config(function($httpProvider) {
  $httpProvider.interceptors.push('mainInterceptor');
});