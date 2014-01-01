such.factory("User", function($resource) {
  return $resource('/u/:userId', { userId: '@_id' }, {
    me: {method: 'GET', params: {userId: 'me'}, isArray: false},
    byUsername: {method: 'GET', params: {userId: 'username1'}, isArray: false}
  });
});

such.factory("Explanation", function($resource) {
  return $resource('/e/:eId', { 
    eId: "@_id"
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

such.factory("Notifications", function($interval, $window) {
  // Notification Object
  // {
  //   bsType: "success|info|warning|danger",
  //   description: "Important" optional
  // TODO display notification description!
  //   msg: "Wow it did/didn't work",
  //   keepOnPageChange: true,
  //   old: false,
  //   timeout: 10
  // }
  var notifications;
  $interval(function() {
    if (!notifications) return;
    var nl = notifications.length;
    if (nl === 0) return;
    for (var i = nl - 1; i >= 0; i--) {
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
    addFromApiResponse: function(response) {
      var res = response.data;
      if (typeof res === 'string') {
        if (response.status === 403 || response.status === 401) {
          facObj.addList([{
                           bsType: "danger",
                           msg: "Server authorisation failure! Please reload the page!",
                           keepOnPageChange: true
                         }]);
        } else {
          facObj.addList([{
                           bsType: "danger",
                           msg: "Unknown server error! Please reload the page!",
                           keepOnPageChange: true
                         }]);
        }
        return;
      }
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
    // request: function(config) {
    //   return config;
    // },
 
    // requestError: function(rejection) {
    //   return $q.reject(rejection);
    // },
    response: function(response) {
      if (response.config.url[0] != "/") return response;
      if (response.config.url == "/u/me" && (response.data.auth === 0)) {
        return $q.reject(response);
      }
      Notifications.addFromApiResponse(response);
      return response;
    },
 
    responseError: function(rejection) {
      // do something on error
      // if (canRecover(rejection)) {
      //   return responseOrNewPromise
      // }
      
      Notifications.addFromApiResponse(rejection);
      return $q.reject(rejection);
    }
  };
});

such.config(function($httpProvider) {
  $httpProvider.interceptors.push('mainInterceptor');
});

such.filter('attrEq', function() {
  return function(inputArray, attrName, attrValue) {
    var filteredArray = [];
    angular.forEach(inputArray, function(obj){
      if (!(obj[attrName])) return;
      if (attrValue && obj[attrName] == attrValue) { // Only a double equals becuase numbers :)
        filteredArray.push(obj);
      }
    });
    return filteredArray;
  };
});

such.filter('truncate', function () {
  return function (text, length, end) {
    console.log(text, length, end);
    if (isNaN(length)) length = 10;
    if (end === undefined) end = "...";
    if (text.length <= length || text.length - end.length <= length) {
      return text;
    } else {
      return String(text).substring(0, length-end.length) + end;
    }
  };
});