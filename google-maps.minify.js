angular.module('googleMaps', [])
    
    .controller('googleMapsSettingsCtrl', ['$scope', '$http', '$rootScope', 'ngDialog', function($scope, $http, $rootScope, ngDialog){
        $scope.google = {};
        $scope.markerSrc = 'core/img/image.svg';
        
        // Get settings
        $http.get('modules/google-maps/app/settings.php?settings=true')
        .success(function(data){
            $scope.google.style = angular.fromJson(data)['style'];
            $scope.google.marker = angular.fromJson(data)['marker'];
            $scope.markerSrc = $scope.google.marker;
        });
        
        // Add a custom marker
        $scope.uploadMarker = function(){
            ngDialog.open({ template: 'core/html/modal.html', data: angular.toJson({ id: 'google-marker' }) });
        };
        
        // Watch for edits to the marker
        $scope.$on('choseFile', function(event, data){
            if(data.id === 'google-marker'){
                $scope.google.marker = data.src;
                $scope.markerSrc = $scope.google.marker;
            }
        });
        
        // Save custom style
        $scope.save = function(){
            $http.post('modules/google-maps/app/settings.php', { marker: $scope.google.marker, style: $scope.google.style })
            .success(function(data){
                $rootScope.$broadcast('notify', { message: 'Settings updated' });
            }).error(function(data){
                $rootScope.$broadcast('notify', { message: 'Error' });
            });
        };
    }])
    
    .directive('googleMap', ['$rootScope', '$http', function($rootScope, $http){
        return {
            template: '<div id="map-canvas"></div>',
            link: function(scope, elm, attrs){
                
                // Get custom styles
                $http.get('modules/google-maps/app/settings.php?settings=true')
                .success(function(data){
                    var googleMapStyle = angular.fromJson(angular.fromJson(data)['style']);
                    if(angular.fromJson(data)['marker'])
                        var marker = angular.fromJson(data)['marker'];
                    console.log(marker);
                    
                    // Google Map from Latitude and Longitude
                    if(attrs.latitude && attrs.longitude){
                        var latitude = attrs.latitude;
                        var longitude = attrs.longitude;
                        var location = new google.maps.LatLng(latitude, longitude);
                        
                        var mapOptions = {
                            center: location,
                            zoom: 12,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            styles: googleMapStyle
                        };
                        
                        var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                        var driverMarker = new google.maps.Marker({
                                position: location,
                                map: map,
                                icon: marker
                            });
                    } else {
                        var geocoder = new google.maps.Geocoder();
                        var geocoderRequest = { address: attrs.googleMap };
                        geocoder.geocode(geocoderRequest, function(results, status){
                            if(results){
                                if(results[0].geometry.location.k){
                                    var latitude = results[0].geometry.location.k;
                                    var longitude = results[0].geometry.location.B;
                                    
                                    // Google Map
                                    var location = new google.maps.LatLng(latitude, longitude);

                                    var mapOptions = {
                                        center: location,
                                        zoom: 12,
                                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                                        styles: googleMapStyle
                                    };

                                    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                                    var driverMarker = new google.maps.Marker({
                                        position: location,
                                        map: map,
                                        icon: marker
                                    });
                                } else // Address wasn't found by google
                                    $rootScope.$broadcast('notify', { message: 'Address not found' });
                            }
                        });
                    }
                });
            }
        };
    }]);