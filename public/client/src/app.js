import angular from 'angular';
import 'angular-ui-router';

angular.module('olympics',["ui.router"  ])


.config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/sports');
    
    $stateProvider
    .state('sports', {
        url: '/sports',
        templateUrl: 'client/sports/sports-nav.html',
        resolve: {
          sportsService: function($http) {
            return $http.get('http://admin.zenzig.com:3000/api/sports');
          }  
        },
        
        controller: function(sportsService){
          this.sports = sportsService.data; 
        },
        controllerAs: 'sportsCtrl'
    })
    
    .state('sports.medals', {
        url: "/:sportName",
        templateUrl: "client/sports/sports-medals.html",
        resolve: {
            sportService: function($q){
                return $q((resolve, reject) => {
                    let sport = {
                        "name": "Cycling",
                        "goldMedals": [{
                            "division": "Womens",
                            "country": "Australia",
                            "year": 2012
                        }, {
                            "division": "Mens",
                            "country": "UK",
                            "year": 2012
                        }]
                    };
                    resolve({data: sport});
                })
                
            }
        },
        controller: function(sportService){
            this.sport = sportService.data;
        },
        controllerAs: 'sportCtrl'
        
    });
});


