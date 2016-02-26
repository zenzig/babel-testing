import angular from 'angular';

angular.module('olympics',[])

.controller('sportsController', function($http){
 this.sports = ["weightlifting", "cycling"];
//  $http.get('/sports').then((response) => {
//    this.sports = response.data;
//  });
});
