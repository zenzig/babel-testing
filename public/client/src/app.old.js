import angular from 'angular';
import 'angular-ui-router';

angular.module('olympics',['ui.router'])
    
.controller('sportsController', function($http){
// this.sports = ["weightlifting", "cycling"];
  $http.get('http://localhost:3000/api/sports').then((response) => {
    this.sports = response.data;
  });
})

.config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/sports');
    
    $stateProvider
    .state('sports ', {
    url: '/sports',
    templateUrl: 'client/sports/sports-nav.html'
    })
    .state('sports.medals', {
        url: 'sports/:sportName',
        templateUrl: 'client/sports/sports-medals.html'
    });
})


.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
})

.factory('Auth', function($http, $q, AuthToken) {
	var authFactory = {};
	authFactory.login = function(username, password) {
		return $http.post('/api/authenticate', {
			username: username,
			password: password 
		})
		.success(function(data) {
			AuthToken.setToken(data.token);
       		return data;
		});
	};
	authFactory.logout = function() {
		// clear the token
		AuthToken.setToken();
	};
	authFactory.isLoggedIn = function() {
		if (AuthToken.getToken()) 
			return true;
		else
			return false;	
	};
	authFactory.getUser = function() {
		if (AuthToken.getToken())
			return $http.get('/api/me', { cache: true });
		else
			return $q.reject({ message: 'User has no token.' });		
	};
	return authFactory;
})

.factory('AuthToken', function($window) {

	var authTokenFactory = {};
	authTokenFactory.getToken = function() {
		return $window.localStorage.getItem('token');
	};
	authTokenFactory.setToken = function(token) {
		if (token)
			$window.localStorage.setItem('token', token);
	 	else
			$window.localStorage.removeItem('token');
	};
	return authTokenFactory;
})

.factory('AuthInterceptor', function($q, $location, AuthToken) {
	var interceptorFactory = {};
	interceptorFactory.request = function(config) {
		var token = AuthToken.getToken();
		if (token) 
			config.headers['x-access-token'] = token;
		return config;
	};
	interceptorFactory.responseError = function(response) {
		if (response.status == 403) {
			AuthToken.setToken();
			$location.path('/login');
		}
		return $q.reject(response);
	};
	return interceptorFactory;
})

.controller('mainController', function($rootScope, $location, Auth) {
	var vm = this;
	vm.loggedIn = Auth.isLoggedIn();
	$rootScope.$on('$routeChangeStart', function() {
		vm.loggedIn = Auth.isLoggedIn();	
		Auth.getUser()
			.then(function(data) {
				vm.user = data.data;
			});	
	});	

	vm.doLogin = function() {
		vm.processing = true;
		vm.error = '';
		Auth.login(vm.loginData.username, vm.loginData.password)
			.success(function(data) {
				vm.processing = false;			
				if (data.success)			
					$location.path('/users');
				else 
					vm.error = data.message;
				
			});
	};

	vm.doLogout = function() {
		Auth.logout();
		$location.path('/login');
	};

});




