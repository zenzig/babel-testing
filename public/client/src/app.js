import angular from 'angular';
import 'angular-ui-router';

angular.module('olympics',["ui.router"  ])
.config(($stateProvider, $urlRouterProvider) => {
  
    $urlRouterProvider.otherwise("/sports");
    
    $stateProvider
    
    .state('sports', {
        url: "/sports",
        templateUrl: "client/sports/sports-nav.html"
    })
    
    .state('sports.medals', {
        url: "/:sportName",
        templateUrl: "client/sports/sports-medals.html"
    });
})

.controller('sportsController', function($http){
// this.sports = ["weightlifting", "cycling"];
  $http.get('http://admin.zenzig.com:3000/api/sports').then((response) => {
    this.sports = response.data;
  });
});






