angular.module("app", ["ngMaterial"])
  .controller("MainController", function($scope, $interval, $http)
  {
    $scope.apiKey = "e3127c13785a193febbce02a51ae8de0";
    $scope.yahooRootUrl = "http://query.yahooapis.com/v1/public/yql";
    $scope.wundergroundRootUrl = "http://api.wunderground.com/api/2386afd534e1e8ee/forecast/q";
    $scope.googleApiKey = "AIzaSyBI6lLX6FAmIo1XJSVzMQaLGZR7_SwPtTk";
    $scope.weatherLocations = [];
    $scope.userThinksHasOff = "";

    $scope.calculations = {};

    $scope.updateWeather = function () {
      $.get("http://api.wunderground.com/api/2386afd534e1e8ee/hourly/q/" + $scope.zip + ".json", null, function (response) {
        var tonightSnow = 0.0;

        for(var key in response.hourly_forecast)
        {
          var hour = response.hourly_forecast[key];

          tonightSnow += parseFloat(hour.snow.english);
        }

        console.log(tonightSnow);

        var percentageCalc = tonightSnow;
        if(tonightSnow > 0) {
          percentageCalc = percentageCalc * (1 + ($scope.snowDaysThisYear / 4));
          percentageCalc = percentageCalc + ($scope.userThinksHasOff ? 1 : 0.01);
        }else
        {
          $scope.weatherMessage = "Sorry, there's just not enough snowfall for school to be cancelled."
          percentageCalc = 0.01;
        }

        $scope.percentageOff = (percentageCalc / 9.0) * 100;
        $scope.percentageOff = Math.max(0, Math.min($scope.percentageOff, 99));
        $scope.percentageAnimationDisplay = 0;
        $scope.$apply();
        $("#resultProgress").css({'width': $scope.percentageOff + "%"});
        $interval(function(){
          $scope.percentageAnimationDisplay++;
        }, 400.0 / $scope.percentageOff, $scope.percentageOff, true);
      })
    };

    $scope.selectedItemChange = function () {
      console.log("Change");
      var service = new google.maps.places.PlacesService(document.getElementById("hidden"));
      service.getDetails({placeId: $scope.selectedLocation.place_id}, function (place, status) {
        console.log(place);
        for(var key in place.address_components)
        {
          var comp = place.address_components[key];

          if(comp.types.indexOf("postal_code") > -1)
          {
            $scope.zip = comp.long_name;
          }
        }

        console.log($scope.zip);
      });
    };

    $scope.locationSearchChange = function () {
      var service = new google.maps.places.AutocompleteService();

      service.getQueryPredictions({input: $scope.locationSearchText}, function (predictions) {
        $scope.locations = predictions;
        $scope.$apply();
      })
    }
  })
  .filter("LocationsFilter", function () {
    return function (locations) {
      var newArray = [];

      for(var locationKey in locations)
      {
        var location = locations[locationKey];

        newArray.push(location);
      }

      return newArray;
    }
  });
